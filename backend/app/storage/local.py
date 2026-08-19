import hashlib
import os
from pathlib import Path


class LocalStorage:
    def __init__(self, root: str):
        self.root = Path(root).resolve()
        self.root.mkdir(parents=True, exist_ok=True)
        os.chmod(self.root, 0o700)

    def save_document(self, owner_key: str, document_id: str, content: bytes) -> tuple[str, str]:
        owner_dir = self.root / hashlib.sha256(owner_key.encode()).hexdigest() / document_id
        owner_dir.mkdir(parents=True, exist_ok=True)
        os.chmod(owner_dir.parent, 0o700)
        os.chmod(owner_dir, 0o700)
        path = owner_dir / "original.pdf"
        path.write_bytes(content)
        os.chmod(path, 0o600)
        return str(path), hashlib.sha256(content).hexdigest()

    def save_artifact(self, owner_key: str, job_id: str, content: bytes) -> str:
        owner_dir = self.root / hashlib.sha256(owner_key.encode()).hexdigest() / job_id
        owner_dir.mkdir(parents=True, exist_ok=True)
        os.chmod(owner_dir, 0o700)
        path = owner_dir / "translated.pdf"
        path.write_bytes(content)
        os.chmod(path, 0o600)
        return str(path)

    def artifact_path(self, owner_key: str, job_id: str, stored_path: str) -> Path:
        owner_dir = self.root / hashlib.sha256(owner_key.encode()).hexdigest()
        candidate = Path(stored_path).resolve()
        if candidate.parent != (owner_dir / job_id).resolve() or candidate.name != "translated.pdf":
            raise ValueError("artifact path is outside the owner sandbox")
        return candidate
