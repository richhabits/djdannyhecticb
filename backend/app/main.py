from fastapi import FastAPI
app = FastAPI(title="DJ Danny Hectic B - Broadcast Engine API")
@app.get("/")
def read_root():
    return {"status": "online", "message": "Broadcast Engine API is running"}
