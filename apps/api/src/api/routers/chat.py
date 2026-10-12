from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from api.core.config import Settings, get_settings
from api.schemas import ChatRequest
from api.services.chat import stream_chat

router = APIRouter(tags=["chat"])


@router.post(
    "/chat",
    operation_id="streamChat",
    response_class=StreamingResponse,
    responses={200: {"content": {"text/plain": {"schema": {"type": "string"}}}}},
)
async def chat(
    body: ChatRequest, settings: Annotated[Settings, Depends(get_settings)]
) -> StreamingResponse:
    return StreamingResponse(stream_chat(body, settings), media_type="text/plain")
