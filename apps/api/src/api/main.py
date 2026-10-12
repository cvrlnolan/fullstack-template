from fastapi import FastAPI

from api.routers import chat, health


def create_app() -> FastAPI:
    app = FastAPI(title="API", version="0.0.0")
    app.include_router(health.router)
    app.include_router(chat.router)
    return app


app = create_app()
