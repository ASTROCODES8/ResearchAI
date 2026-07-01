import asyncio
from fastapi import APIRouter, HTTPException, Depends
from services.auth_dependency import get_current_user
from services.graph_client import get_neo4j_driver
from vectorstore.qdrant_client import get_qdrant_client, get_collection_name
from qdrant_client.models import Filter, FieldCondition, MatchValue

router = APIRouter(prefix="/papers", tags=["graph"])

@router.get("/{paper_id}/graph")
async def get_full_graph(paper_id: str, user_id: str = Depends(get_current_user)):
    # 1. Get chunk count from Qdrant
    q_client = get_qdrant_client()
    try:
        count_result = await asyncio.to_thread(
            q_client.count,
            collection_name=get_collection_name(),
            count_filter=Filter(must=[FieldCondition(key="paper_id", match=MatchValue(value=paper_id))])
        )
        chunk_count = count_result.count
    except Exception as e:
        print(f"Failed to count chunks in Qdrant: {e}")
        chunk_count = 0

    # 2. Get graph data and stats from Neo4j
    driver = get_neo4j_driver()
    if not driver:
        raise HTTPException(status_code=500, detail="Neo4j not connected")
        
    def _get_graph_and_stats(tx):
        # A. Full graph data (nodes and edges)
        res = tx.run(
            """
            MATCH (source:Entity)-[r:RELATED_TO {paper_id: $paper_id}]->(target:Entity)
            RETURN source.name as source_id, source.type as source_type,
                   target.name as target_id, target.type as target_type,
                   r.name as label
            """,
            paper_id=paper_id
        )
        
        nodes_dict = {}
        edges = []
        for record in res:
            src = record["source_id"]
            tgt = record["target_id"]
            
            if src not in nodes_dict:
                nodes_dict[src] = {"id": src, "label": src, "type": record["source_type"]}
            if tgt not in nodes_dict:
                nodes_dict[tgt] = {"id": tgt, "label": tgt, "type": record["target_type"]}
                
            edges.append({
                "source": src,
                "target": tgt,
                "label": record["label"]
            })

        # B. Entity and relationship count
        entity_count = len(nodes_dict)
        relationship_count = len(edges)
        
        # C. Top concepts (nodes with most connections for this paper)
        top_res = tx.run(
            """
            MATCH (e:Entity)-[r:RELATED_TO {paper_id: $paper_id}]-()
            RETURN e.name as name, count(r) as degree
            ORDER BY degree DESC
            LIMIT 10
            """,
            paper_id=paper_id
        )
        top_concepts = [record["name"] for record in top_res]
        
        return {
            "nodes": list(nodes_dict.values()),
            "edges": edges,
            "stats": {
                "chunk_count": chunk_count,
                "entity_count": entity_count,
                "relationship_count": relationship_count,
                "top_concepts": top_concepts,
                "status": "processed" if chunk_count > 0 else "pending"
            }
        }

    with driver.session() as session:
        graph_data = await asyncio.to_thread(session.execute_read, _get_graph_and_stats)
        
    return graph_data
