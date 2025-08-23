# backend/app/services/report.py
from typing import Dict, Any
import openpyxl
from openpyxl.styles import Font, Alignment, Border, Side
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

def generate_pdf_report(input_data: Dict[str, Any], result_data: Dict[str, Any], output_path: str):
    """PDF形式のレポート生成"""
    # 日本語フォントの登録
    pdfmetrics.registerFont(TTFont('IPAGothic', '/usr/share/fonts/truetype/fonts-japanese-gothic.ttf'))
    
    # PDFキャンバス作成
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    
    # タイトル
    c.setFont('IPAGothic', 18)
    c.drawCentredString(width/2, height - 50, "省エネ性能計算結果報告書")
    
    # 基本情報
    c.setFont('IPAGothic', 12)
    c.drawString(50, height - 100, "建物情報:")
    c.setFont('IPAGothic', 10)
    building = input_data.get("building", {})
    c.drawString(70, height - 120, f"建物種別: {building.get('building_type', '')}")
    c.drawString(70, height - 140, f"延床面積: {building.get('total_floor_area', 0)} m2")
    c.drawString(70, height - 160, f"地域区分: {building.get('climate_zone', '')}")
    c.drawString(70, height - 180, f"階数: {building.get('num_stories', 0)}")
    
    # 計算結果サマリー
    c.setFont('IPAGothic', 12)
    c.drawString(50, height - 220, "計算結果サマリー:")
    c.setFont('IPAGothic', 10)
    
    # 外皮性能
    envelope = result_data.get("envelope", {})
    c.drawString(70, height - 240, f"UA値: {envelope.get('ua_value', 0):.2f} W/m2K (基準値: {envelope.get('ua_standard', 0):.2f})")
    if envelope.get("eta_value") is not None:
        c.drawString(70, height - 260, f"η値: {envelope.get('eta_value', 0):.2f} (基準値: {envelope.get('eta_standard', 0):.2f})")
    c.drawString(70, height - 280, f"外皮性能適合判定: {'適合' if envelope.get('conformity', False) else '不適合'}")
    
    # エネルギー性能
    energy = result_data.get("energy", {})
    c.drawString(70, height - 310, f"設計一次エネルギー消費量: {energy.get('design_energy_total', 0):.1f} GJ/年")
    c.drawString(70, height - 330, f"基準一次エネルギー消費量: {energy.get('standard_energy_total', 0):.1f} GJ/年")
    c.drawString(70, height - 350, f"BEI値: {energy.get('bei', 0):.2f}")
    c.drawString(70, height - 370, f"一次エネ性能適合判定: {'適合' if energy.get('conformity', False) else '不適合'}")
    
    # 総合判定
    c.setFont('IPAGothic', 12)
    is_conformity = result_data.get("overall_conformity", False)
    c.drawString(50, height - 410, f"総合判定: {'適合' if is_conformity else '不適合'}")
    
    # BELS・ZEB
    c.setFont('IPAGothic', 10)
    c.drawString(70, height - 430, f"BELS評価: {'★' * result_data.get('bels_rating', 0)}")
    c.drawString(70, height - 450, f"ZEBレベル: {result_data.get('zeb_level', 'ZEB非該当')}")
    
    # エネルギー内訳
    c.setFont('IPAGothic', 12)
    c.drawString(50, height - 490, "エネルギー消費内訳:")
    c.setFont('IPAGothic', 10)
    
    y_pos = height - 510
    for use, value in energy.get("energy_by_use", {}).items():
        if use == "heating":
            label = "暖房"
        elif use == "cooling":
            label = "冷房"
        elif use == "ventilation":
            label = "換気"
        elif use == "hot_water":
            label = "給湯"
        elif use == "lighting":
            label = "照明"
        else:
            label = use
        
        c.drawString(70, y_pos, f"{label}: {value:.1f} GJ/年")
        y_pos -= 20
    
    # ページ確定
    c.save()

