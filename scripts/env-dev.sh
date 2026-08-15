#!/bin/bash

# DEV Environment Configuration
export ENV=dev
export EC2_HOST="dev-wavelane.compute.amazonaws.com"  # Change to your DEV EC2 instance
export SSH_KEY="$HOME/.ssh/wavelane-dev-key.pem"       # Change to your SSH key path
export DOCKER_REGISTRY_URL="yourusername"              # Change to your DockerHub username
export AWS_REGION="us-east-1"

# Database configuration for DEV
export DB_URL="file:./dev.db"
export JWT_SECRET="dev-secret-key-change-in-prod"

# Instance type details (for reference)
# Instance Type: t3.small
# vCPU: 2
# Memory: 2GB RAM
# Public IP: Elastic IP attached
