import pytest


def test_fake_ai_provider_is_deterministic(fake_ai_provider, valid_pdf: bytes) -> None:
    first = fake_ai_provider.translate(valid_pdf, "en", "es")
    second = fake_ai_provider.translate(valid_pdf, "en", "es")

    assert first == second
    assert len(fake_ai_provider.calls) == 2


@pytest.mark.parametrize("error", ["TIMEOUT", "RATE_LIMITED", "PROVIDER_ERROR"])
def test_fake_ai_provider_exposes_stable_errors(
    fake_ai_provider_factory, valid_pdf: bytes, error: str
) -> None:
    provider = fake_ai_provider_factory(error=error)

    with pytest.raises(RuntimeError) as raised:
        provider.translate(valid_pdf, "en", "es")

    assert raised.value.code == error
    assert len(provider.calls) == 1
    assert provider.calls[0][1:] == ("en", "es")
