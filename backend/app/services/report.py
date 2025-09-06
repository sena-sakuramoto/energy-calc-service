# backend/app/services/report.py
from typing import Dict, Any
import openpyxl
import requests
import io

# This mapping defines the relationship between the application's data keys
# and the Named Ranges in the Excel template.
# It needs to be comprehensive to cover all required fields.
CELL_MAPPING = {
    # Basic Info from 'building' object
    "name": "BuildingName",
    "climate_zone": "Region",
    "building_type": "BuildingType",
    "total_floor_area": "TotalArea",
    "total_floor": "TotalFloor",
    "building_height": "BuildingHeight",
    
    # Envelope Performance from 'building' object (or a separate 'envelope' object)
    "uvalue_exterior_wall": "Uvalue_ExteriorWall",
    "uvalue_roof": "Uvalue_Roof",

    # Systems - these keys are expected inside the 'systems' object
    # Cooling System
    "cooling_system_type": "HeatSourceType_Cooling",
    "cooling_cop": "HeatSourceCOP_Cooling",

    # Heating System
    "heating_system_type": "HeatSourceType_Heating",
    "heating_cop": "HeatSourceCOP_Heating",

    # Ventilation System
    # The template might have multiple rows for ventilation. 
    # This mapping is simplified and assumes one main system.
    "ventilation_equipment_type": "VentilationEquipment", # This is likely a table/array

    # Lighting System
    "lighting_unit_power": "LightingUnitPower", # This is likely a table/array

    # Hot Water System
    "hotwater_equipment_type": "HotwaterEquipment", # This is likely a table/array

    # Elevator System
    "elevator_present": "Elevator",
    "elevator_control_type": "ElevatorControlType",
}

def get_official_report_from_api(input_data: Dict[str, Any]) -> bytes:
    """
    Fills the official Excel template with input data, sends it to the lowenergy.jp API,
    and returns the resulting report file (PDF).
    """
    API_URL = "https://api.lowenergy.jp/model/1/beta/reportFromInputSheets"
    
    building_data = input_data.get("building", {})
    systems_data = input_data.get("systems", {})
    total_area = building_data.get("total_floor_area", 0)

    if total_area < 300:
        template_path = "C:\\Users\\senaa\\energy-calc-service\\Excel　書式\\SMALLMODEL_inputSheet_for_Ver3.8_beta.xlsx"
    else:
        template_path = "C:\\Users\\senaa\\energy-calc-service\\Excel　書式\\MODEL_inputSheet_for_Ver3.8_beta.xlsx"

    try:
        workbook = openpyxl.load_workbook(template_path)
    except FileNotFoundError:
        raise Exception(f"Excel template not found at {template_path}")

    # --- Write data to the template ---
    # Flatten the nested data for easier mapping
    flat_data = {
        **building_data,
        **systems_data.get("cooling", {}),
        **systems_data.get("heating", {}),
        **systems_data.get("ventilation", {}),
        **systems_data.get("hot_water", {}),
        **systems_data.get("lighting", {}),
        **systems_data.get("elevator", {}),
    }

    for key, cell_name in CELL_MAPPING.items():
        if key in flat_data and flat_data[key] is not None:
            try:
                # Attempt to write to a named range first
                # workbook.defined_names[cell_name].value = flat_data[key] # This is incorrect syntax for writing
                # Correct way is to find the destination of the named range
                destinations = workbook.defined_names[cell_name].destinations
                for target_sheet, target_cell in destinations:
                    ws = workbook[target_sheet]
                    ws[target_cell] = flat_data[key]
            except KeyError:
                # Fallback for simple cell names if named range doesn't exist
                try:
                    sheet = workbook.active
                    sheet[cell_name] = flat_data[key]
                except Exception as e:
                    print(f"Warning: Could not write data for key '{key}' to cell/range '{cell_name}'. Error: {e}")

    # Save the modified workbook to an in-memory buffer
    excel_buffer = io.BytesIO()
    workbook.save(excel_buffer)
    excel_buffer.seek(0)

    # --- Call the external API ---
    files = {
        'file': ('input.xlsx', excel_buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    }
    
    try:
        print(f"Calling external API at {API_URL}...")
        response = requests.post(API_URL, files=files, timeout=90) # Increased timeout
        response.raise_for_status()
        print("API call successful, returning PDF content.")
        return response.content

    except requests.exceptions.RequestException as e:
        # More detailed error logging
        error_message = f"API request failed: {e}"
        if e.response is not None:
            error_message += f" | Status Code: {e.response.status_code} | Response: {e.response.text}"
        print(error_message)
        raise Exception(error_message)
    except Exception as e:
        print(f"An unexpected error occurred during API report generation: {e}")
        raise Exception(f"An unexpected error occurred: {e}")
