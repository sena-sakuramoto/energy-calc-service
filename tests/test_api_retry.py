"""Tests for official API retry logic."""

import io
from unittest.mock import MagicMock, patch

import pytest
import requests

from app.services.report import OfficialAPITimeoutError, _post_to_api


class TestApiRetry:
    """Verify _post_to_api retries on transient failures."""

    def _make_buffer(self) -> io.BytesIO:
        buf = io.BytesIO(b"fake-excel-content")
        buf.seek(0)
        return buf

    def test_success_on_first_try(self) -> None:
        fake_resp = MagicMock()
        fake_resp.status_code = 200
        fake_resp.raise_for_status = MagicMock()
        with patch("app.services.report.requests.post", return_value=fake_resp):
            resp = _post_to_api("https://example.com/api", self._make_buffer())
            assert resp.status_code == 200

    def test_retry_on_500_then_succeed(self) -> None:
        fail_resp = MagicMock()
        fail_resp.status_code = 500
        fail_resp.text = "Internal Server Error"
        fail_exc = requests.exceptions.HTTPError(response=fail_resp)

        ok_resp = MagicMock()
        ok_resp.status_code = 200
        ok_resp.raise_for_status = MagicMock()

        with patch("app.services.report.requests.post", side_effect=[fail_exc, ok_resp]):
            resp = _post_to_api("https://example.com/api", self._make_buffer())
            assert resp.status_code == 200

    def test_fail_after_max_retries(self) -> None:
        with patch(
            "app.services.report.requests.post",
            side_effect=requests.exceptions.ConnectionError("refused"),
        ):
            with pytest.raises(Exception, match="API request failed"):
                _post_to_api("https://example.com/api", self._make_buffer())

    def test_default_timeout_uses_connect_and_read_limits(self) -> None:
        """Verify default timeout is connect/read tuple, not legacy long timeout."""
        ok_resp = MagicMock()
        ok_resp.status_code = 200
        ok_resp.raise_for_status = MagicMock()

        with patch("app.services.report.requests.post", return_value=ok_resp) as mock_post:
            _post_to_api("https://example.com/api", self._make_buffer())
            _, kwargs = mock_post.call_args
            assert kwargs["timeout"] == (10, 30)

    def test_timeout_raises_official_timeout_error_after_retries(self) -> None:
        with patch(
            "app.services.report.requests.post",
            side_effect=requests.exceptions.Timeout("read timed out"),
        ) as mock_post, patch("time.sleep", return_value=None):
            with pytest.raises(OfficialAPITimeoutError, match="Official API timeout"):
                _post_to_api("https://example.com/api", self._make_buffer(), max_retries=2)
            assert mock_post.call_count == 2
