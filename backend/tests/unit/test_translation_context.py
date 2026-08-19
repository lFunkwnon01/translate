from app.translation.context import ContextManager
from app.translation.rag import LocalRAG


def test_context_manager_builds_window_and_remembers_glossary() -> None:
    manager = ContextManager(window_size=1)
    manager.remember("Hello", "Hola")

    context = manager.build(1, ["Before", "Current", "After"], ["Related"])

    assert context["before"] == ["Before"]
    assert context["after"] == ["After"]
    assert context["retrieved"] == ["Related"]
    assert context["glossary"] == {"Hello": "Hola"}


def test_local_rag_returns_related_document_context() -> None:
    rag = LocalRAG()
    rag.add("The dragon attacks the city")
    rag.add("A quiet forest appears")

    assert rag.search("dragon city") == ["The dragon attacks the city"]
