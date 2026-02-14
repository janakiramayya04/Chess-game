from fastapi import FastAPI

app=FastAPI()

@app.post("/start")
async def start_here():
    return "start the game"