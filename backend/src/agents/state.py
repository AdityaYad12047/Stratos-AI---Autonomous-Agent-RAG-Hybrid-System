from typing import TypedDict, List, Annotated
import operator

class AgentState(TypedDict):
    # The original goal
    goal: str
    # Context retrieved from RAG
    context: str
    # Analysis from the Analyst Agent
    insights: List[str]
    # Strategic plan from the Strategy Agent
    plan: str
    # Final executable artifacts
    artifacts: dict
    # History of agent thoughts for the UI
    logs: Annotated[List[dict], operator.add]
    # The current active node
    current_node: str
    # Whether the task is finished
    is_complete: bool
