# backend/app/schemas/building.py
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# ������{���
class Building(BaseModel):
    building_type: str = Field(..., description="������ʁi�Z��/��Z��j")
    total_floor_area: float = Field(..., description="�����ʐ�(m2)")
    climate_zone: int = Field(..., description="�n��敪�i1-8�j")
    num_stories: int = Field(..., description="�K��")
    has_central_heat_source: bool = Field(False, description="�W���M���L���i��Z��̂݁j")

# �O�畔�ʃf�[�^
class EnvelopePart(BaseModel):
    part_name: str = Field(..., description="���ʖ���")
    part_type: str = Field(..., description="���ʎ�ʁi��/����/���Ȃǁj")
    area: float = Field(..., description="�ʐ�(m2)")
    u_value: float = Field(..., description="�M�ї���(W/m2K)")
    eta_value: Optional[float] = Field(None, description="���˔M�擾���i���̂݁j")
    psi_value: Optional[float] = Field(None, description="���M�ї����i�M���j")
    length: Optional[float] = Field(None, description="�����i�M���j")

# �O��S�̃f�[�^
class Envelope(BaseModel):
    parts: List[EnvelopePart] = Field(..., description="�O�畔�ʃ��X�g")

# �ݔ��V�X�e���i�g�[�j
class HeatingSystem(BaseModel):
    system_type: str = Field(..., description="�g�[���")
    rated_capacity: Optional[float] = Field(None, description="��i�\��(kW)")
    efficiency: float = Field(..., description="�����iCOP���j")
    control_method: Optional[str] = Field(None, description="�������")
    area_served: Optional[float] = Field(None, description="�Ώۏ��ʐ�(m2)")

# �ݔ��V�X�e���i��[�j
class CoolingSystem(BaseModel):
    system_type: str = Field(..., description="��[���")
    rated_capacity: Optional[float] = Field(None, description="��i�\��(kW)")
    efficiency: float = Field(..., description="�����iCOP���j")
    control_method: Optional[str] = Field(None, description="�������")
    area_served: Optional[float] = Field(None, description="�Ώۏ��ʐ�(m2)")

# �ݔ��V�X�e���i���C�j
class VentilationSystem(BaseModel):
    system_type: str = Field(..., description="���C���")
    air_volume: float = Field(..., description="����(m3/h)")
    power_consumption: float = Field(..., description="����d��(W)")
    heat_exchange_efficiency: Optional[float] = Field(None, description="�M��������")

# �ݔ��V�X�e���i�����j
class HotWaterSystem(BaseModel):
    system_type: str = Field(..., description="��������")
    efficiency: float = Field(..., description="����")
    rated_capacity: Optional[float] = Field(None, description="��i�\��")
    load: Optional[float] = Field(None, description="��������")

# �ݔ��V�X�e���i�Ɩ��j
class LightingSystem(BaseModel):
    system_type: str = Field(..., description="�Ɩ����")
    power_density: float = Field(..., description="�Ɩ����x(W/m2)")
    control_method: Optional[str] = Field(None, description="�������")

# �ݔ��V�X�e���S��
class Systems(BaseModel):
    heating: Optional[HeatingSystem] = None
    cooling: Optional[CoolingSystem] = None
    ventilation: Optional[VentilationSystem] = None
    hot_water: Optional[HotWaterSystem] = None
    lighting: Optional[LightingSystem] = None
    renewable_energy: Optional[Dict[str, Any]] = None

# �v�Z���̓f�[�^�S��
class CalculationInput(BaseModel):
    building: Building
    envelope: Envelope
    systems: Systems