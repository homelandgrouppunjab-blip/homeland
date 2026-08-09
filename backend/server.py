import os
import re
import uuid
import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query, BackgroundTasks
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr, ConfigDict

from db import db
from auth import (
    hash_password, verify_password, create_access_token, get_current_admin,
)
import seed_data
import email_utils

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Homeland Group Mohali API")
api_router = APIRouter(prefix="/api")


# ---------------- Helpers ----------------
def now_iso():
    return datetime.now(timezone.utc).isoformat()


def slugify(text: str) -> str:
    s = re.sub(r'[^a-zA-Z0-9\s-]', '', text.lower()).strip()
    s = re.sub(r'[\s_-]+', '-', s)
    return s


def clean(doc: dict) -> dict:
    if doc and '_id' in doc:
        doc.pop('_id', None)
    return doc


# ---------------- Models ----------------
class ProjectBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    slug: Optional[str] = None
    tagline: str = ""
    status: str = "UPCOMING"  # DELIVERED | ONGOING | UPCOMING
    possession: str = ""
    location: str = ""
    full_address: str = ""
    city: str = ""
    type: str = "Residential"  # Residential | Commercial | Mixed-Use
    unit_types: List[str] = []
    key_units: str = ""
    price_range: str = ""
    rera_numbers: List[str] = []
    rera_registered_date: str = ""
    rera_certificate_url: str = ""
    amenities: List[str] = []
    description: str = ""
    highlights: List[str] = []
    hero_image: str = ""
    logo_image: str = ""
    gallery: List[str] = []
    video_url: str = ""
    brochure_url: str = ""
    map_lat: Optional[float] = None
    map_lng: Optional[float] = None
    landmarks: List[str] = []
    featured: bool = False
    hot_selling: bool = False
    order: int = 99


class Project(ProjectBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class LeadCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    email: EmailStr
    phone: str
    project: str = "Any"
    requirement: str = "Residential"
    budget: str = ""
    message: str = ""
    preferred_contact_time: str = ""
    website: str = ""  # honeypot


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    project: str = "Any"
    requirement: str = "Residential"
    budget: str = ""
    message: str = ""
    preferred_contact_time: str = ""
    status: str = "new"  # new | contacted | closed
    created_at: str = Field(default_factory=now_iso)


class LoginRequest(BaseModel):
    email: str
    password: str


class TeamMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str
    expertise: str = ""
    bio: str = ""
    image: str = ""
    order: int = 99


class SiteVisitCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    email: EmailStr
    phone: str
    project: str = "Any"
    visit_date: str = ""
    time_slot: str = ""
    guests: str = ""
    notes: str = ""
    website: str = ""  # honeypot


class SiteVisit(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    project: str = "Any"
    visit_date: str = ""
    time_slot: str = ""
    guests: str = ""
    notes: str = ""
    status: str = "new"  # new | confirmed | completed | cancelled
    created_at: str = Field(default_factory=now_iso)



# ---------------- Seeding ----------------
async def seed_database():
    # Admin user
    admin_email = os.environ.get('ADMIN_EMAIL', 'admin@homelandgroup.org')
    admin_pw = os.environ.get('ADMIN_PASSWORD', 'Homeland@2013')
    existing_admin = await db.admins.find_one({"email": admin_email})
    if not existing_admin:
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_pw),
            "created_at": now_iso(),
        })
        logger.info("Seeded admin user")

    # Projects
    if await db.projects.count_documents({}) == 0:
        for p in seed_data.PROJECTS:
            proj = Project(**p)
            if not proj.slug:
                proj.slug = slugify(proj.name)
            await db.projects.insert_one(proj.model_dump())
        logger.info("Seeded projects")

    # Site content
    if await db.site_content.count_documents({"key": "main"}) == 0:
        await db.site_content.insert_one(seed_data.SITE_CONTENT.copy())
        logger.info("Seeded site content")

    # FAQs stored inside a doc
    if await db.faqs.count_documents({}) == 0:
        for i, f in enumerate(seed_data.FAQS):
            await db.faqs.insert_one({"id": str(uuid.uuid4()), "q": f["q"], "a": f["a"], "order": i})
        logger.info("Seeded faqs")

    # Team
    if await db.team.count_documents({}) == 0:
        for t in seed_data.TEAM:
            tm = TeamMember(**t)
            await db.team.insert_one(tm.model_dump())
        logger.info("Seeded team")

    # Migration: ensure Regalia has its brand logo
    await db.projects.update_one(
        {"slug": "homeland-regalia"},
        {"$set": {"logo_image": "/regalia-logo.png"}},
    )


