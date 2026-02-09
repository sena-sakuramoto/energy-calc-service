"""Regression tests for official API Excel upload behavior."""

import io
import json
import unittest
from unittest.mock import patch

from app.services import report


CONTENT_TYPE_XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


class _FakeResponse:
    def __init__(self, *, content: bytes = b"", json_data=None, headers=None):
        self.content = content
        self._json_data = json_data if json_data is not None else {}
        self.headers = headers if headers is not None else {}

    def raise_for_status(self) -> None:
        return None

    def json(self):
        return self._json_data


class TestOfficialUploadBehavior(unittest.TestCase):
    def _build_smallmodel_upload_bytes(self) -> bytes:
        wb = report.openpyxl.Workbook()
        wb.active.title = "様式SA_基本情報"
        buf = io.BytesIO()
        wb.save(buf)
        return buf.getvalue()

    def test_select_template_uses_standard_for_small_area_api_compat(self):
        template = report._select_template(120.0)
        self.assertEqual(template, report.STANDARD_TEMPLATE)

    def test_post_to_api_uses_raw_binary_body(self):
        captured = {}

        def fake_post(url, data=None, headers=None, timeout=None, **kwargs):
            captured["url"] = url
            captured["data"] = data
            captured["headers"] = headers
            captured["timeout"] = timeout
            captured["kwargs"] = kwargs
            return _FakeResponse()

        with patch.object(report.requests, "post", side_effect=fake_post):
            excel_payload = b"PK\x03\x04dummy-xlsx-content"
            excel_buffer = io.BytesIO(excel_payload)
            excel_buffer.seek(len(excel_payload))

            report._post_to_api("https://example.test/compute", excel_buffer, timeout=45)

        self.assertEqual(captured["url"], "https://example.test/compute")
        self.assertEqual(captured["data"], excel_payload)
        self.assertEqual(captured["headers"], {"Content-Type": CONTENT_TYPE_XLSX})
        self.assertEqual(captured["timeout"], 45)
        self.assertNotIn("files", captured["kwargs"])

    def test_get_official_report_from_excel_uses_uploaded_payload(self):
        excel_payload = b"PK\x03\x04excel-input"

        def fake_post_to_api(url, excel_buffer, timeout=120):
            self.assertEqual(url, report.API_REPORT)
            excel_buffer.seek(0)
            self.assertEqual(excel_buffer.read(), excel_payload)
            return _FakeResponse(content=b"%PDF-1.7\n")

        with patch.object(report, "_post_to_api", side_effect=fake_post_to_api):
            pdf = report.get_official_report_from_excel(excel_payload)

        self.assertTrue(pdf.startswith(b"%PDF"))

    def test_get_official_report_from_excel_raises_for_json_error_payload(self):
        excel_payload = b"PK\x03\x04excel-input"
        error_payload = {
            "Status": "Error",
            "BasicInformationValidationResult": {
                "Errors": [
                    {"Message": "様式A 基本情報 は必ずアップロードしてください。"}
                ]
            },
        }
        error_bytes = json.dumps(error_payload, ensure_ascii=False).encode("utf-8")

        def fake_post_to_api(url, excel_buffer, timeout=120):
            self.assertEqual(url, report.API_REPORT)
            excel_buffer.seek(0)
            self.assertEqual(excel_buffer.read(), excel_payload)
            return _FakeResponse(
                content=error_bytes,
                json_data=error_payload,
                headers={"Content-Type": "application/json"},
            )

        with patch.object(report, "_post_to_api", side_effect=fake_post_to_api):
            with self.assertRaises(Exception) as ctx:
                report.get_official_report_from_excel(excel_payload)

        self.assertIn(report.SMALLMODEL_UPLOAD_UNSUPPORTED_MESSAGE, str(ctx.exception))

    def test_get_official_report_from_excel_blocks_smallmodel_original_upload(self):
        smallmodel_bytes = self._build_smallmodel_upload_bytes()

        with patch.object(report, "_post_to_api", side_effect=AssertionError("must not call API")):
            with self.assertRaises(ValueError) as ctx:
                report.get_official_report_from_excel(smallmodel_bytes)

        self.assertEqual(str(ctx.exception), report.SMALLMODEL_UPLOAD_UNSUPPORTED_MESSAGE)

    def test_get_official_compute_from_excel_blocks_smallmodel_original_upload(self):
        smallmodel_bytes = self._build_smallmodel_upload_bytes()

        with patch.object(report, "_post_to_api", side_effect=AssertionError("must not call API")):
            with self.assertRaises(ValueError) as ctx:
                report.get_official_compute_from_excel(smallmodel_bytes)

        self.assertEqual(str(ctx.exception), report.SMALLMODEL_UPLOAD_UNSUPPORTED_MESSAGE)

    def test_get_official_compute_from_excel_uses_uploaded_payload(self):
        excel_payload = b"PK\x03\x04excel-input"
        expected = {"Status": "OK"}

        def fake_post_to_api(url, excel_buffer, timeout=120):
            self.assertEqual(url, report.API_COMPUTE)
            excel_buffer.seek(0)
            self.assertEqual(excel_buffer.read(), excel_payload)
            return _FakeResponse(json_data=expected)

        with patch.object(report, "_post_to_api", side_effect=fake_post_to_api):
            result = report.get_official_compute_from_excel(excel_payload)

        self.assertEqual(result, expected)


if __name__ == "__main__":
    unittest.main()
