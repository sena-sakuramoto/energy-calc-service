# backend/app/services/engine.py
from typing import Dict, Any, Tuple

from app.schemas.building import CalculationInput
from app.schemas.result import CalculationResult, EnvelopeResult, EnergyResult

class CalculationEngine:
    """�ȃG�l�v�Z�G���W��"""
    
    def __init__(self):
        # �n��敪���Ƃ̊UA�l�i��j
        self.standard_ua_values = {
            1: 0.46, 2: 0.46, 3: 0.56, 4: 0.56,
            5: 0.62, 6: 0.62, 7: 0.68, 8: 0.68
        }
        # �n��敪���Ƃ̊�Œl�i��j
        self.standard_eta_values = {
            1: 2.8, 2: 2.8, 3: 2.8, 4: 3.0,
            5: 3.0, 6: 2.8, 7: 2.7, 8: 3.2
        }
    
    def calculate(self, input_data: CalculationInput) -> CalculationResult:
        """�v�Z�����s����"""
        # �O�琫�\�v�Z
        envelope_result = self._calculate_envelope(input_data.building, input_data.envelope)
        
        # �ꎟ�G�l���M�[����ʌv�Z
        energy_result = self._calculate_energy(input_data.building, input_data.systems, envelope_result)
        
        # BELS�]���EZEB���x���̔���
        bels_rating = self._determine_bels_rating(energy_result.bei)
        zeb_level = self._determine_zeb_level(energy_result.bei)
        
        # �����K������i�O��ƈꎟ�G�l�����ɓK���j
        overall_conformity = envelope_result.conformity and energy_result.conformity
        
        return CalculationResult(
            envelope=envelope_result,
            energy=energy_result,
            bels_rating=bels_rating,
            zeb_level=zeb_level,
            overall_conformity=overall_conformity
        )
    
    def _calculate_envelope(self, building, envelope) -> EnvelopeResult:
        """�O�琫�\�v�Z"""
        # �O��ʐύ��v
        total_area = sum(part.area for part in envelope.parts)
        
        # UA�l�v�Z (��(U_i*A_i) / ��A_i)
        ua_numerator = sum(part.u_value * part.area for part in envelope.parts)
        ua_value = ua_numerator / total_area if total_area > 0 else 0
        
        # �Œl�v�Z�i�������̂݁j
        window_parts = [part for part in envelope.parts if part.part_type == "��" and part.eta_value is not None]
        if window_parts:
            window_area = sum(part.area for part in window_parts)
            eta_numerator = sum(part.eta_value * part.area for part in window_parts)
            eta_value = eta_numerator / window_area if window_area > 0 else None
        else:
            eta_value = None
        
        # ��l�擾
        climate_zone = building.climate_zone
        ua_standard = self.standard_ua_values.get(climate_zone, 0.6)  # �f�t�H���g0.6
        eta_standard = self.standard_eta_values.get(climate_zone, 3.0)  # �f�t�H���g3.0
        
        # �K������
        conformity = ua_value <= ua_standard
        if eta_value is not None and eta_standard is not None:
            conformity = conformity and eta_value <= eta_standard
        
        return EnvelopeResult(
            ua_value=ua_value,
            eta_value=eta_value,
            ua_standard=ua_standard,
            eta_standard=eta_standard,
            conformity=conformity
        )
    
    def _calculate_energy(self, building, systems, envelope_result) -> EnergyResult:
        """�ꎟ�G�l���M�[����ʌv�Z"""
        # �����p�r�E�K�͂Ɋ�Â���ꎟ�G�l���M�[����ʁi�P�ʖʐς�����j
        # ���ۂɂ͕��G�Ȍv�Z�������邪�A�����ł̓V���v���ȗ�Ƃ��ď��ʐςɒP�ʏ���ʂ�������
        if building.building_type == "�Z��":
            standard_energy_unit = 330  # GJ/�N�Em2�i��j
        else:  # ��Z��
            standard_energy_unit = 450  # GJ/�N�Em2�i��j
        
        # ��ꎟ�G�l���M�[�����
        standard_energy_total = standard_energy_unit * building.total_floor_area / 1000  # GJ/�N
        
        # �݌v�ꎟ�G�l���M�[����ʁi�e�ݔ����Ɓj
        energy_by_use = {}
        
        # �g�[�G�l���M�[�����
        if systems.heating:
            # UA�Ɋ�Â��M�����W������g�[���ׂ��v�Z�i�ȈՌv�Z��j
            heating_load = envelope_result.ua_value * building.total_floor_area * 1800  # �N�ԓx��
            heating_energy = heating_load / systems.heating.efficiency / 1000  # GJ
            energy_by_use["heating"] = heating_energy
        else:
            energy_by_use["heating"] = 0
        
        # ��[�G�l���M�[�����
        if systems.cooling:
            # �ȈՌv�Z��
            cooling_load = building.total_floor_area * 100  # �ȈՕ��׌W��
            cooling_energy = cooling_load / systems.cooling.efficiency / 1000  # GJ
            energy_by_use["cooling"] = cooling_energy
        else:
            energy_by_use["cooling"] = 0
        
        # ���C�G�l���M�[�����
        if systems.ventilation:
            # �ғ����� x ����d��
            ventilation_energy = systems.ventilation.power_consumption * 24 * 365 / 1000000 * 9760 / 1000  # �ꎟ�G�l���M�[���Z GJ
            energy_by_use["ventilation"] = ventilation_energy
        else:
            energy_by_use["ventilation"] = 0
        
        # �����G�l���M�[�����
        if systems.hot_water:
            # �ȈՌv�Z��
            hot_water_load = building.total_floor_area * 50  # �ȈՕ��׌W��
            hot_water_energy = hot_water_load / systems.hot_water.efficiency / 1000  # GJ
            energy_by_use["hot_water"] = hot_water_energy
        else:
            energy_by_use["hot_water"] = 0
        
        # �Ɩ��G�l���M�[�����
        if systems.lighting:
            # �ȈՌv�Z��
            lighting_energy = systems.lighting.power_density * building.total_floor_area * 2500 / 1000000 * 9760 / 1000  # GJ
            energy_by_use["lighting"] = lighting_energy
        else:
            energy_by_use["lighting"] = 0
        
        # �݌v�ꎟ�G�l���M�[����ʍ��v
        design_energy_total = sum(energy_by_use.values())
        
        # BEI�l�v�Z
        bei = design_energy_total / standard_energy_total if standard_energy_total > 0 else 999
        
        # �K������
        conformity = bei <= 1.0
        
        return EnergyResult(
            design_energy_total=design_energy_total,
            standard_energy_total=standard_energy_total,
            bei=bei,
            conformity=conformity,
            energy_by_use=energy_by_use,
            energy_by_system=energy_by_use  # �ȈՉ�
        )
    
    def _determine_bels_rating(self, bei: float) -> int:
        """BEI�l����BELS���]���𔻒�"""
        if bei <= 0.6:
            return 5
        elif bei <= 0.7:
            return 4
        elif bei <= 0.8:
            return 3
        elif bei <= 0.9:
            return 2
        else:
            return 1
    
    def _determine_zeb_level(self, bei: float) -> str:
        """BEI�l����ZEB���x���𔻒�"""
        if bei <= 0.0:
            return "ZEB"
        elif bei <= 0.25:
            return "Nearly ZEB"
        elif bei <= 0.5:
            return "ZEB Ready"
        elif bei <= 0.6:
            return "ZEB Oriented"
        else:
            return "ZEB��Y��"

# �G���W���̃C���X�^���X�쐬�i�V���O���g���j
calculation_engine = CalculationEngine()