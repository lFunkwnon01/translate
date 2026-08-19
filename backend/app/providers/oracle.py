from __future__ import annotations

import oci

from app.providers.ai import AIProviderError


class OracleAIProvider:
    """Oracle Generative AI provider using Cohere Command A model."""

    def __init__(
        self,
        config_path: str = "~/.oci/config",
        config_profile: str = "ADMIN",
        endpoint: str = "https://inference.generativeai.us-chicago-1.oci.oraclecloud.com",
        model_id: str = "ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceyapnibwg42qjhwaxrlqfpreueirtwghiwvv2whsnwmnlva",
        compartment_id: str | None = None,
        max_tokens: int = 4000,
        temperature: float = 0.3,
    ):
        config = oci.config.from_file(config_path, config_profile)
        self._compartment_id = compartment_id or config["tenancy"]
        self._model_id = model_id
        self._max_tokens = max_tokens
        self._temperature = temperature

        self._client = oci.generative_ai_inference.GenerativeAiInferenceClient(
            config=config,
            service_endpoint=endpoint,
            retry_strategy=oci.retry.NoneRetryStrategy(),
            timeout=(10, 240),
        )

    def translate(self, source: bytes, source_language: str, target_language: str) -> bytes:
        text = source.decode("utf-8", errors="replace")

        prompt = (
            f"You are a professional translator for a scanlation group. "
            f"Translate the following text from {source_language} to {target_language}. "
            f"Preserve all formatting, line breaks, and special characters. "
            f"Only return the translated text, nothing else.\n\n"
            f"{text}"
        )

        try:
            chat_detail = oci.generative_ai_inference.models.ChatDetails()
            chat_request = oci.generative_ai_inference.models.CohereChatRequest()
            chat_request.message = prompt
            chat_request.max_tokens = self._max_tokens
            chat_request.temperature = self._temperature
            chat_request.top_p = 0.75
            chat_request.safety_mode = "CONTEXTUAL"

            chat_detail.serving_mode = oci.generative_ai_inference.models.OnDemandServingMode(
                model_id=self._model_id
            )
            chat_detail.chat_request = chat_request
            chat_detail.compartment_id = self._compartment_id

            response = self._client.chat(chat_detail)
            translated_text = response.data.chat_response.text
            return translated_text.encode("utf-8")

        except oci.exceptions.ServiceError as e:
            raise AIProviderError(f"Oracle AI error: {e.message}") from e
        except Exception as e:
            raise AIProviderError(f"Unexpected error: {e}") from e
