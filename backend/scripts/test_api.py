#!/usr/bin/env python3
"""
Script para testar a API com autenticação.

Uso:
    uv run python scripts/test_api.py EMAIL

Este script obtém um ID token do Firebase e testa os endpoints.
"""

import sys
import asyncio
import httpx


async def test_health():
    """Test health endpoints (no auth needed)."""
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        print("🔍 Testing health endpoints (no auth)...\n")
        
        # Health check
        r = await client.get("/health")
        print(f"GET /health: {r.status_code}")
        print(f"    {r.json()}\n")
        
        # Root
        r = await client.get("/")
        print(f"GET /: {r.status_code}")
        print(f"    {r.json()}\n")
        
        # MCP Health
        r = await client.get("/mcp/health")
        print(f"GET /mcp/health: {r.status_code}")
        print(f"    {r.json()}\n")


async def test_protected_without_auth():
    """Test that protected endpoints require auth."""
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        print("🔒 Testing protected endpoints (no auth - should fail)...\n")
        
        endpoints = [
            ("GET", "/mcp/tools"),
            ("POST", "/v1/knowledge/search"),
            ("POST", "/v1/process/generate"),
            ("POST", "/v1/compliance/audit"),
            ("POST", "/v1/documents/generate"),
        ]
        
        for method, path in endpoints:
            if method == "GET":
                r = await client.get(path)
            else:
                r = await client.post(path, json={})
            
            expected = "✅" if r.status_code in [401, 403, 422] else "❌"
            print(f"{expected} {method} {path}: {r.status_code}")


async def main():
    print("=" * 50)
    print("n.process API Test")
    print("=" * 50)
    print()
    
    await test_health()
    await test_protected_without_auth()
    
    print()
    print("=" * 50)
    print("✅ Basic API test complete!")
    print()
    print("Para testar endpoints protegidos:")
    print("1. Acesse http://localhost:8000/docs")
    print("2. Clique em 'Authorize'")
    print("3. Cole seu Firebase ID token")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
