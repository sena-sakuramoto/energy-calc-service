from pathlib import Path

PDF_EXPORT_PATH = Path('frontend/src/utils/pdfExport.js')

# PDF本文で英語固定だった既知ラベル（ユーザー報告の原因）
ENGLISH_TOKENS = [
    'BEI Calculation Report',
    'Project / Building Overview',
    'BEI Calculation Result',
    'Energy Consumption Breakdown',
    'Calculation Formula',
    'Standard Energy Intensities',
    'Legal Basis',
    'Notes & Assumptions',
    "'Compliant'",
    "'Non-compliant'",
    "'PASS'",
    "'FAIL'",
    'Category',
    'Design Primary Energy Consumption',
    'Standard Primary Energy Consumption',
    "'Judgment'",
    'Criterion: BEI <= 1.0',
]


def test_pdf_export_text_is_localized_for_japanese_users():
    source = PDF_EXPORT_PATH.read_text(encoding='utf-8')

    # 主要な英語固定文言が残っていないこと
    for token in ENGLISH_TOKENS:
        assert token not in source, f'英語文言が残っています: {token}'

    # 最低限の日本語見出しがあること
    required_japanese_labels = [
        'BEI計算書',
        '建物概要',
        'BEI計算結果',
        '法的根拠',
        '注記・前提条件',
    ]
    for label in required_japanese_labels:
        assert label in source, f'必要な日本語ラベルが見つかりません: {label}'
