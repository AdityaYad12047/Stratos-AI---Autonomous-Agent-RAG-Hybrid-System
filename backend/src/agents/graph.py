from langgraph.graph import StateGraph, END
from .state import AgentState
from .nodes import researcher_node, analyst_node, strategist_node, executor_node

def create_stratos_graph():
    # Initialize the graph with the state schema
    workflow = StateGraph(AgentState)

    # Add the agent nodes
    workflow.add_node("researcher", researcher_node)
    workflow.add_node("analyst", analyst_node)
    workflow.add_node("strategist", strategist_node)
    workflow.add_node("executor", executor_node)

    # Set the entry point
    workflow.set_entry_point("researcher")

    # Define the edges (transitions)
    workflow.add_edge("researcher", "analyst")
    workflow.add_edge("analyst", "strategist")
    workflow.add_edge("strategist", "executor")
    workflow.add_edge("executor", END)

    # Compile the graph
    return workflow.compile()

# Example usage (for internal testing)
# graph = create_stratos_graph()
# config = {"configurable": {"thread_id": "1"}}
# result = graph.invoke({"goal": "Grow SaaS in Asia", "logs": []}, config)
