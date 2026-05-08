from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.copilot.chat import copilot_chat

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


@router.post("/chat")
async def chat(req: ChatRequest):
    try:
        response = await copilot_chat(req.message, req.history)
        return {"response": response, "role": "assistant"}
    except Exception as e:
        err = str(e)
        # Return a friendly error that still has CORS headers (JSONResponse, not a crash)
        if "ReadTimeout" in err or "Timeout" in err:
            msg = (
                "⏱️ The AI response timed out. The NVIDIA API took too long to respond.\n\n"
                "**Try:**\n"
                "- Ask a shorter question\n"
                "- Check your `NVIDIA_API_KEY` in `.env`\n"
                "- The mock mode responses work offline without a key"
            )
        elif "401" in err or "Unauthorized" in err:
            msg = "🔑 Invalid `NVIDIA_API_KEY`. Check your `.env` file and restart the backend."
        else:
            msg = f"⚠️ AI error: {err[:120]}"
        return JSONResponse(
            status_code=200,
            content={"response": msg, "role": "assistant"},
        )
