"""Tests for official API retry logic."""

import io
import time
from unittest.mock import MagicMock, patch

import pytest
import requests

from app.services.report import OfficialAPITimeoutError, _post_to_api, _apply_exponential_backoff_with_jitter


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

    def test_4xx_errors_not_retried(self) -> None:
        """Verify that client errors (4xx) are NOT retried - they fail immediately."""
        fail_resp = MagicMock()
        fail_resp.status_code = 400
        fail_resp.text = "Bad Request"
        fail_exc = requests.exceptions.HTTPError(response=fail_resp)

        with patch("app.services.report.requests.post", side_effect=fail_exc):
            with pytest.raises(requests.exceptions.HTTPError):
                _post_to_api("https://example.com/api", self._make_buffer(), max_retries=3)

    def test_4xx_errors_fail_immediately_without_retries(self) -> None:
        """Verify that 400, 401, 403, 404 etc. are not retried."""
        for status_code in [400, 401, 403, 404, 405]:
            fail_resp = MagicMock()
            fail_resp.status_code = status_code
            fail_resp.text = f"Client Error {status_code}"
            fail_exc = requests.exceptions.HTTPError(response=fail_resp)

            with patch("app.services.report.requests.post", side_effect=fail_exc) as mock_post:
                with pytest.raises(requests.exceptions.HTTPError):
                    _post_to_api("https://example.com/api", self._make_buffer(), max_retries=3)
                # Should only be called once, not retried
                assert mock_post.call_count == 1

    def test_5xx_errors_are_retried(self) -> None:
        """Verify that server errors (5xx) ARE retried."""
        fail_resp = MagicMock()
        fail_resp.status_code = 502
        fail_resp.text = "Bad Gateway"
        fail_exc = requests.exceptions.HTTPError(response=fail_resp)

        ok_resp = MagicMock()
        ok_resp.status_code = 200
        ok_resp.raise_for_status = MagicMock()

        with patch("app.services.report.requests.post", side_effect=[fail_exc, ok_resp]) as mock_post:
            with patch("time.sleep", return_value=None):
                resp = _post_to_api("https://example.com/api", self._make_buffer(), max_retries=3)
                assert resp.status_code == 200
                # Should have retried after the 502
                assert mock_post.call_count == 2

    def test_exponential_backoff_with_jitter(self) -> None:
        """Verify that exponential backoff with jitter is applied."""
        with patch("app.services.report.time.sleep") as mock_sleep, \
             patch("app.services.report.random.uniform", return_value=0.5):
            _apply_exponential_backoff_with_jitter(attempt=1, base_delay=1.0, max_delay=10.0)
            mock_sleep.assert_called_once()
            # With attempt=1, exponential = 1 * 2^1 = 2, capped to max_delay=10, jitter should be called with (0, 2)
            args = mock_sleep.call_args[0]
            assert args[0] == 0.5  # The jittered value returned by uniform()

    def test_exponential_backoff_timing_increases_with_attempts(self) -> None:
        """Verify that backoff delays increase with retry attempts."""
        with patch("app.services.report.random.uniform") as mock_jitter:
            # For attempt 1: exponential = 1 * 2^1 = 2
            # For attempt 2: exponential = 1 * 2^2 = 4
            # For attempt 3: exponential = 1 * 2^3 = 8
            mock_jitter.side_effect = [0.5, 0.5, 0.5]
            with patch("app.services.report.time.sleep") as mock_sleep:
                _apply_exponential_backoff_with_jitter(1)
                _apply_exponential_backoff_with_jitter(2)
                _apply_exponential_backoff_with_jitter(3)

                assert mock_sleep.call_count == 3
                # Check that jitter was called with increasingly larger ranges
                calls = mock_jitter.call_args_list
                assert calls[0][0] == (0, 2.0)   # attempt 1: 2^1 = 2
                assert calls[1][0] == (0, 4.0)   # attempt 2: 2^2 = 4
                assert calls[2][0] == (0, 8.0)   # attempt 3: 2^3 = 8

    def test_connection_errors_are_retried(self) -> None:
        """Verify that ConnectionError and ConnectionResetError are retried."""
        with patch("app.services.report.requests.post", side_effect=ConnectionError("refused")):
            with patch("time.sleep", return_value=None):
                with pytest.raises(Exception, match="API request failed"):
                    _post_to_api("https://example.com/api", self._make_buffer(), max_retries=2)
                # Should retry after connection error
