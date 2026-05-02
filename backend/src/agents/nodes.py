from .state import AgentState
from src.rag.engine import rag_engine
import time
import os
import json
import google.generativeai as genai

# Initialize Gemini Client
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

def researcher_node(state: AgentState):
    """
    Retrieves relevant context from the RAG engine.
    """
    print("--- STARTING RESEARCHER NODE ---")
    goal = state['goal']
    
    # Retrieve context based on the goal
    context = rag_engine.retrieve(goal)
    
    return {
        "context": context,
        "logs": [{"agent": "Researcher", "message": f"Retrieved relevant business context for: {goal}"}],
        "current_node": "researcher"
    }

def analyst_node(state: AgentState):
    """
    Extracts patterns and risks from the retrieved context using Gemini.
    """
    print("--- STARTING ANALYST NODE ---")
    goal = state['goal']
    audience = state.get('audience', 'General audience')
    constraints = state.get('constraints', 'No specific constraints')
    context = state.get('context', '')
    
    try:
        prompt = f"You are an expert business analyst. Based on the user's goal, provide exactly 3 bullet points of critical insights, risks, or market patterns. Return ONLY a valid JSON object with a single key 'insights' containing a list of strings. Do not include ```json markdown formatting.\n\nGoal: {goal}\nTarget Audience: {audience}\nConstraints: {constraints}\nContext: {context}"
        response = model.generate_content(prompt)
        
        # Clean up possible markdown from older gemini-pro
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        data = json.loads(text.strip())
        insights = data.get("insights", [])
        if not insights:
            insights = ["Analyzed market trends.", "Competitor gap identified.", "High demand detected."]
    except Exception as e:
        print(f"Gemini Error: {e}")
        insights = ["Failed to generate dynamic insights.", f"Gemini Error: {str(e)}", "Check backend logs for more details."]
    
    return {
        "insights": insights,
        "logs": [{"agent": "Analyst", "message": "Identifying key risks and opportunities from data..."}],
        "current_node": "analyst"
    }

def strategist_node(state: AgentState):
    """
    Converts insights into a business strategy using Gemini.
    """
    print("--- STARTING STRATEGIST NODE ---")
    insights = state['insights']
    goal = state['goal']
    audience = state.get('audience', 'General audience')
    constraints = state.get('constraints', 'No specific constraints')
    
    try:
        prompt = f"You are a strategic mastermind. Based on the goal and insights, generate a concise, 2-3 sentence strategic proposal that explicitly accounts for the target audience and constraints.\n\nGoal: {goal}\nTarget Audience: {audience}\nConstraints: {constraints}\nInsights: {insights}"
        response = model.generate_content(prompt)
        plan = response.text
    except Exception as e:
        plan = f"Strategy generation failed. Error: {str(e)}"
    
    return {
        "plan": plan,
        "logs": [{"agent": "Strategist", "message": "Synthesizing insights into a multi-phase growth plan..."}],
        "current_node": "strategist"
    }

def executor_node(state: AgentState):
    """
    Generates actionable artifacts using Gemini.
    """
    print("--- STARTING EXECUTOR NODE ---")
    plan = state['plan']
    
    try:
        prompt = f"You are an execution agent. Based on the strategic plan, generate a list of 2-4 actionable asset file names (like 'Email_Draft.md', 'Ad_Copy.csv', 'Roadmap.pdf'). Return ONLY a valid JSON object with a key 'assets' containing a list of strings. Do not include ```json markdown formatting.\n\nPlan: {plan}"
        response = model.generate_content(prompt)
        
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        data = json.loads(text.strip())
        asset_names = data.get("assets", ["Execution_Plan.pdf"])
    except Exception as e:
        asset_names = ["Error_Log.txt", "Fallback_Assets.zip"]
        
    artifacts = { name: "Mock file content based on plan" for name in asset_names }
    
    return {
        "artifacts": artifacts,
        "is_complete": True,
        "logs": [{"agent": "Executor", "message": "Generating final deliverables and automation drafts..."}],
        "current_node": "executor"
    }
