# backend/app/services/report.py
from typing import Dict, Any
import openpyxl
import requests
import io

def get_official_report_from_api(input_data: Dict[str, Any]) -> bytes:
    """
    Fills the official Excel template with input data, sends it to the lowenergy.jp API,
    and returns the resulting report file (PDF).
    """
    API_URL = "https://api.lowenergy.jp/model/1/beta/reportFromInputSheets"
    
    # The input_data is expected to have a nested structure like {"building":{...}, "systems":{...}}
    building_data = input_data.get("building", {})
    systems_data = input_data.get("systems", {})
    total_area = building_data.get("total_floor_area", 0)

    # 1. Select template based on floor area
    if total_area < 300:
        template_path = "C:\\Users\\senaa\\energy-calc-service\\Excel　書式\\SMALLMODEL_inputSheet_for_Ver3.8_beta.xlsx"
    else:
        template_path = "C:\\Users\\senaa\\energy-calc-service\\Excel　書式\\MODEL_inputSheet_for_Ver3.8_beta.xlsx"

    try:
        workbook = openpyxl.load_workbook(template_path)
        # The cell names are defined as Named Ranges in the Excel file.
        # We can write to them directly by name.
    except FileNotFoundError:
        raise Exception(f"Excel template not found at {template_path}")

    # 3. Define data mapping (from app data to Excel Named Ranges)
    # Based on the API spec (convertToWebInput)
    cell_mapping = {
        # Basic Info
        'name': 'BuildingName',
        'climate_zone': 'Region',
        'building_type': 'BuildingType',
        'total_floor_area': 'TotalArea',
        
        # Envelope Performance (PAL)
        'total_floor': 'TotalFloor',
        'building_height': 'BuildingHeight',
        'uvalue_exterior_wall': 'Uvalue_ExteriorWall',
        'uvalue_roof': 'Uvalue_Roof',

        # Air Conditioning (AC)
        'ac_heat_source_type_cooling': 'HeatSourceType_Cooling',
        'ac_heat_source_cop_cooling': 'HeatSourceCOP_Cooling',
        'ac_heat_source_type_heating': 'HeatSourceType_Heating',
        'ac_heat_source_cop_heating': 'HeatSourceCOP_Heating',

        # Ventilation (V)
        'ventilation_equipment': 'VentilationEquipment',

        # Lighting (L)
        'lighting_equipment': 'LightingEquipment',

        # Hot Water (HW)
        'hotwater_equipment': 'HotwaterEquipment',

        # Elevator (EV)
        'elevator_equipment': 'Elevator',
    }

    # 4. Write data to the template using named ranges
    # This requires a more complex data structure from the endpoint
    # For now, we map the flat `building_data` and a dummy `systems_data`
    for key, cell_name in cell_mapping.items():
        if key in building_data:
            try:
                workbook.defined_names[cell_name].value = building_data[key]
            except KeyError:
                # If the named range doesn't exist, we can try to write to a cell with that name
                # This is less robust.
                try:
                    sheet = workbook.active
                    sheet[cell_name] = building_data[key]
                except:
                    print(f"Could not write to cell/named range: {cell_name}")

    # 5. Save the modified workbook to an in-memory buffer
    excel_buffer = io.BytesIO()
    workbook.save(excel_buffer)
    excel_buffer.seek(0)

    # 6. Send to the API
    # The API expects multipart/form-data with each sheet as a separate part.
    # For simplicity, we are sending the whole workbook as a single file.
    # This might need to be adjusted if the API requires separate CSVs.
    # The PDF spec (page 9) shows multipart for CSVs, and a single file for Excel.
    files = {
        'file': ('input.xlsx', excel_buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    }
    
    try:
        response = requests.post(API_URL, files=files, timeout=60)
        response.raise_for_status()
        return response.content

    except requests.exceptions.RequestException as e:
        raise Exception(f"API request failed: {e}")
    except Exception as e:
        raise Exception(f"An error occurred during API report generation: {e}")