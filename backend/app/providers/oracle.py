from __future__ import annotations

from typing import cast

import oci  # type: ignore[import-untyped]

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
        return self.translate_segment(source.decode("utf-8", errors="replace"), {}, source_language, target_language).encode("utf-8")

    def translate_segment(
        self,
        text: str,
        context: dict[str, object],
        source_language: str,
        target_language: str,
    ) -> str:
        before = "\n".join(cast(list[str], context.get("before", [])))
        after = "\n".join(cast(list[str], context.get("after", [])))
        retrieved = "\n".join(cast(list[str], context.get("retrieved", [])))
        glossary_value = context.get("glossary", {})
        glossary = "\n".join(
            f"- {key}: {value}" for key, value in cast(dict[str, str], glossary_value).items()
        ) if isinstance(glossary_value, dict) else ""

        prompt = (
            "You are a professional PDF translator for a scanlation group. "
            f"Translate from {source_language} to {target_language}.\n"
            "Preserve line breaks, placeholders, punctuation, sound effects, and tone. "
            "Use the context and glossary for consistency. Return only the translation.\n\n"
            f"Previous context:\n{before}\n\n"
            f"Relevant retrieved context:\n{retrieved}\n\n"
            f"Glossary:\n{glossary}\n\n"
            f"Next context:\n{after}\n\n"
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
            return translated_text

        except oci.exceptions.ServiceError as e:
            raise AIProviderError(f"Oracle AI error: {e.message}") from e
        except Exception as e:
            raise AIProviderError(f"Unexpected error: {e}") from e
