from api.schemas.base import ApiModel


class HealthResponse(ApiModel):
    status: str
    app_version: str