@app.on_event("startup")
async def on_startup():
    await seed_database()


# ---------------- Public Routes ----------------
@api_router.get("/")
async def root():
    return {"message": "Homeland Group Mohali API", "status": "ok"}


@api_router.get("/projects")
async def list_projects(
    status: Optional[str] = None,
    type: Optional[str] = None,
    city: Optional[str] = None,
    featured: Optional[bool] = None,
    hot_selling: Optional[bool] = None,
    search: Optional[str] = None,
    sort: Optional[str] = "order",
):
    query = {}
    if status:
        query["status"] = status
    if type:
        query["type"] = type
    if city:
        query["city"] = city
    if featured is not None:
        query["featured"] = featured
    if hot_selling is not None:
        query["hot_selling"] = hot_selling
    if search:
        rx = {"$regex": re.escape(search), "$options": "i"}
        query["$or"] = [{"name": rx}, {"location": rx}, {"city": rx}, {"description": rx}, {"type": rx}]

    docs = await db.projects.find(query, {"_id": 0}).to_list(500)

    sort_key = {"order": "order", "name": "name"}.get(sort, "order")
    status_rank = {"ONGOING": 0, "DELIVERED": 1, "UPCOMING": 2}
    if sort == "status":
        docs.sort(key=lambda d: (status_rank.get(d.get("status"), 9), d.get("order", 99)))
    elif sort == "name":
        docs.sort(key=lambda d: d.get("name", ""))
    else:
        docs.sort(key=lambda d: d.get(sort_key, 99))
    return docs


