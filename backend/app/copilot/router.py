from fastapi import APIRouter
from pydantic import BaseModel
from app.copilot.chat import copilot_chat

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


@router.post("/chat")
async def chat(req: ChatRequest):
    response = await copilot_chat(req.message, req.history)
    return {"response": response, "role": "assistant"}
