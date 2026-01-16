#!/usr/bin/env python3
"""
n.process Ingestion Tool
Ingest documents into the Knowledge Store via API.

Usage:
    uv run python scripts/ingest_kb.py --token <FIREBASE_ID_TOKEN> --file <PATH_TO_FILE>

Example:
    uv run python scripts/ingest_kb.py --token "eyJ..." --file "docs/my_policy.txt"
"""

import argparse
import sys
import os
import httpx
from pathlib import Path

# Use the production URL by default if deployed, else local
API_URL = "https://nprocess-api-1040576944774.us-central1.run.app/v1"
# API_URL = "http://localhost:8000/v1"  # Uncomment for local dev

def ingest_file(token, file_path, strategy="default"):
    path = Path(file_path)
    if not path.exists():
        print(f"❌ File not found: {file_path}")
        return

    content = path.read_text(encoding="utf-8")
    
    # Determine metadata
    filename = path.name
    
    payload = {
        "content": content,
        "doc_type": "private",  # Ingest as private doc for the user's org
        "strategy": strategy,
        "metadata": {
            "title": filename,
            "source": "ingest_kb cli"
        }
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print(f"🔄 Ingesting '{filename}' into Private Knowledge Base...")
    
    try:
        response = httpx.post(
            f"{API_URL}/knowledge/ingest",
            json=payload,
            headers=headers,
            timeout=60.0
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Success!")
            print(f"Document ID: {data['doc_id']}")
            print(f"Chunks created: {data['chunks_count']}")
        else:
            print(f"\n❌ Error {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"\n❌ Request failed: {e}")

def main():
    parser = argparse.ArgumentParser(description="n.process Ingestion CLI")
    parser.add_argument("--token", required=True, help="Firebase ID Token (get from /debug/token)")
    parser.add_argument("--file", required=True, help="Path to text document")
    parser.add_argument("--strategy", default="default", choices=["default", "legal"], help="Chunking strategy")
    
    args = parser.parse_args()
    
    ingest_file(args.token, args.file, args.strategy)

if __name__ == "__main__":
    main()
