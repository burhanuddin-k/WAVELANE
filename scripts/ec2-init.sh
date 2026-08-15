#!/bin/bash

# EC2 Initialization Script
# Run this on a fresh EC2 instance to set up Docker and dependencies
# Usage: curl -sSL https://raw.githubusercontent.com/yourusername/wavelane/main/scripts/ec2-init.sh | bash

set -e

ENV=${1:-dev}

echo "=================================================="
echo "Initializing EC2 for Wavelane - $ENV environment"
echo "=================================================="

# Update system
echo "[1/8] Updating system packages..."
sudo yum update -y
sudo yum install -y git curl wget

# Install Docker
echo "[2/8] Installing Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
echo "[3/8] Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
echo "[4/8] Verifying Docker installation..."
docker --version
docker-compose --version

# Create application directory structure
echo "[5/8] Creating application directories..."
sudo mkdir -p /opt/wavelane/{dev,staging,prod}
sudo chown -R ec2-user:ec2-user /opt/wavelane

# Create docker-compose.yml in each environment
echo "[6/8] Creating docker-compose files..."
for env in dev staging prod; do
    cat > /opt/wavelane/${env}/docker-compose.yml << 'EOF'
version: '3.8'

services:
  backend:
    container_name: wavelane-backend-${env}
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=file:./dev.db
      - JWT_SECRET=change-this-in-production
      - PORT=4000
      - ADMIN_EMAIL=admin@wavelane.app
      - ADMIN_PASSWORD=admin1234
    volumes:
      - ./uploads:/app/uploads
      - ./data:/app/data
    networks:
      - wavelane-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:4000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    container_name: wavelane-frontend-${env}
    ports:
      - "3000:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - wavelane-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3

  admin:
    container_name: wavelane-admin-${env}
    ports:
      - "3001:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - wavelane-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  wavelane-network:
    driver: bridge
EOF
done

# Set up log rotation
echo "[7/8] Setting up log rotation..."
sudo tee /etc/logrotate.d/wavelane > /dev/null << EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    missingok
    delaycompress
    copytruncate
}
EOF

# Final verification
echo "[8/8] Final verification..."
docker ps
docker-compose --version

echo "=================================================="
echo "✓ EC2 initialization complete!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Configure environment variables in /opt/wavelane/{env}/env-*.sh"
echo "2. Pull Docker images: docker pull yourusername/wavelane-backend:latest"
echo "3. Start services: cd /opt/wavelane/${ENV} && docker-compose up -d"
echo ""
echo "Directories created:"
echo "  /opt/wavelane/dev"
echo "  /opt/wavelane/staging"
echo "  /opt/wavelane/prod"
