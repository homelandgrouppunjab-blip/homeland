"""One-off sync: replace projects + team with data from official homelandgroup.org."""
import asyncio
import uuid
from datetime import datetime, timezone

from db import db

def now_iso():
    return datetime.now(timezone.utc).isoformat()

VIDEO = "https://www.youtube.com/embed/1O6Qstncpnc"
G_RES = [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
]
G_COM = [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
]
G_VILLA = [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
]

DEFAULTS = dict(
    tagline="", possession="", full_address="", key_units="", price_range="Coming Soon",
    rera_numbers=[], rera_registered_date="", rera_certificate_url="", amenities=[], highlights=[],
    logo_image="", gallery=[], video_url="", brochure_url="https://www.homelandgroup.org",
    map_lat=None, map_lng=None, landmarks=[], featured=False, hot_selling=False,
)

PROJECTS = [
    {**DEFAULTS,
        "name": "Homeland Regalia", "slug": "homeland-regalia",
        "tagline": "The Most Powerful Address in Punjab \u2014 Reserved for the Exclusive Few.",
        "status": "ONGOING", "possession": "Possession by Dec 2026",
        "location": "Sector 77, Mohali", "full_address": "Sector 77, International Airport Road, Mohali, Punjab 160070",
        "city": "Mohali", "type": "Residential", "unit_types": ["3 BHK", "4 BHK", "5 BHK"],
        "key_units": "6 Iconic Towers \u00b7 3/4/5 BHK Sky Residences", "price_range": "\u20b91.85 Cr onwards",
        "rera_numbers": ["PBRERA-SAS81-PR0757"], "rera_registered_date": "2021-08-12",
        "amenities": ["World-class Concierge", "All-season Indoor Pool", "Fitness Zones", "Landscaped Gardens",
            "Grand Clubhouse", "Children's Play Areas", "Indoor AC Basketball Court", "Full-size Tennis Court",
            "Yoga & Meditation Deck", "Club Deck with Bar & Cafe", "Reflexology Plaza"],
        "description": "Experience ultra-luxury living at Homeland Regalia, a premium residential landmark designed as a true symbol of royalty. With six iconic towers, it offers a royal lifestyle with top-tier amenities and effortless access to leading educational institutions, healthcare, shopping and business hubs.",
        "highlights": ["6 iconic towers with panoramic Shivalik views", "3-side open sky residences with private decks",
            "On International Airport Road, Sector 77", "Grand triple-height entrance lobby"],
        "hero_image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
        "logo_image": "/regalia-logo.png", "gallery": G_RES, "video_url": VIDEO, "brochure_url": "https://homelandregalia.com",
        "map_lat": 30.6788, "map_lng": 76.7369,
        "landmarks": ["3 min to Airport Road", "10 min to ISB Mohali", "12 min to Fortis Hospital"],
        "featured": True, "hot_selling": True, "order": 1},

    {**DEFAULTS,
        "name": "Homeland Global Park", "slug": "homeland-global-park",
        "tagline": "A Global-Scale Destination for Retail, Business & Lifestyle.",
        "status": "ONGOING", "possession": "Possession by 2027",
        "location": "New Chandigarh", "full_address": "IT City Road, New Chandigarh, Punjab",
        "city": "New Chandigarh", "type": "Mixed-Use", "unit_types": ["Ultra-luxury Mall", "Retail", "Business Suites", "Serviced Residences"],
        "key_units": "Ultra-luxury Mall \u00b7 Global Retail \u00b7 Business Suites \u00b7 Elite Serviced Residences",
        "price_range": "\u20b942 Lac onwards", "rera_numbers": ["PBRERA-SAS82-PR0921"], "rera_registered_date": "2022-06-18",
        "amenities": ["Ultra-luxury Mall", "Global Retail Brands", "High-end Business Suites", "Elite Serviced Residences",
            "Multiplex & Entertainment", "Fine-dining Zones", "Smart Parking", "Grand Central Plaza"],
        "description": "Homeland Global Park is an ultra-luxury mixed-use destination bringing global retail brands, high-end business suites and elite serviced residences together in North India. Designed at a global scale, it is set to redefine the region's commercial and lifestyle landscape.",
        "highlights": ["Ultra-luxury mall with global brands", "Prime IT City / New Chandigarh location",
            "Retail + business + serviced residences", "Investment-grade commercial spaces"],
        "hero_image": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1600&q=80",
        "gallery": G_COM, "video_url": VIDEO, "map_lat": 30.7833, "map_lng": 76.6667,
        "landmarks": ["IT City New Chandigarh", "Near Medicity", "15 min to PGI Chandigarh"],
        "featured": True, "hot_selling": True, "order": 2},

    {**DEFAULTS,
        "name": "Homeland Heights", "slug": "homeland-heights",
        "tagline": "Elevated Living in the Heart of Mohali.",
        "status": "DELIVERED", "possession": "Delivered 2018",
        "location": "Sector 70, Mohali", "full_address": "Sector 70, Mohali, Punjab 160071",
        "city": "Mohali", "type": "Residential", "unit_types": ["2 BHK", "3 BHK"],
        "key_units": "Spacious 2 & 3 BHK Premium Apartments", "price_range": "\u20b985 Lac onwards",
        "rera_numbers": ["PBRERA-SAS79-PR0231"], "rera_registered_date": "2017-03-20",
        "amenities": ["Landscaped Central Green", "Community Clubhouse", "Gymnasium", "Kids Play Area",
            "24x7 Security", "Power Backup", "Covered Parking", "Jogging Track"],
        "description": "Homeland Heights offers spacious apartments with world-class amenities and excellent connectivity in the heart of Mohali. Successfully delivered in 2018, it remains a benchmark for quality construction and is home to hundreds of happy families.",
        "highlights": ["Successfully delivered & fully occupied", "Prime Sector 70 location",
            "Vaastu-compliant spacious layouts", "Well-connected to Chandigarh & Airport"],
        "hero_image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80",
        "gallery": G_RES, "video_url": VIDEO, "map_lat": 30.7046, "map_lng": 76.7179,
        "landmarks": ["5 min to Sector 70 Market", "8 min to Chandigarh border", "10 min to Mohali Bus Stand"],
        "order": 3},

    {**DEFAULTS,
        "name": "CP67", "slug": "cp67",
        "tagline": "Where Life, Work, Shopping & Entertainment Converge.",
        "status": "DELIVERED", "possession": "Operational",
        "location": "Sector 67, Mohali", "full_address": "CP67 Mall, Sector 67, Mohali, Punjab 160062",
        "city": "Mohali", "type": "Commercial", "unit_types": ["Retail Shops", "Food Court", "Office Suites"],
        "key_units": "Retail \u00b7 F&B \u00b7 Standardized Business Spaces", "price_range": "On Request",
        "rera_numbers": ["PBRERA-SAS80-PR0198"], "rera_registered_date": "2016-11-05",
        "amenities": ["High-street Retail", "Multi-brand Food Hub", "Ample Parking", "Central Atrium",
            "Escalators & Lifts", "24x7 Security", "Power Backup", "High Footfall"],
        "description": "CP67 is a landmark commercial destination in Mohali where life, work, shopping, dining and entertainment converge seamlessly. A thriving hub bringing together retail, F&B and business under one iconic address.",
        "highlights": ["Established retail & F&B destination", "High daily footfall", "Busy Sector 67 location", "Proven rental returns"],
        "hero_image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
        "gallery": G_COM, "video_url": VIDEO, "map_lat": 30.7011, "map_lng": 76.7285,
        "landmarks": ["In Sector 67 Mohali", "5 min to Phase 7 Market", "10 min to Chandigarh"],
        "order": 4},

    {**DEFAULTS,
        "name": "Homeland Infinia", "slug": "homeland-infinia",
        "tagline": "Grandstand View Residences in New Chandigarh.",
        "status": "ONGOING", "possession": "Possession by Jun 2027",
        "location": "New Chandigarh", "full_address": "Mullanpur, New Chandigarh, Punjab 140901",
        "city": "New Chandigarh", "type": "Residential", "unit_types": ["3 BHK", "4 BHK"],
        "key_units": "Grandstand View Premium Residences", "price_range": "\u20b91.10 Cr onwards",
        "rera_numbers": ["PBRERA-SAS83-PR1044"], "rera_registered_date": "2023-01-30",
        "amenities": ["Clubhouse", "Swimming Pool", "Landscaped Gardens", "Gymnasium", "Indoor Games",
            "Amphitheatre", "Jogging & Cycling Track", "Kids Play Zone", "24x7 Security"],
        "description": "Homeland Infinia offers grandstand-view residences in the green, planned township of New Chandigarh (Mullanpur). Enjoy premium amenities, wide open spaces and clean air at the foothills of the Shivaliks, with excellent connectivity to Chandigarh.",
        "highlights": ["Foothills of the Shivaliks", "Planned green township of New Chandigarh",
            "Low-density premium living", "Close to Medicity & educational hubs"],
        "hero_image": "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80",
        "gallery": G_RES, "video_url": VIDEO, "brochure_url": "https://www.homelandchandigarh.in",
        "map_lat": 30.7900, "map_lng": 76.6900,
        "landmarks": ["Mullanpur New Chandigarh", "Near Tata Camelot", "10 min to Chandigarh"],
        "order": 5},

    {**DEFAULTS,
        "name": "Homeland Leisure Valley", "slug": "homeland-leisure-valley",
        "tagline": "Boutique 4 & 5 BHK Residences on the Mohali-Chandigarh Border.",
        "status": "UPCOMING", "possession": "Launching Soon",
        "location": "Sector 62, Mohali", "full_address": "Sector 62, Mohali-Chandigarh Border, Punjab",
        "city": "Mohali", "type": "Residential", "unit_types": ["4 BHK", "5 BHK"],
        "key_units": "Boutique 4 & 5 BHK Residences", "price_range": "Coming Soon",
        "rera_numbers": ["RERA Application In Process"],
        "amenities": ["Boutique Clubhouse", "Swimming Pool", "Landscaped Greens", "Gymnasium", "Kids Play Area", "24x7 Security"],
        "description": "Homeland Leisure Valley is an upcoming boutique development of spacious 4 & 5 BHK residences at Sector 62, right on the Mohali-Chandigarh border \u2014 offering exclusivity, greenery and unmatched connectivity.",
        "highlights": ["Boutique low-density living", "Sector 62 \u2014 Mohali-Chandigarh border",
            "Spacious 4 & 5 BHK homes", "Register early for priority allotment"],
        "hero_image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
        "gallery": G_RES, "map_lat": 30.7267, "map_lng": 76.7392,
        "landmarks": ["Sector 62 Mohali", "Mohali-Chandigarh border", "5 min to Chandigarh Sector 51"],
        "order": 6},

    {**DEFAULTS,
        "name": "Homeland Ranjit Avenue", "slug": "homeland-ranjit-avenue",
        "tagline": "A New Icon Rising in the Holy City of Amritsar.",
        "status": "UPCOMING", "possession": "Launching Soon",
        "location": "Ranjit Avenue, Amritsar", "full_address": "Ranjit Avenue, Amritsar, Punjab 143001",
        "city": "Amritsar", "type": "Mixed-Use", "unit_types": ["To be announced"],
        "key_units": "Premium Residences & Retail (Details Coming Soon)", "price_range": "Coming Soon",
        "rera_numbers": ["RERA Application In Process"],
        "amenities": ["Premium Clubhouse", "Landscaped Greens", "Retail Promenade", "Smart Security"],
        "description": "Homeland Ranjit Avenue marks the Group's prestigious entry into the holy city at the coveted Ranjit Avenue address. A landmark mixed-use development bringing premium living and retail to Amritsar.",
        "highlights": ["Prime Ranjit Avenue location", "Mixed-use premium development",
            "Group's flagship entry into Amritsar", "Register early for priority allotment"],
        "hero_image": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80",
        "gallery": G_RES, "map_lat": 31.6340, "map_lng": 74.8723,
        "landmarks": ["Ranjit Avenue Amritsar", "Near District Shopping Complex", "15 min to Golden Temple"],
        "order": 7},

    {**DEFAULTS,
        "name": "Homeland Vaana", "slug": "homeland-vaana",
        "tagline": "Luxury Hillside Villas Amidst Himalayan Serenity.",
        "status": "UPCOMING", "possession": "Launching Soon",
        "location": "Dharampur, Himachal Pradesh", "full_address": "Dharampur, Himachal Pradesh",
        "city": "Dharampur", "type": "Vacation Home", "unit_types": ["Luxury Villas"],
        "key_units": "Ultra-luxury Hillside Villas", "price_range": "Coming Soon",
        "rera_numbers": ["RERA Application In Process"],
        "amenities": ["Private Villas", "Panoramic Valley Views", "Clubhouse", "Infinity Pool", "Nature Trails", "Concierge Service"],
        "description": "Homeland Vaana is an upcoming collection of ultra-luxury hillside villas in Dharampur, Himachal Pradesh \u2014 a serene retreat amidst the Himalayas, designed for those who seek nature, privacy and refined comfort.",
        "highlights": ["Luxury villas in the Himalayan foothills", "Panoramic valley views",
            "Perfect second-home & vacation retreat", "Register early for priority allotment"],
        "hero_image": "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=80",
        "gallery": G_VILLA, "map_lat": 30.8667, "map_lng": 77.0167,
        "landmarks": ["Dharampur, Himachal Pradesh", "Near Kasauli", "Himalayan foothills"],
        "order": 8},

    {**DEFAULTS,
        "name": "Ikaahi Homes", "slug": "ikaahi-homes",
        "tagline": "Vacation Homes in the Heart of Goa.",
        "status": "UPCOMING", "possession": "Launching Soon",
        "location": "Goa", "full_address": "Goa, India",
        "city": "Goa", "type": "Vacation Home", "unit_types": ["Vacation Villas", "Apartments"],
        "key_units": "Boutique Vacation Homes", "price_range": "Coming Soon",
        "rera_numbers": ["RERA Application In Process"],
        "amenities": ["Resort-style Pool", "Landscaped Gardens", "Clubhouse", "Concierge", "Proximity to Beaches"],
        "description": "Ikaahi Homes brings the Homeland promise to Goa \u2014 boutique vacation homes designed for leisure, investment and an idyllic coastal lifestyle. Your perfect getaway by the sea.",
        "highlights": ["Vacation homes in sunny Goa", "Ideal for leisure & rental investment",
            "Close to beaches & lifestyle hubs", "Register early for priority allotment"],
        "hero_image": "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1600&q=80",
        "gallery": G_VILLA, "map_lat": 15.2993, "map_lng": 74.1240,
        "landmarks": ["Goa", "Near the coastline", "Close to lifestyle & nightlife hubs"],
        "order": 9},
]

