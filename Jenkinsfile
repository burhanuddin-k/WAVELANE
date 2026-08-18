pipeline {
    agent any

    environment {
        IMAGE = 'burhanuddin2005/wavelane'
        DOCKER_CREDENTIALS = 'dockerhub-credentials'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out WaveLane from GitHub...'
                checkout scm
            }
        }

        stage('Verify Project') {
            steps {
                sh '''
                    set -e

                    test -f package.json
                    test -f server.js
                    test -f Dockerfile
                    test -f docker-compose.yml
                    test -f public/index.html
                    test -f admin/index.html

                    echo "Project files verified."
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    set -e

                    docker build \
                        -t ${IMAGE}:${BUILD_NUMBER} \
                        -t ${IMAGE}:latest .
                '''
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKER_CREDENTIALS}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        set -e

                        echo "$DOCKER_PASS" | docker login \
                            --username "$DOCKER_USER" \
                            --password-stdin
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                sh '''
                    set -e

                    docker push ${IMAGE}:${BUILD_NUMBER}
                    docker push ${IMAGE}:latest
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    set -e

                    echo "Stopping old WaveLane containers..."

                    docker compose down --remove-orphans || true

                    docker rm -f wavelane 2>/dev/null || true
                    docker rm -f wavelane-backend 2>/dev/null || true
                    docker rm -f wavelane-frontend 2>/dev/null || true
                    docker rm -f wavelane-admin 2>/dev/null || true

                    echo "Starting WaveLane..."

                    docker compose up -d --build
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    set -e

                    echo "Waiting for WaveLane..."
                    sleep 10

                    docker ps

                    echo "Checking health endpoint..."

                    curl -f http://localhost:4000/api/health

                    echo ""
                    echo "WaveLane deployment verified."
                '''
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }

        success {
            echo '======================================'
            echo '   WAVELANE DEPLOYMENT SUCCESSFUL'
            echo '======================================'
        }

        failure {
            echo '======================================'
            echo '   WAVELANE DEPLOYMENT FAILED'
            echo '======================================'
        }
    }
}