"""Email notifications via SMTP (Gmail-ready). Graceful no-op if not configured."""
import os
import ssl
import smtplib
import logging
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)


def _is_configured() -> bool:
    return bool(os.environ.get("SMTP_USER") and os.environ.get("SMTP_PASSWORD"))


def _recipients() -> list:
    raw = os.environ.get("ALERT_RECIPIENTS", "")
    return [r.strip() for r in raw.split(",") if r.strip()]


def _send_sync(subject: str, html_body: str):
    host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    port = int(os.environ.get("SMTP_PORT", "587"))
    user = os.environ.get("SMTP_USER", "")
    password = os.environ.get("SMTP_PASSWORD", "")
    sender = os.environ.get("SMTP_FROM") or user
    recipients = _recipients()
    if not recipients:
        recipients = [user]

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = ", ".join(recipients)
    msg.attach(MIMEText(html_body, "html"))

    context = ssl.create_default_context()
    with smtplib.SMTP(host, port, timeout=15) as server:
        server.starttls(context=context)
        server.login(user, password)
        server.sendmail(user, recipients, msg.as_string())


async def send_notification(subject: str, html_body: str):
    """Send an email alert. Returns True if sent, False if skipped/failed."""
    if not _is_configured():
        logger.info("[email] SMTP not configured — skipping notification: %s", subject)
        return False
    try:
        await asyncio.to_thread(_send_sync, subject, html_body)
        logger.info("[email] Notification sent: %s", subject)
        return True
    except Exception as e:
        logger.error("[email] Failed to send notification: %s", e)
        return False


def lead_email(lead: dict) -> tuple:
    subject = f"New Enquiry — {lead.get('name')} ({lead.get('project', 'Any')})"
    rows = "".join(
        f"<tr><td style='padding:6px 12px;color:#8A6B12;font-weight:600'>{k}</td>"
        f"<td style='padding:6px 12px;color:#111'>{v}</td></tr>"
        for k, v in [
            ("Name", lead.get("name")), ("Phone", lead.get("phone")), ("Email", lead.get("email")),
            ("Project", lead.get("project")), ("Requirement", lead.get("requirement")),
            ("Budget", lead.get("budget") or "—"), ("Preferred Time", lead.get("preferred_contact_time") or "—"),
            ("Message", lead.get("message") or "—"),
        ]
    )
    html = f"""
    <div style='font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden'>
      <div style='background:#0A0A0A;padding:20px;text-align:center'>
        <div style='color:#D4AF37;font-size:20px;letter-spacing:2px;font-weight:700'>HOMELAND GROUP</div>
        <div style='color:#E5E4E2;font-size:12px'>New Website Enquiry</div>
      </div>
      <table style='width:100%;border-collapse:collapse'>{rows}</table>
    </div>"""
    return subject, html


def visit_email(v: dict) -> tuple:
    subject = f"New Site Visit Booking — {v.get('name')} ({v.get('project', 'Any')})"
    rows = "".join(
        f"<tr><td style='padding:6px 12px;color:#8A6B12;font-weight:600'>{k}</td>"
        f"<td style='padding:6px 12px;color:#111'>{val}</td></tr>"
        for k, val in [
            ("Name", v.get("name")), ("Phone", v.get("phone")), ("Email", v.get("email")),
            ("Project", v.get("project")), ("Visit Date", v.get("visit_date")),
            ("Time Slot", v.get("time_slot")), ("Guests", v.get("guests") or "—"),
            ("Notes", v.get("notes") or "—"),
        ]
    )
    html = f"""
    <div style='font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden'>
      <div style='background:#0A0A0A;padding:20px;text-align:center'>
        <div style='color:#D4AF37;font-size:20px;letter-spacing:2px;font-weight:700'>HOMELAND GROUP</div>
        <div style='color:#E5E4E2;font-size:12px'>New Site Visit Booking</div>
      </div>
      <table style='width:100%;border-collapse:collapse'>{rows}</table>
    </div>"""
    return subject, html
