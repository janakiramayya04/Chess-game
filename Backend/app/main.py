from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware


from app.router import api_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix="/api/v1")
