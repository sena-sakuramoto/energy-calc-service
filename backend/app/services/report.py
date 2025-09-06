'''# backend/app/services/report.py
from typing import Dict, Any, List
import openpyxl
import requests
import io

# This mapping defines the relationship between the application's data keys
# and the Named Ranges in the Excel template.
# Based on the PDF spec, these are the 'Properties' that can be converted.
CELL_MAPPING = {
    # 'building' data
    "name": "BuildingName",
    "climate_zone": "Region",
    "building_type": "BuildingType",
    "meeting_place_type": "MeetingPlaceType",
    "total_floor_area": "TotalArea",
    "envelope_system": "EnvelopeSystem",
    "total_floor": "TotalFloor",
    "building_height": "BuildingHeight",
    "outer_circumference": "OuterCircumference",
    "outer_circumference_core": "OuterCircumference_Core",
    "non_ac_core_direction": "NonACCoreDirection",
    "uvalue_exterior_wall": "Uvalue_ExteriorWall",
    "uvalue_roof": "Uvalue_Roof",
    "uvalue_floor": "Uvalue_Floor",
    
    # 'systems' data - simplified mapping
    # In a real scenario, this would need to handle arrays for each system type
    "ac_heat_source_type_cooling": "HeatSourceType_Cooling",
    "ac_cop_cooling": "HeatSourceCOP_Cooling",
    "ac_heat_source_type_heating": "HeatSourceType_Heating",
    "ac_cop_heating": "HeatSourceCOP_Heating",
    "ac_heatexchanger_efficiency": "HeatExchangerEfficiency",
    
    "v_equipment": "VentilationEquipment", # This is an array in the spec
    
    "l_equipment": "LightingEquipment", # This is an array
    "l_unit_power": "LightingUnitPower", # This is an array
    
    "hw_equipment": "HotwaterEquipment", # This is an array
    "hw_efficiency": "HeatSourceEfficiency", # This is an array
    
    "ev_present": "Elevator",
    "ev_control_type": "ElevatorControlType",
}

def _write_data_to_workbook(workbook: openpyxl.Workbook, input_data: Dict[str, Any]):
    """Helper function to write data to the workbook using named ranges."""
    
    # Flatten the data for easier lookup
    flat_data = {}
    if "building" in input_data:
        flat_data.update(input_data["building"])
    if "systems" in input_data:
        # This is a simplification. A real implementation would need to handle
        # the nested and array-based nature of systems data more robustly.
        for system_name, system_data in input_data["systems"].items():
            if isinstance(system_data, dict):
                flat_data.update(system_data)

    print(f"Flattened data for Excel mapping: {flat_data}")

    for key, cell_name in CELL_MAPPING.items():
        if key in flat_data and flat_data[key] is not None:
            try:
                # Attempt to write to a named range
                destinations = workbook.defined_names[cell_name].destinations
                for target_sheet, target_cell in destinations:
                    ws = workbook[target_sheet]
                    ws[target_cell] = flat_data[key]
                print(f"Successfully wrote key '{key}' to named range '{cell_name}'")
            except KeyError:
                # Fallback for simple cell names if named range doesn't exist
                print(f"Warning: Named range '{cell_name}' not found for key '{key}'. Skipping.")
            except Exception as e:
                print(f"Warning: Could not write data for key '{key}' to named range '{cell_name}'. Error: {e}")


def get_official_report_from_api(input_data: Dict[str, Any]) -> bytes:
    """
    Fills the official Excel template with input data, sends it to the lowenergy.jp API,
    and returns the resulting report file (PDF).
    """
    API_URL = "https://api.lowenergy.jp/model/1/beta/reportFromInputSheets"
    
    building_data = input_data.get("building", {})
    total_area = building_data.get("total_floor_area", 0)

    if total_area < 300:
        template_path = "C:\Users\senaa\energy-calc-service\Excel　書式\SMALLMODEL_inputSheet_for_Ver3.8_beta.xlsx"
    else:
        template_path = "C:\Users\senaa\energy-calc-service\Excel　書式\MODEL_inputSheet_for_Ver3.8_beta.xlsx"
    
    print(f"Selected template: {template_path}")

    try:
        workbook = openpyxl.load_workbook(template_path)
    except FileNotFoundError:
        raise Exception(f"Excel template not found at {template_path}")

    # Write the input data to the workbook
    _write_data_to_workbook(workbook, input_data)

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
        response = requests.post(API_URL, files=files, timeout=90)
        response.raise_for_status()
        print("API call successful, returning PDF content.")
        return response.content

    except requests.exceptions.RequestException as e:
        error_message = f"API request failed: {e}"
        if e.response is not None:
            error_message += f" | Status Code: {e.response.status_code} | Response: {e.response.text}"
        print(error_message)
        raise Exception(error_message)
    except Exception as e:
        print(f"An unexpected error occurred during API report generation: {e}")
        raise Exception(f"An unexpected error occurred: {e}")
''