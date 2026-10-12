from collections.abc import AsyncIterator

from anthropic import AsyncAnthropic

from api.core.config import Settings
from api.schemas import ChatRequest


async def stream_chat(request: ChatRequest, settings: Settings) -> AsyncIterator[str]:
    """Yield text chunks from the model. Falls back to a stub when no API key is set."""
    if not settings.ANTHROPIC_API_KEY:
        yield "Set ANTHROPIC_API_KEY in .env to get real responses."
        return

    client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    async with client.messages.stream(
        model=settings.ANTHROPIC_MODEL,
        max_tokens=request.max_tokens,
        messages=[{"role": m.role, "content": m.content} for m in request.messages],
    ) as stream:
        async for text in stream.text_stream:
            yield text
