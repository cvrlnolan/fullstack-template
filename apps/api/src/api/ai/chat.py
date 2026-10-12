from collections.abc import AsyncIterator

from anthropic import AsyncAnthropic

from api.config import Settings
from api.schemas import ChatMessage


async def stream_chat(messages: list[ChatMessage], settings: Settings) -> AsyncIterator[str]:
    """Yield text chunks from the model. Falls back to a stub when no API key is set."""
    if not settings.anthropic_api_key:
        yield "Set ANTHROPIC_API_KEY in .env to get real responses."
        return

    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    async with client.messages.stream(
        model=settings.anthropic_model,
        max_tokens=1024,
        messages=[{"role": m.role, "content": m.content} for m in messages],
    ) as stream:
        async for text in stream.text_stream:
            yield text