TEAM = [
    {"name": "Mr. Umang Jindal", "role": "Director", "expertise": "Visionary behind North India's premium real estate projects.",
     "bio": "Mr. Umang Jindal is the visionary behind North India's most premium real estate projects. Today, he stands amongst one of the youngest pioneers in creating extraordinary infrastructural developments and avant-garde lifestyle projects in the real estate sector. He truly is the man responsible for setting new benchmarks in the real estate sector around Tricity.",
     "image": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80", "order": 1},
    {"name": "Mr. Abhay Jindal", "role": "Director", "expertise": "Leader in innovative projects and construction ventures.",
     "bio": "Mr. Abhay Jindal, a smart and suave individual who has built innovative projects and construction ventures blossoming in the upper Northern region of the country. Under his brilliant leadership, he has set a paradigm by building the Homeland Group, a pioneer of luxury townships saturated in premium comfort.",
     "image": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80", "order": 2},
    {"name": "Mr. Mrinaal Mittal", "role": "Director", "expertise": "Dynamic leader & strategic thinker \u2014 finance and business development.",
     "bio": "Mr. Mrinaal Mittal, a dynamic leader and strategic thinker, plays a key role in driving Homeland Group's growth and expansion across the country. With a strong vision for innovation and excellence, he continues to elevate the Group's presence in the Indian real estate landscape. His expertise in finance and business development has been instrumental in shaping the Group's success and setting new benchmarks in the industry.",
     "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80", "order": 3},
    {"name": "Mr. Nitin Gulati", "role": "VP \u2014 Sales & Leasing", "expertise": "Two decades driving growth for Punjab's real estate industry.",
     "bio": "Mr. Nitin Gulati has established a league of his own in the real estate landscape of Punjab. With an honourable education background in technology & management, Nitin has spent two awe-inspiring decades driving growth for Punjab's real estate industry, positioning himself among the who's who of the business.",
     "image": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80", "order": 4},
    {"name": "Dr. Deepinder Kaur Dhingra", "role": "VP \u2014 Sales", "expertise": "Award-winning real estate authority with international experience.",
     "bio": "Dr. Deepinder Dhingra is a highly accomplished professional with a distinguished background in dentistry and real estate. Following her initial pursuits in dentistry, she expanded her expertise internationally, honing her skills in real estate in New Zealand. Through her unwavering dedication and exceptional professional approach, Dr. Dhingra has garnered multiple prestigious awards and established herself as a trusted and respected authority in the real estate industry.",
     "image": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80", "order": 5},
    {"name": "Mr. Kushal Bansal", "role": "VP \u2014 Sales", "expertise": "Law graduate & strategic consultant redefining luxury real estate.",
     "bio": "Mr. Kushal Bansal is a distinguished name in Punjab's real estate sector, with over a decade of strategic consulting experience. A law graduate with expertise in land regulations, he blends legal insight with sharp market intelligence. Known for his investment acumen and entrepreneurial spirit, Kushal has led several high-value, complex transactions. With global exposure shaping his vision, he now spearheads marquee projects, redefining luxury real estate in North India.",
     "image": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=600&q=80", "order": 6},
    {"name": "Mr. Amit Gupta", "role": "VP \u2014 Sales", "expertise": "16+ years in sales & business development.",
     "bio": "Mr. Amit Gupta brings over 16 years of rich experience in sales and business development. Known for his sharp negotiation skills and natural ability to convince and close deals, he has consistently driven growth for the organization. His strategic approach and client-first mindset set him apart in the real estate industry, and his leadership continues to inspire his team towards higher achievements.",
     "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80", "order": 7},
]


async def run():
    # Sync projects
    await db.projects.delete_many({})
    for p in PROJECTS:
        doc = {"id": str(uuid.uuid4()), **p, "created_at": now_iso(), "updated_at": now_iso()}
        await db.projects.insert_one(doc)
    print(f"Synced {len(PROJECTS)} projects")

    # Sync team
    await db.team.delete_many({})
    for t in TEAM:
        doc = {"id": str(uuid.uuid4()), **t}
        await db.team.insert_one(doc)
    print(f"Synced {len(TEAM)} team members")


if __name__ == "__main__":
    asyncio.run(run())
