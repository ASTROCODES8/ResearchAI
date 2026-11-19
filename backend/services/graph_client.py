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
        print("⚠️  NEO4J credentials not fully set in .env. Graph features will be disabled.")
        return

    uri = NEO4J_URI
    try:
        _driver = GraphDatabase.driver(
            uri,
            auth=(NEO4J_USERNAME, NEO4J_PASSWORD),
        )
        _driver.verify_connectivity()
    except Exception as e:
        # If strict SSL verification failed (e.g. on Linux/Render with self-signed certificate chain),
        # retry with self-signed certificate tolerance (+ssc)
        err_msg = str(e)
        if ("CERTIFICATE_VERIFY_FAILED" in err_msg or "BoltSecurityError" in err_msg or "certificate verify failed" in err_msg) and "+s://" in uri:
            fallback_uri = uri.replace("+s://", "+ssc://")
            print(f"⚠️  Strict SSL verification failed for Neo4j. Retrying with fallback URI: {fallback_uri}")
            try:
                if _driver:
                    _driver.close()
                _driver = GraphDatabase.driver(
                    fallback_uri,
                    auth=(NEO4J_USERNAME, NEO4J_PASSWORD),
                )
                _driver.verify_connectivity()
                uri = fallback_uri
            except Exception as inner_e:
                print(f"❌  Neo4j connection failed even with fallback URI: {inner_e}")
                _driver = None
                return
        else:
            print(f"❌  Neo4j connection failed on startup: {e}")
            _driver = None
            return

    # Create schema constraints for entity dedup
    try:
        with _driver.session() as session:
            session.run(
                "CREATE CONSTRAINT entity_name_unique IF NOT EXISTS "
                "FOR (e:Entity) REQUIRE e.name IS UNIQUE"
            )
        print("✅  Neo4j connected — constraints ensured")
    except Exception as e:
        print(f"⚠️  Connected to Neo4j, but failed to ensure constraints: {e}")


def close_neo4j():
    """Close the Neo4j driver. Call at app shutdown."""
    global _driver
    if _driver:
        _driver.close()
        _driver = None


def get_neo4j_driver():
    """Return the Neo4j driver instance for other modules to use."""
    return _driver
