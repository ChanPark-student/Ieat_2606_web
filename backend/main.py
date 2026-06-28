from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {
        "message": "OriginProof AI backend is running",
        "status": "success"
    }

@app.get("/health")
def health_check():
    return {
        "backend": "ok",
        "port": 8000
    }