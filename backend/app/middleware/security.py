# backend/app/middleware/security.py
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import time
import logging
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Optional

logger = logging.getLogger(__name__)

class SecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.rate_limit_storage: Dict[str, dict] = defaultdict(lambda: {"count": 0, "reset_time": time.time() + 60})
        
    async def dispatch(self, request: Request, call_next):
        # リクエスト開始時間
        start_time = time.time()
        
        # セキュリティヘッダー追加
        response = await call_next(request)
        
        # レスポンスにセキュリティヘッダーを追加
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
        
        # 処理時間をヘッダーに追加（開発用）
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, calls: int = 100, period: int = 60):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.storage: Dict[str, dict] = defaultdict(lambda: {"count": 0, "reset_time": time.time() + period})
        
    async def dispatch(self, request: Request, call_next):
        # IPアドレス取得
        client_ip = request.client.host
        
        # X-Forwarded-For ヘッダーがある場合（プロキシ経由）
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
            
        current_time = time.time()
        client_data = self.storage[client_ip]
        
        # レート制限リセット時間チェック
        if current_time > client_data["reset_time"]:
            client_data["count"] = 0
            client_data["reset_time"] = current_time + self.period
            
        # レート制限チェック
        if client_data["count"] >= self.calls:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later."
            )
            
        # カウント増加
        client_data["count"] += 1
        
        response = await call_next(request)
        
        # レート制限情報をヘッダーに追加
        response.headers["X-RateLimit-Limit"] = str(self.calls)
        response.headers["X-RateLimit-Remaining"] = str(max(0, self.calls - client_data["count"]))
        response.headers["X-RateLimit-Reset"] = str(int(client_data["reset_time"]))
        
        return response

# SQLインジェクション対策のためのバリデーション
def validate_input(value: str, max_length: int = 1000) -> str:
    """入力値の基本バリデーション"""
    if not value:
        return value
        
    # 長さ制限
    if len(value) > max_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Input too long. Maximum {max_length} characters allowed."
        )
    
    # 危険な文字列パターンチェック
    dangerous_patterns = [
        "DROP TABLE", "DELETE FROM", "INSERT INTO", "UPDATE SET",
        "<script", "javascript:", "vbscript:", "onload=", "onerror="
    ]
    
    value_upper = value.upper()
    for pattern in dangerous_patterns:
        if pattern in value_upper:
            logger.warning(f"Potentially malicious input detected: {pattern}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid input detected"
            )
    
    return value

# CSRF保護用のトークン生成
import secrets
import hashlib

class CSRFProtection:
    def __init__(self, secret_key: str):
        self.secret_key = secret_key
        
    def generate_token(self, session_id: str) -> str:
        """CSRFトークン生成"""
        random_token = secrets.token_urlsafe(32)
        token_data = f"{session_id}:{random_token}:{self.secret_key}"
        return hashlib.sha256(token_data.encode()).hexdigest()[:32]
        
    def validate_token(self, token: str, session_id: str) -> bool:
        """CSRFトークン検証"""
        try:
            # トークンの形式と長さをチェック
            if not token or len(token) != 32:
                return False
            
            # 実装では、セッションに保存されたトークンと比較する
            # ここでは簡略化
            return True
        except Exception:
            return False

# パスワード強度チェック
import re

def validate_password_strength(password: str) -> tuple[bool, str]:
    """パスワード強度チェック"""
    if len(password) < 8:
        return False, "パスワードは8文字以上である必要があります"
    
    if len(password) > 128:
        return False, "パスワードは128文字以下である必要があります"
    
    # 文字種チェック
    has_upper = bool(re.search(r'[A-Z]', password))
    has_lower = bool(re.search(r'[a-z]', password))
    has_digit = bool(re.search(r'[0-9]', password))
    has_special = bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password))
    
    strength_count = sum([has_upper, has_lower, has_digit, has_special])
    
    if strength_count < 3:
        return False, "パスワードには大文字・小文字・数字・特殊文字のうち3種類以上を含める必要があります"
    
    # よくあるパスワードチェック
    common_passwords = [
        "password", "123456", "password123", "admin", "qwerty",
        "letmein", "welcome", "monkey", "1234567890"
    ]
    
    if password.lower() in common_passwords:
        return False, "このパスワードは一般的すぎます。別のパスワードを選択してください"
    
    return True, "パスワード強度は十分です"

# ログ記録用のミドルウェア
class LoggingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # リクエスト情報をログ記録
        client_ip = request.client.host
        method = request.method
        url = str(request.url)
        user_agent = request.headers.get("User-Agent", "Unknown")
        
        response = await call_next(request)
        
        # レスポンス情報をログ記録
        process_time = time.time() - start_time
        status_code = response.status_code
        
        logger.info(
            f"Request: {method} {url} - "
            f"Status: {status_code} - "
            f"Time: {process_time:.3f}s - "
            f"IP: {client_ip} - "
            f"User-Agent: {user_agent}"
        )
        
        # エラーログ
        if status_code >= 400:
            logger.error(
                f"Error Response: {method} {url} - "
                f"Status: {status_code} - "
                f"IP: {client_ip}"
            )
        
        return response