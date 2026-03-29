import json
import logging

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from config.prompt_manager import prompt_manager
from config.secure_config import secure_config

logger = logging.getLogger(__name__)


class DeepSeekService:
    def __init__(self):
        self.config = secure_config.load_config()
        self.api_key = self.config.get("api_key")
        self.base_url = self.config.get("base_url", "https://api.deepseek.com/v1")
        self.model = self.config.get("model_version", "deepseek-chat")
        self.client = httpx.AsyncClient(
            base_url=self.base_url, headers={"Authorization": f"Bearer {self.api_key}"}, timeout=30.0
        )

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def _call_api(self, messages, temperature=0.7):
        try:
            response = await self.client.post(
                "/chat/completions",
                json={
                    "model": self.model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": self.config.get("max_tokens", 2048),
                    "response_format": {"type": "json_object"},
                },
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"DeepSeek API Error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"DeepSeek Connection Error: {str(e)}")
            raise

    async def interpret_prediction(self, prediction_data):
        """
        Interpret standard prediction results.
        """
        try:
            prompt = prompt_manager.get_prompt(
                "prediction_interpretation",
                red_balls=prediction_data.get("red"),
                blue_ball=prediction_data.get("blue"),
                confidence=prediction_data.get("confidence"),
                algorithms=prediction_data.get("details", {}).keys(),
            )

            messages = [
                {"role": "system", "content": "You are a helpful assistant designed to output JSON."},
                {"role": "user", "content": prompt},
            ]

            result = await self._call_api(messages)
            content = result["choices"][0]["message"]["content"]
            return json.loads(content)
        except Exception as e:
            logger.error(f"Interpretation failed: {str(e)}")
            return {"error": f"AI interpretation unavailable: {str(e)}"}

    async def interpret_traditional(self, traditional_data):
        """
        Interpret traditional numerology results.
        """
        try:
            # Format metadata for better prompt context
            metadata_str = json.dumps(traditional_data.get("metadata", {}), ensure_ascii=False, indent=2)

            prompt = prompt_manager.get_prompt(
                "traditional_interpretation",
                method_name=traditional_data.get("method"),
                metadata=metadata_str,
                red_balls=traditional_data.get("numbers", {}).get("red"),
                blue_ball=traditional_data.get("numbers", {}).get("blue"),
            )

            messages = [
                {"role": "system", "content": "You are a helpful assistant designed to output JSON."},
                {"role": "user", "content": prompt},
            ]

            result = await self._call_api(messages, temperature=0.8)  # Higher temp for creativity
            content = result["choices"][0]["message"]["content"]
            return json.loads(content)
        except Exception as e:
            logger.error(f"Traditional interpretation failed: {str(e)}")
            return {"error": "AI interpretation unavailable"}

    async def close(self):
        await self.client.aclose()


# Singleton-like usage
ai_service = DeepSeekService()
