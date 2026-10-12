from typing import Literal

from pydantic import Field

from api.schemas.base import ApiModel


class ChatMessage(ApiModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(ApiModel):
    messages: list[ChatMessage] = Field(min_length=1)
    max_tokens: int = Field(default=1024, ge=1, le=8192)
