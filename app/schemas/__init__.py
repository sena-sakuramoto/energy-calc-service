# backend/app/schemas/__init__.py
# -*- coding: utf-8 -*-

# 各スキーマファイルから、エンドポイントなどで直接利用したいクラスをインポートします。
# これにより、from app.schemas import User や from app.schemas import Project のように
# 直接クラス名を指定してインポートできるようになります。
# また、from app import schemas とした後に、schemas.User や schemas.Project のように
# アクセスすることも可能になります。

from .user import (
    UserBase,
    UserCreate,
    UserUpdate,
    User,
    UserInDBBase,
    UserInDB,
)
from .token import Token, TokenData
from .project import (
    ProjectBase,
    ProjectCreate,
    ProjectUpdate,
    Project,
    ProjectInDBBase,
    ProjectInDB,
)
# Public calculator schemas
from .calc import (
    PowerRequest,
    PowerResponse,
    EnergyRequest,
    EnergyResponse,
    CostRequest,
    CostResponse,
    DeviceUsageRequest,
    DeviceUsageResponse,
    DeviceUsage,
)
from .tariff import (
    Tariff,
    TariffTier,
    TimeOfUsePeriod,
    UsageProfile,
    ContractInfo,
    QuoteRequest,
    QuoteResponse,
)
from .bei import BEIRequest, BEIResponse
from .compliance import (
    CalculationInput as ComplianceCalculationInput,
    CalculationResult as ComplianceCalculationResult,
    EnvelopeResult as ComplianceEnvelopeResult,
    PrimaryEnergyResult as CompliancePrimaryEnergyResult,
)
# 他にも building.py, result.py などに対応するスキーマがあれば、同様に追加します。
# from .building import Building, BuildingCreate # (例)
# from .result import ResultData # (例)

# __all__ を定義しておくと、from app.schemas import * をした際に
# 何がインポートされるかを明示的に制御できます (オプション)。
__all__ = [
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "User",
    "UserInDBBase",
    "UserInDB",
    "Token",
    "TokenData",
    "ProjectBase",
    "ProjectCreate",
    "ProjectUpdate",
    "Project",
    "ProjectInDBBase",
    "ProjectInDB",
    "PowerRequest",
    "PowerResponse",
    "EnergyRequest",
    "EnergyResponse",
    "CostRequest",
    "CostResponse",
    "DeviceUsageRequest",
    "DeviceUsageResponse",
    "DeviceUsage",
    "Tariff",
    "TariffTier",
    "TimeOfUsePeriod",
    "UsageProfile",
    "ContractInfo",
    "QuoteRequest",
    "QuoteResponse",
    "BEIRequest",
    "BEIResponse",
    "ComplianceCalculationInput",
    "ComplianceCalculationResult",
    "ComplianceEnvelopeResult",
    "CompliancePrimaryEnergyResult",
]
