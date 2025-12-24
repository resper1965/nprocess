#!/bin/bash

# ComplianceEngine - Startup Script

echo "🚀 Starting ComplianceEngine Platform..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env with your credentials and run this script again"
    exit 1
fi

# Stop any running containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Start services
echo "🐳 Starting Docker containers..."
docker-compose up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
docker-compose ps

echo ""
echo "✅ ComplianceEngine is starting!"
echo ""
echo "📍 Access points:"
echo "   Client Portal: http://localhost:3001"
echo "   Admin API:     http://localhost:8008/docs"
echo "   RAG API:       http://localhost:8000/docs"
echo ""
echo "🔐 Demo Login:"
echo "   Email:    demo@complianceengine.com"
echo "   Password: demo123"
echo ""
echo "📊 View logs:"
echo "   docker-compose logs -f"
echo ""