@api_router.get("/projects/{slug}")
async def get_project(slug: str):
    doc = await db.projects.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        doc = await db.projects.find_one({"id": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    return doc


@api_router.get("/content")
async def get_content():
    doc = await db.site_content.find_one({"key": "main"}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Content not found")
    return doc


@api_router.get("/team")
async def get_team():
    docs = await db.team.find({}, {"_id": 0}).to_list(100)
    docs.sort(key=lambda d: d.get("order", 99))
    return docs


@api_router.get("/faqs")
async def get_faqs():
    docs = await db.faqs.find({}, {"_id": 0}).to_list(100)
    docs.sort(key=lambda d: d.get("order", 99))
    return docs


@api_router.get("/rera")
async def get_rera():
    docs = await db.projects.find({}, {"_id": 0}).to_list(500)
    out = []
    for d in docs:
        out.append({
            "project": d.get("name"),
            "slug": d.get("slug"),
            "status": d.get("status"),
            "location": d.get("location"),
            "rera_numbers": d.get("rera_numbers", []),
            "rera_registered_date": d.get("rera_registered_date", ""),
            "rera_certificate_url": d.get("rera_certificate_url", ""),
        })
    out.sort(key=lambda d: d.get("project", ""))
    return out


@api_router.get("/brochures")
async def get_brochures():
    docs = await db.projects.find({}, {"_id": 0}).to_list(500)
    out = []
    for d in docs:
        out.append({
            "project": d.get("name"),
            "slug": d.get("slug"),
            "status": d.get("status"),
            "location": d.get("location"),
            "type": d.get("type"),
            "hero_image": d.get("hero_image"),
            "brochure_url": d.get("brochure_url", ""),
        })
    out.sort(key=lambda d: d.get("order", 99) if isinstance(d.get("order"), int) else 99)
    return out


@api_router.post("/leads", response_model=Lead)
async def create_lead(payload: LeadCreate, background: BackgroundTasks):
    # Honeypot: silently accept but don't store bots
    if payload.website:
        return Lead(name=payload.name, email=str(payload.email), phone=payload.phone)
    lead = Lead(
        name=payload.name, email=str(payload.email), phone=payload.phone,
        project=payload.project, requirement=payload.requirement, budget=payload.budget,
        message=payload.message, preferred_contact_time=payload.preferred_contact_time,
    )
    await db.leads.insert_one(lead.model_dump())
    logger.info(f"New lead: {lead.name} / {lead.project}")
    subject, html = email_utils.lead_email(lead.model_dump())
    background.add_task(email_utils.send_notification, subject, html)
    return lead


@api_router.post("/site-visits", response_model=SiteVisit)
async def create_site_visit(payload: SiteVisitCreate, background: BackgroundTasks):
    if payload.website:
        return SiteVisit(name=payload.name, email=str(payload.email), phone=payload.phone)
    visit = SiteVisit(
        name=payload.name, email=str(payload.email), phone=payload.phone, project=payload.project,
        visit_date=payload.visit_date, time_slot=payload.time_slot, guests=payload.guests, notes=payload.notes,
    )
    await db.site_visits.insert_one(visit.model_dump())
    logger.info(f"New site visit: {visit.name} / {visit.project} / {visit.visit_date}")
    subject, html = email_utils.visit_email(visit.model_dump())
    background.add_task(email_utils.send_notification, subject, html)
    return visit


# ---------------- Admin: Auth ----------------
@api_router.post("/admin/login")
async def admin_login(payload: LoginRequest):
    admin = await db.admins.find_one({"email": payload.email})
    if not admin or not verify_password(payload.password, admin.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": payload.email})
    return {"access_token": token, "token_type": "bearer", "email": payload.email}


@api_router.get("/admin/me")
async def admin_me(admin=Depends(get_current_admin)):
    return admin


@api_router.get("/admin/stats")
async def admin_stats(admin=Depends(get_current_admin)):
    total_projects = await db.projects.count_documents({})
    delivered = await db.projects.count_documents({"status": "DELIVERED"})
    ongoing = await db.projects.count_documents({"status": "ONGOING"})
    upcoming = await db.projects.count_documents({"status": "UPCOMING"})
    total_leads = await db.leads.count_documents({})
    new_leads = await db.leads.count_documents({"status": "new"})
    total_visits = await db.site_visits.count_documents({})
    new_visits = await db.site_visits.count_documents({"status": "new"})
    return {
        "total_projects": total_projects,
        "delivered": delivered,
        "ongoing": ongoing,
        "upcoming": upcoming,
        "total_leads": total_leads,
        "new_leads": new_leads,
        "total_visits": total_visits,
        "new_visits": new_visits,
    }


# ---------------- Admin: Projects CRUD ----------------
@api_router.post("/admin/projects", response_model=Project)
async def create_project(payload: ProjectBase, admin=Depends(get_current_admin)):
    proj = Project(**payload.model_dump())
    if not proj.slug:
        proj.slug = slugify(proj.name)
    existing = await db.projects.find_one({"slug": proj.slug})
    if existing:
        proj.slug = f"{proj.slug}-{proj.id[:6]}"
    await db.projects.insert_one(proj.model_dump())
    return proj


@api_router.put("/admin/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, payload: ProjectBase, admin=Depends(get_current_admin)):
    existing = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Project not found")
    data = payload.model_dump()
    if not data.get("slug"):
        data["slug"] = slugify(data["name"])
    data["id"] = project_id
    data["created_at"] = existing.get("created_at", now_iso())
    data["updated_at"] = now_iso()
    await db.projects.replace_one({"id": project_id}, data)
    return Project(**data)


@api_router.delete("/admin/projects/{project_id}")
async def delete_project(project_id: str, admin=Depends(get_current_admin)):
    res = await db.projects.delete_one({"id": project_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"success": True}


@api_router.get("/admin/projects")
async def admin_list_projects(admin=Depends(get_current_admin)):
    docs = await db.projects.find({}, {"_id": 0}).to_list(500)
    docs.sort(key=lambda d: d.get("order", 99))
    return docs


# ---------------- Admin: Leads ----------------
@api_router.get("/admin/leads")
async def admin_list_leads(admin=Depends(get_current_admin)):
    docs = await db.leads.find({}, {"_id": 0}).to_list(1000)
    docs.sort(key=lambda d: d.get("created_at", ""), reverse=True)
    return docs


@api_router.put("/admin/leads/{lead_id}")
async def update_lead(lead_id: str, body: dict, admin=Depends(get_current_admin)):
    res = await db.leads.update_one({"id": lead_id}, {"$set": {"status": body.get("status", "new")}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    doc = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    return doc


@api_router.delete("/admin/leads/{lead_id}")
async def delete_lead(lead_id: str, admin=Depends(get_current_admin)):
    res = await db.leads.delete_one({"id": lead_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"success": True}


# ---------------- Admin: Site Visits ----------------
@api_router.get("/admin/site-visits")
async def admin_list_visits(admin=Depends(get_current_admin)):
    docs = await db.site_visits.find({}, {"_id": 0}).to_list(1000)
    docs.sort(key=lambda d: d.get("created_at", ""), reverse=True)
    return docs


@api_router.put("/admin/site-visits/{visit_id}")
async def update_visit(visit_id: str, body: dict, admin=Depends(get_current_admin)):
    res = await db.site_visits.update_one({"id": visit_id}, {"$set": {"status": body.get("status", "new")}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Site visit not found")
    doc = await db.site_visits.find_one({"id": visit_id}, {"_id": 0})
    return doc


@api_router.delete("/admin/site-visits/{visit_id}")
async def delete_visit(visit_id: str, admin=Depends(get_current_admin)):
    res = await db.site_visits.delete_one({"id": visit_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Site visit not found")
    return {"success": True}


# ---------------- Admin: Content ----------------
@api_router.put("/admin/content")
async def update_content(body: dict, admin=Depends(get_current_admin)):
    body["key"] = "main"
    body.pop("_id", None)
    await db.site_content.replace_one({"key": "main"}, body, upsert=True)
    doc = await db.site_content.find_one({"key": "main"}, {"_id": 0})
    return doc


# ---------------- Admin: Team ----------------
@api_router.post("/admin/team", response_model=TeamMember)
async def create_team(payload: TeamMember, admin=Depends(get_current_admin)):
    data = payload.model_dump()
    await db.team.insert_one(data)
    return payload


@api_router.put("/admin/team/{member_id}", response_model=TeamMember)
async def update_team(member_id: str, payload: TeamMember, admin=Depends(get_current_admin)):
    data = payload.model_dump()
    data["id"] = member_id
    res = await db.team.replace_one({"id": member_id}, data)
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
    return TeamMember(**data)


@api_router.delete("/admin/team/{member_id}")
async def delete_team(member_id: str, admin=Depends(get_current_admin)):
    res = await db.team.delete_one({"id": member_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
    return {"success": True}


# ---------------- Admin: FAQs ----------------
@api_router.post("/admin/faqs")
async def create_faq(body: dict, admin=Depends(get_current_admin)):
    doc = {"id": str(uuid.uuid4()), "q": body.get("q", ""), "a": body.get("a", ""), "order": body.get("order", 99)}
    await db.faqs.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/admin/faqs/{faq_id}")
async def update_faq(faq_id: str, body: dict, admin=Depends(get_current_admin)):
    await db.faqs.update_one({"id": faq_id}, {"$set": {"q": body.get("q", ""), "a": body.get("a", ""), "order": body.get("order", 99)}})
    doc = await db.faqs.find_one({"id": faq_id}, {"_id": 0})
    return doc


@api_router.delete("/admin/faqs/{faq_id}")
async def delete_faq(faq_id: str, admin=Depends(get_current_admin)):
    await db.faqs.delete_one({"id": faq_id})
    return {"success": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    from db import client
    client.close()
