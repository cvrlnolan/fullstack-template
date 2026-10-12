from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from api.core.config import Settings, get_settings
from api.main import app


@pytest.fixture
def client() -> Iterator[TestClient]:
    # Never hit the real model in tests, regardless of the developer's .env.
    app.dependency_overrides[get_settings] = lambda: Settings(ANTHROPIC_API_KEY=None)
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_health_uses_camel_case(client: TestClient) -> None:
    assert client.get("/health").json() == {"status": "ok", "appVersion": "0.0.0"}


def test_chat_without_key_streams_stub(client: TestClient) -> None:
    res = client.post(
        "/chat", json={"messages": [{"role": "user", "content": "hi"}], "maxTokens": 10}
    )
    assert res.status_code == 200
    assert "ANTHROPIC_API_KEY" in res.text


def test_chat_requires_messages(client: TestClient) -> None:
    assert client.post("/chat", json={"messages": []}).status_code == 422
