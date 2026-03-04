"""Referral notification service."""

from __future__ import annotations

import logging
import os
from typing import Any, Dict

logger = logging.getLogger(__name__)

NOTIFY_EMAIL = os.getenv("REFERRAL_NOTIFY_EMAIL", "compass@archi-prisma.co.jp")


def send_referral_notification(referral_data: Dict[str, Any]) -> bool:
    """Send email notification for new referral. Returns True on success."""
    logger.info(
        "New referral: %s -> %s (%s) for %s",
        referral_data.get("architect_email"),
        referral_data.get("manufacturer"),
        referral_data.get("product_name"),
        referral_data.get("project_name", "unnamed"),
    )

    try:
        import smtplib
        from email.mime.text import MIMEText

        smtp_user = os.getenv("GMAIL_USER")
        smtp_pass = os.getenv("GMAIL_APP_PASSWORD")
        if not smtp_user or not smtp_pass:
            logger.warning("Gmail credentials not set; skipping email notification")
            return False

        body = f"""新規見積依頼が届きました。

■ 建築士情報
  名前: {referral_data.get('architect_name')}
  メール: {referral_data.get('architect_email')}
  会社: {referral_data.get('architect_company', '未入力')}
  電話: {referral_data.get('architect_phone', '未入力')}

■ 案件情報
  案件名: {referral_data.get('project_name', '未入力')}
  用途: {referral_data.get('building_use', '未入力')}
  地域: {referral_data.get('building_zone', '未入力')}地域
  面積: {referral_data.get('floor_area', '未入力')}m2

■ 製品
  カテゴリ: {referral_data.get('product_category')}
  製品名: {referral_data.get('product_name')}
  メーカー: {referral_data.get('manufacturer')}

---
楽々省エネ計算 紹介システム
"""
        msg = MIMEText(body, "plain", "utf-8")
        msg["Subject"] = (
            f"[楽々省エネ] 見積依頼: {referral_data.get('product_name')} - "
            f"{referral_data.get('architect_company', '個人')}"
        )
        msg["From"] = smtp_user
        msg["To"] = NOTIFY_EMAIL

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)

        logger.info("Referral notification sent to %s", NOTIFY_EMAIL)
        return True
    except Exception as exc:
        logger.exception("Failed to send referral notification: %s", exc)
        return False
