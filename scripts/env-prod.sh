#!/bin/bash

# PRODUCTION Environment Configuration
export ENV=prod
export EC2_HOST="prod-wavelane.compute.amazonaws.com"  # Change to your PROD EC2 instance
export SSH_KEY="$HOME/.ssh/wavelane-prod-key.pem"      # Change to your SSH key path
export DOCKER_REGISTRY_URL="yourusername"              # Change to your DockerHub username
export AWS_REGION="us-east-1"

# Database configuration for PROD
export DB_URL="file:./prod.db"
export JWT_SECRET="prod-secret-key-generate-random-string"

# Instance type details (for reference)
# Instance Type: t3.large
# vCPU: 2
# Memory: 8GB RAM
# Public IP: Elastic IP attached
# Security Group: production-wavelane-sg (with restricted access)
