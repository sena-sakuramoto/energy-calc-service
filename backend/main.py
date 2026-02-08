"""Legacy entrypoint kept for deployment scripts."""

from app.main import app  # re-export for compatibility

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