def generate_excel_report(input_data: Dict[str, Any], result_data: Dict[str, Any], output_path: str):
    """Excel形式のレポート生成"""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "計算結果"
    
    # スタイル設定
    title_font = Font(name='Yu Gothic', size=14, bold=True)
    header_font = Font(name='Yu Gothic', size=11, bold=True)
    normal_font = Font(name='Yu Gothic', size=10)
    
    thin_border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )
    
    # タイトル
    ws['A1'] = "省エネ性能計算結果報告書"
    ws['A1'].font = title_font
    ws.merge_cells('A1:F1')
    ws['A1'].alignment = Alignment(horizontal='center')
    
    # 建物情報
    ws['A3'] = "建物情報"
    ws['A3'].font = header_font
    
    building = input_data.get("building", {})
    ws['A4'] = "建物種別"
    ws['B4'] = building.get("building_type", "")
    ws['A5'] = "延床面積"
    ws['B5'] = building.get("total_floor_area", 0)
    ws['C5'] = "m2"
    ws['A6'] = "地域区分"
    ws['B6'] = building.get("climate_zone", "")
    ws['A7'] = "階数"
    ws['B7'] = building.get("num_stories", 0)
    
    # 計算結果サマリー
    ws['A9'] = "計算結果サマリー"
    ws['A9'].font = header_font
    
    # 外皮性能
    envelope = result_data.get("envelope", {})
    ws['A10'] = "外皮性能"
    ws['A10'].font = header_font
    
    ws['A11'] = "UA値"
    ws['B11'] = envelope.get("ua_value", 0)
    ws['C11'] = "W/m2K"
    ws['D11'] = "基準値"
    ws['E11'] = envelope.get("ua_standard", 0)
    
    row = 12
    if envelope.get("eta_value") is not None:
        ws['A12'] = "η値"
        ws['B12'] = envelope.get("eta_value", 0)
        ws['D12'] = "基準値"
        ws['E12'] = envelope.get("eta_standard", 0)
        row = 13
    
    ws[f'A{row}'] = "外皮性能適合判定"
    ws[f'B{row}'] = "適合" if envelope.get("conformity", False) else "不適合"
    
    # エネルギー性能
    energy = result_data.get("energy", {})
    row += 2
    ws[f'A{row}'] = "エネルギー性能"
    ws[f'A{row}'].font = header_font
    
    row += 1
    ws[f'A{row}'] = "設計一次エネルギー消費量"
    ws[f'B{row}'] = energy.get("design_energy_total", 0)
    ws[f'C{row}'] = "GJ/年"
    
    row += 1
    ws[f'A{row}'] = "基準一次エネルギー消費量"
    ws[f'B{row}'] = energy.get("standard_energy_total", 0)
    ws[f'C{row}'] = "GJ/年"
    
    row += 1
    ws[f'A{row}'] = "BEI値"
    ws[f'B{row}'] = energy.get("bei", 0)
    
    row += 1
    ws[f'A{row}'] = "一次エネ性能適合判定"
    ws[f'B{row}'] = "適合" if energy.get("conformity", False) else "不適合"
    
    # 総合判定
    row += 2
    ws[f'A{row}'] = "総合判定"
    ws[f'A{row}'].font = header_font
    ws[f'B{row}'] = "適合" if result_data.get("overall_conformity", False) else "不適合"
    
    # BELS・ZEB
    row += 1
    ws[f'A{row}'] = "BELS評価"
    ws[f'B{row}'] = "★" * result_data.get("bels_rating", 0)
    
    row += 1
    ws[f'A{row}'] = "ZEBレベル"
    ws[f'B{row}'] = result_data.get("zeb_level", "ZEB非該当")
    
    # エネルギー内訳
    row += 2
    ws[f'A{row}'] = "エネルギー消費内訳"
    ws[f'A{row}'].font = header_font
    
    row += 1
    ws[f'A{row}'] = "用途"
    ws[f'B{row}'] = "消費量"
    ws[f'C{row}'] = "単位"
    
    for use, value in energy.get("energy_by_use", {}).items():
        row += 1
        if use == "heating":
            label = "暖房"
        elif use == "cooling":
            label = "冷房"
        elif use == "ventilation":
            label = "換気"
        elif use == "hot_water":
            label = "給湯"
        elif use == "lighting":
            label = "照明"
        else:
            label = use
        
        ws[f'A{row}'] = label
        ws[f'B{row}'] = value
        ws[f'C{row}'] = "GJ/年"
    
    # 外観調整
    for col in ws.columns:
        max_length = 0
        column = col[0].column_letter
        for cell in col:
            if len(str(cell.value)) > max_length:
                max_length = len(str(cell.value))
        
        adjusted_width = (max_length + 2) * 1.2
        ws.column_dimensions[column].width = adjusted_width
    
    # 保存
    wb.save(output_path)