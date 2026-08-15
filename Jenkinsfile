pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    environment {
        DOCKERHUB_USER = credentials('dockerhub-credentials')
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out Wavelane source code...'
                checkout scm
            }
        }

        stage('Verify Project') {
            steps {
                sh '''
                    echo "Checking project structure..."

                    test -f backend/Dockerfile
                    test -f frontend/Dockerfile
                    test -f admin/Dockerfile
                    test -f docker-compose.yml

                    echo "Project structure verified."
                '''
            }
        }

        stage('Build Docker Images') {
            parallel {

                stage('Build Backend') {
                    steps {
                        sh '''
                            docker build \
                              -t ${DOCKERHUB_USER_USR}/wavelane-backend:${IMAGE_TAG} \
                              -t ${DOCKERHUB_USER_USR}/wavelane-backend:latest \
                              ./backend
                        '''
                    }
                }

                stage('Build Frontend') {
                    steps {
                        sh '''
                            docker build \
                              -t ${DOCKERHUB_USER_USR}/wavelane-frontend:${IMAGE_TAG} \
                              -t ${DOCKERHUB_USER_USR}/wavelane-frontend:latest \
                              ./frontend
                        '''
                    }
                }

                stage('Build Admin') {
                    steps {
                        sh '''
                            docker build \
                              -t ${DOCKERHUB_USER_USR}/wavelane-admin:${IMAGE_TAG} \
                              -t ${DOCKERHUB_USER_USR}/wavelane-admin:latest \
                              ./admin
                        '''
                    }
                }
            }
        }

        stage('Test Docker Images') {
            steps {
                sh '''
                    echo "Testing backend image..."
                    docker run --rm \
                      ${DOCKERHUB_USER_USR}/wavelane-backend:${IMAGE_TAG} \
                      node -v

                    echo "Docker image test completed."
                '''
            }
        }

        stage('Login to Docker Hub') {
            steps {
                sh '''
                    echo "${DOCKERHUB_USER_PSW}" | docker login \
                      -u "${DOCKERHUB_USER_USR}" \
                      --password-stdin
                '''
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                sh '''
                    docker push ${DOCKERHUB_USER_USR}/wavelane-backend:${IMAGE_TAG}
                    docker push ${DOCKERHUB_USER_USR}/wavelane-backend:latest

                    docker push ${DOCKERHUB_USER_USR}/wavelane-frontend:${IMAGE_TAG}
                    docker push ${DOCKERHUB_USER_USR}/wavelane-frontend:latest

                    docker push ${DOCKERHUB_USER_USR}/wavelane-admin:${IMAGE_TAG}
                    docker push ${DOCKERHUB_USER_USR}/wavelane-admin:latest
                '''
            }
        }

        stage('Deploy Wavelane') {
            steps {
                sh '''
                    echo "Deploying Wavelane..."

                    docker compose down --remove-orphans || true

                    docker compose up -d --build

                    echo "Waiting for containers..."
                    sleep 10

                    docker compose ps
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    echo "Checking running containers..."

                    docker ps

                    echo "Checking backend..."
                    curl -f http://localhost:4000/api/health

                    echo "Backend is healthy."
                '''
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }

        success {
            echo '=========================================='
            echo ' WAVELANE DEPLOYMENT SUCCESSFUL!'
            echo '=========================================='
        }

        failure {
            echo '=========================================='
            echo ' WAVELANE DEPLOYMENT FAILED!'
            echo ' Check the Jenkins console output.'
            echo '=========================================='
        }
    }
}