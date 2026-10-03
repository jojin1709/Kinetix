from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.db import init_db
from app.routes import generate, history, system

app = FastAPI(title="Kinetix API", version="0.1.0")

# The frontend runs on a separate dev-server port (Next.js default 3000)
# while the API runs on 8000, so CORS needs to be open for local use.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router)
app.include_router(history.router)
app.include_router(system.router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/health")
def health():
    return {"status": "ok"}
