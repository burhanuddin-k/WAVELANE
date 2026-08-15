#!/bin/bash

set -e

ENV=$1
IMAGE_TAG=$2

if [ -z "$ENV" ] || [ -z "$IMAGE_TAG" ]; then
    echo "Usage: deploy.sh <env> <image_tag>"
    echo "Example: deploy.sh dev 42-abc1234"
    exit 1
fi

# Load environment-specific configuration
source "$(dirname "$0")/env-${ENV}.sh"

echo "=================================================="
echo "Deploying Wavelane to $ENV environment"
echo "Image Tag: $IMAGE_TAG"
echo "Target EC2: $EC2_HOST"
echo "=================================================="

# SSH into the EC2 instance and deploy
ssh -i "$SSH_KEY" "ec2-user@${EC2_HOST}" << 'REMOTE_SCRIPT'
    #!/bin/bash
    set -e
    
    ENV=$(echo "$1" | tr '[:upper:]' '[:lower:]')
    IMAGE_TAG=$2
    DOCKER_USER=$3
    
    COMPOSE_DIR="/opt/wavelane/${ENV}"
    
    echo "[INFO] Creating/updating docker-compose.yml in ${COMPOSE_DIR}..."
    mkdir -p "${COMPOSE_DIR}"
    
    # Pull latest images from DockerHub
    echo "[INFO] Pulling latest images from DockerHub..."
    docker pull ${DOCKER_USER}/wavelane-backend:${IMAGE_TAG}
    docker pull ${DOCKER_USER}/wavelane-frontend:${IMAGE_TAG}
    docker pull ${DOCKER_USER}/wavelane-admin:${IMAGE_TAG}
    
    # Create docker-compose override file with image tags
    cat > "${COMPOSE_DIR}/docker-compose.override.yml" << 'COMPOSE'
version: '3.8'

services:
  backend:
    image: ${DOCKER_USER}/wavelane-backend:${IMAGE_TAG}
    restart: always
  
  frontend:
    image: ${DOCKER_USER}/wavelane-frontend:${IMAGE_TAG}
    restart: always
  
  admin:
    image: ${DOCKER_USER}/wavelane-admin:${IMAGE_TAG}
    restart: always
COMPOSE
    
    # Stop and remove old containers
    echo "[INFO] Stopping old containers..."
    cd "${COMPOSE_DIR}"
    docker-compose down || true
    
    # Start new containers
    echo "[INFO] Starting new containers..."
    docker-compose \
        -f docker-compose.yml \
        -f docker-compose.override.yml \
        -p "wavelane-${ENV}" \
        up -d
    
    # Wait for containers to be healthy
    echo "[INFO] Waiting for containers to become healthy..."
    for i in {1..30}; do
        if docker-compose \
            -f docker-compose.yml \
            -f docker-compose.override.yml \
            -p "wavelane-${ENV}" \
            ps | grep -q "healthy"; then
            echo "[SUCCESS] All containers are healthy!"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "[ERROR] Containers did not become healthy in time"
            docker-compose -p "wavelane-${ENV}" logs
            exit 1
        fi
        sleep 2
    done
    
    # Print service endpoints
    echo "[SUCCESS] Deployment completed!"
    echo "Frontend: http://${ENV}-frontend.wavelane.local"
    echo "Admin: http://${ENV}-admin.wavelane.local"
    echo "Backend: http://${ENV}-backend.wavelane.local:4000"
    
REMOTE_SCRIPT $ENV $IMAGE_TAG $DOCKER_REGISTRY_URL

echo "[SUCCESS] Deployment to $ENV complete!"
