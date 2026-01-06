import asyncio
import os
import sys

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.db_service import get_db_service

async def seed_tenants():
    print("🌱 Seeding Tenants...")
    db = get_db_service()

    tenants = [
        {
            "id": "ness-health",
            "name": "Ness Health",
            "status": "active",
            "plan": "enterprise",
            "config": {
                "mcp_enabled": True,
                "rag_enabled": True,
                "domain": "health.ness.com.br"
            }
        },
        {
            "id": "demo-corp",
            "name": "Demo Corporation",
            "status": "active",
            "plan": "starter",
            "config": {
                "mcp_enabled": True,
                "rag_enabled": False
            }
        }
    ]

    for tenant in tenants:
        tid = tenant.pop("id")
        await db.create_tenant(tid, tenant)
        print(f"✅ Tenant Created: {tid} ({tenant['name']})")

    print("\n🎉 Seed Complete!")

if __name__ == "__main__":
    # Ensure GOOGLE_CLOUD_PROJECT is set
    if not os.getenv("GOOGLE_CLOUD_PROJECT"):
        print("⚠️  GOOGLE_CLOUD_PROJECT not set. Defaulting to 'nprocess-prod'.")
        os.environ["GOOGLE_CLOUD_PROJECT"] = "nprocess-prod"
    
    asyncio.run(seed_tenants())
