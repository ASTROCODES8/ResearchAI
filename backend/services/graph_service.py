"""
graph_service.py  —  Stage 4: Write extracted graph to Neo4j

Responsibilities
────────────────
  • Take the validated dict from Stage 3 (entities + relations)
  • Write it to Neo4j using efficient batch queries (UNWIND)
  • Handle entity deduplication natively via Cypher MERGE

Design decisions
────────────────
  • Entity Nodes: Labelled `Entity`. Properties: `name` (unique), `type`.
  • Relationships: Since Neo4j does not allow dynamic relationship types in
    standard Cypher without APOC, we use a single canonical relationship
    type `RELATED_TO`, and store the actual extracted relation (e.g. "USES")
    as a property `name` on the edge.
  • Tagging: Edges are tagged with `paper_id` and `user_id` so we can filter
    context at query time (Stage 6) to only facts from the user's papers.
"""

from services.graph_client import get_neo4j_driver


def upsert_paper_graph(paper_id: str, user_id: str, graph_data: dict) -> int:
    """
    Write entities and relations to Neo4j.

    graph_data format (from Stage 3):
      {
        "entities": [{"name": "BERT", "type": "Model"}, ...],
        "relations": [{"source": "BERT", "relation": "USES", "target": "Transformer"}, ...]
      }

    Returns the number of relationships written.
    """
    entities = graph_data.get("entities", [])
    relations = graph_data.get("relations", [])

    if not entities or not relations:
        print(f"⚠️  Graph write skipped for {paper_id}: No entities/relations extracted")
        return 0

    driver = get_neo4j_driver()
    if not driver:
        print("⚠️  Neo4j driver not initialized. Graph write skipped.")
        return 0

    with driver.session() as session:
        # 1. Batch upsert Entities
        # MERGE matches on `name` (our unique constraint).
        # ON CREATE sets the initial type. ON MATCH overwrites it (last writer wins).
        session.run(
            """
            UNWIND $entities AS ent
            MERGE (e:Entity {name: ent.name})
            SET e.type = ent.type
            """,
            entities=entities
        )

        # 2. Batch upsert Relationships
        # We match the source and target nodes, then MERGE the edge.
        # Edge identity is defined by (source)-[relation_name, paper_id]->(target).
        # This allows multiple papers to assert the same or different relations between same entities.
        session.run(
            """
            UNWIND $relations AS rel
            MATCH (source:Entity {name: rel.source})
            MATCH (target:Entity {name: rel.target})
            MERGE (source)-[r:RELATED_TO {
                name: rel.relation,
                paper_id: $paper_id
            }]->(target)
            SET r.user_id = $user_id
            """,
            relations=relations,
            paper_id=paper_id,
            user_id=user_id
        )

    print(f"✅  Graph written → Neo4j ({len(entities)} nodes, {len(relations)} edges for {paper_id})")
    return len(relations)


def delete_paper_graph(paper_id: str):
    """
    Remove all relationships belonging to this paper.
    Orphaned entities (nodes with no edges) are cleaned up afterward.
    """
    driver = get_neo4j_driver()
    if not driver:
        return

    with driver.session() as session:
        # 1. Delete the paper's edges
        session.run(
            """
            MATCH ()-[r:RELATED_TO {paper_id: $paper_id}]->()
            DELETE r
            """,
            paper_id=paper_id
        )

        # 2. Cleanup orphaned nodes (entities that have no connections left)
        session.run(
            """
            MATCH (e:Entity)
            WHERE NOT (e)--()
            DELETE e
            """
        )
    print(f"🗑️  Deleted graph data for paper_id={paper_id}")
