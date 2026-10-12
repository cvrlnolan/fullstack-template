from typing import Annotated

from fastapi import APIRouter, Depends

from api.core.config import Settings, get_settings
from api.schemas import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", operation_id="getHealth", response_model=HealthResponse)
async def get_health(settings: Annotated[Settings, Depends(get_settings)]) -> HealthResponse:
    return HealthResponse(status="ok", app_version=settings.APP_VERSION)
