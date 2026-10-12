from fastapi import FastAPI

from api.routers import chat, health

app = FastAPI(title="API")
app.include_router(health.router)
app.include_router(chat.router)
