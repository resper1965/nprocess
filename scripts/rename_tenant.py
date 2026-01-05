import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.db_service import get_db_service

async def rename_tenant():
    print("🔄 Renaming Tenant 'ness-health' -> 'ness-enterprise'...")
    db = get_db_service()
    
    # 1. Get old data
    old_data = await db.get_tenant("ness-health")
    if not old_data:
        print("⚠️ Tenant 'ness-health' not found. Maybe already renamed?")
        # Just ensure 'ness-enterprise' exists then
        old_data = {
            "name": "Ness Enterprise",
            "status": "active",
            "plan": "enterprise",
            "config": {"mcp_enabled": True, "rag_enabled": True}
        }
    else:
        # Update name
        old_data["name"] = "Ness Enterprise"
        # Remove ID from data if present to avoid nesting
        old_data.pop("id", None)

    # 2. Create new
    await db.create_tenant("ness-enterprise", old_data)
    print("✅ Created 'ness-enterprise'")

    # 3. Delete old
    try:
        db.db.collection("tenants").document("ness-health").delete()
        print("🗑️ Deleted 'ness-health'")
    except Exception as e:
        print(f"⚠️ Could not delete 'ness-health': {e}")

if __name__ == "__main__":
    if not os.getenv("GOOGLE_CLOUD_PROJECT"):
        os.environ["GOOGLE_CLOUD_PROJECT"] = "nprocess-prod"
    asyncio.run(rename_tenant())
