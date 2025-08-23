# backend/app/schemas/token.py
# -*- coding: utf-8 -*-
from typing import Optional

from pydantic import BaseModel

class Token(BaseModel):
    """
    Schema for the access token response.
    (アクセストークンレスポンス用のスキーマ。)
    """
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """
    Schema for data embedded within the JWT token (payload).
    (JWTトークン内に埋め込まれるデータ（ペイロード）用のスキーマ。)
    """
    username: Optional[str] = None # 通常、ユーザー名やメールアドレスなど、ユーザーを識別する情報
    # 他にもトークンに含めたい情報があれば追加できます (例: user_id: Optional[int] = None)

# (オプション) トークンリフレッシュ機能がある場合は、リフレッシュトークン関連のスキーマもここに追加