from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from api.ai.chat import stream_chat
from api.config import Settings, get_settings
from api.schemas import ChatRequest

router = APIRouter(tags=["chat"])


@router.post("/chat")
async def chat(
    body: ChatRequest, settings: Annotated[Settings, Depends(get_settings)]
) -> StreamingResponse:
    return StreamingResponse(stream_chat(body.messages, settings), media_type="text/plain")
