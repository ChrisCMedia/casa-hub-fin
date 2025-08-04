#!/bin/bash

echo "🚀 Casa Hub Quick Start Script"
echo "=============================="

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Bitte im casa-hub-fin Hauptverzeichnis ausführen!"
    exit 1
fi

echo "📦 Installing Backend Dependencies..."
cd backend
npm install

echo "📦 Installing Frontend Dependencies..."
cd ../frontend
npm install
cd ..

echo "🐳 Starting Services with Docker..."

# Create docker-compose for local development
cat > docker-compose.yml << EOF
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: casa_hub
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
EOF

# Start Docker services
docker-compose up -d

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "🗄️ Setting up Database..."
cd backend
npm run db:push
npm run db:seed

echo "🎉 Setup Complete!"
echo ""
echo "🚀 Starte jetzt die Anwendung:"
echo "Terminal 1: cd backend && npm run dev"
echo "Terminal 2: cd frontend && npm run dev"
echo ""
echo "🌐 Dann öffne: http://localhost:5173"
echo "👤 Login: sarah@immobilien-weber.de / sarah123!"
echo ""
echo "🛑 Zum Stoppen: docker-compose down"