import json
import unittest
from unittest.mock import MagicMock, patch

from api.services.ai_service import DeepSeekService


class TestDeepSeekService(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        # Patch config to avoid file I/O and encryption
        self.config_patcher = patch("config.secure_config.secure_config.load_config")
        self.mock_config = self.config_patcher.start()
        self.mock_config.return_value = {
            "api_key": "test_key",
            "base_url": "https://api.test.com",
            "model_version": "test-model",
        }

        self.service = DeepSeekService()
        # Mock the internal httpx client
        self.service.client = MagicMock()
        self.service.client.post = MagicMock()

    async def asyncTearDown(self):
        self.config_patcher.stop()

    async def test_interpret_prediction_success(self):
        # Mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "choices": [
                {
                    "message": {
                        "content": json.dumps(
                            {"summary": "Test Summary", "analysis": "Test Analysis", "risk_warning": "Test Risk"}
                        )
                    }
                }
            ]
        }

        # Async mock for post
        async def async_post(*args, **kwargs):
            return mock_response

        self.service.client.post = async_post

        data = {"red": [1, 2, 3, 4, 5, 6], "blue": 1, "confidence": 0.85, "details": {"xgboost": {}}}

        result = await self.service.interpret_prediction(data)

        self.assertEqual(result["summary"], "Test Summary")
        self.assertEqual(result["risk_warning"], "Test Risk")

    async def test_interpret_traditional_success(self):
        # Mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "choices": [
                {
                    "message": {
                        "content": json.dumps(
                            {
                                "original_text": "Test Original",
                                "translation": "Test Translation",
                                "symbolism": "Test Symbolism",
                                "suggestion": "Test Suggestion",
                            }
                        )
                    }
                }
            ]
        }

        async def async_post(*args, **kwargs):
            return mock_response

        self.service.client.post = async_post

        data = {"method": "meihua", "metadata": {"gua_info": {"ben_gua": "Qian"}}, "numbers": {"red": [1], "blue": 1}}

        result = await self.service.interpret_traditional(data)

        self.assertEqual(result["original_text"], "Test Original")
        self.assertEqual(result["translation"], "Test Translation")

    async def test_api_failure_handling(self):
        # Simulate exception
        async def async_post_fail(*args, **kwargs):
            raise Exception("Network Error")

        self.service.client.post = async_post_fail

        data = {"red": []}
        result = await self.service.interpret_prediction(data)
        self.assertIn("AI interpretation unavailable", result["error"])


if __name__ == "__main__":
    unittest.main()
