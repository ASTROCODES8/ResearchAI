"""
graph_client.py  —  Stage 4: Neo4j connection manager

Follows the same pattern as database.py (MongoDB) and qdrant_client.py:
  • Module-level global for the driver
  • init function called at app startup
  • close function called at shutdown
  • getter for other modules to use

Design decisions
────────────────
  • Uses the official neo4j Python driver (not py2neo, neomodel, etc.)
    — lightest weight, best maintained, direct Cypher access.
  • Creates uniqueness constraints on init so entity dedup is handled
    at the DB level, not in application code.
  • Connection is verified with a test query on init so startup fails
    fast if credentials are wrong or AuraDB instance is paused.
"""

import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv()

NEO4J_URI      = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

_driver = None


def init_neo4j():
    """
    Connect to Neo4j and create schema constraints.
    Call this once at app startup (main.py lifespan).
    """
    global _driver

    if not NEO4J_URI or not NEO4J_USERNAME or not NEO4J_PASSWORD:
        raise ValueError("NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD must be set in .env")

    _driver = GraphDatabase.driver(
        NEO4J_URI,
        auth=(NEO4J_USERNAME, NEO4J_PASSWORD),
    )

    # Verify the connection is alive
    _driver.verify_connectivity()

    # Create schema constraints for entity dedup
    with _driver.session() as session:
        # Uniqueness constraint: (Entity.name) — prevents duplicate entity nodes
        # "IF NOT EXISTS" keeps init idempotent
        session.run(
            "CREATE CONSTRAINT entity_name_unique IF NOT EXISTS "
            "FOR (e:Entity) REQUIRE e.name IS UNIQUE"
        )

    print("✅  Neo4j connected — constraints ensured")


def close_neo4j():
    """Close the Neo4j driver. Call at app shutdown."""
    global _driver
    if _driver:
        _driver.close()
        _driver = None


def get_neo4j_driver():
    """Return the Neo4j driver instance for other modules to use."""
    return _driver
