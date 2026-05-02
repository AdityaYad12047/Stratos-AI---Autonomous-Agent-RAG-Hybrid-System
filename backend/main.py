import uvicorn
from fastapi import FastAPI, WebSocket, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Stratos AI API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from src.agents.nodes import researcher_node, analyst_node, strategist_node, executor_node
import uuid
import json

# Global store for job states
jobs = {}

class GoalRequest(BaseModel):
    goal: str
    audience: Optional[str] = None
    constraints: Optional[str] = None
    user_id: str
    context_files: Optional[List[str]] = []

@app.get("/")
async def root():
    return {"status": "online", "message": "Stratos AI Titanium Engine is running"}

@app.post("/api/v1/stratagem/create")
async def create_stratagem(request: GoalRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "running", "logs": []}
    background_tasks.add_task(run_titanium_workflow, job_id, request.goal, request.audience, request.constraints)
    return {"job_id": job_id, "status": "initiated"}

async def run_titanium_workflow(job_id: str, goal: str, audience: str = None, constraints: str = None):
    """
    Direct sequence workflow (Titanium-Light)
    """
    state = {
        "goal": goal, 
        "audience": audience, 
        "constraints": constraints,
        "logs": [], 
        "insights": [], 
        "plan": "", 
        "artifacts": {}, 
        "is_complete": False
    }
    
    # 1. Researcher
    res = researcher_node(state)
    jobs[job_id]["logs"].extend(res["logs"])
    state.update(res)
    await asyncio.sleep(1) # Visual pacing

    # 2. Analyst
    res = analyst_node(state)
    jobs[job_id]["logs"].extend(res["logs"])
    state.update(res)
    await asyncio.sleep(1)

    # 3. Strategist
    res = strategist_node(state)
    jobs[job_id]["logs"].extend(res["logs"])
    state.update(res)
    await asyncio.sleep(1)

    # 4. Executor
    res = executor_node(state)
    jobs[job_id]["logs"].extend(res["logs"])
    state.update(res)
    
    jobs[job_id]["status"] = "completed"
    jobs[job_id]["result"] = state

@app.get("/api/v1/stratagem/{job_id}")
async def get_stratagem_result(job_id: str):
    if job_id not in jobs:
        return {"error": "Job not found"}, 404
    return jobs[job_id]

@app.websocket("/ws/v1/stratagem/{job_id}/logs")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    await websocket.accept()
    try:
        # Simple polling of the job state for demo purposes
        # In production, use Redis Pub/Sub
        last_log_count = 0
        while True:
            if job_id in jobs:
                current_logs = jobs[job_id].get("logs", [])
                if len(current_logs) > last_log_count:
                    for i in range(last_log_count, len(current_logs)):
                        await websocket.send_json(current_logs[i])
                    last_log_count = len(current_logs)
                
                if jobs[job_id]["status"] == "completed":
                    await websocket.send_json({"agent": "System", "message": "Task Completed."})
                    break
            
            await asyncio.sleep(1)
    except Exception as e:
        print(f"WS Error: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
