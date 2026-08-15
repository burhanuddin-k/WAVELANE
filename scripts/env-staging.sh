#!/bin/bash

# STAGING Environment Configuration
export ENV=staging
export EC2_HOST="staging-wavelane.compute.amazonaws.com"  # Change to your STAGING EC2 instance
export SSH_KEY="$HOME/.ssh/wavelane-staging-key.pem"      # Change to your SSH key path
export DOCKER_REGISTRY_URL="yourusername"                 # Change to your DockerHub username
export AWS_REGION="us-east-1"

# Database configuration for STAGING
export DB_URL="file:./staging.db"
export JWT_SECRET="staging-secret-key-change-in-prod"

# Instance type details (for reference)
# Instance Type: t3.medium
# vCPU: 2
# Memory: 4GB RAM
# Public IP: Elastic IP attached
