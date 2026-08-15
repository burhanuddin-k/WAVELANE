pipeline {

    agent any

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        DOCKER_USER = credentials('dockerhub-credentials')

        BACKEND_IMAGE = "burhanuddin2005/wavelane-backend"
        FRONTEND_IMAGE = "burhanuddin2005/wavelane-frontend"
        ADMIN_IMAGE = "burhanuddin2005/wavelane-admin"

        TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo '======================================'
                echo 'Checking out Wavelane from GitHub'
                echo '======================================'

                checkout scm
            }
        }

        stage('Verify Files') {
            steps {
                sh '''
                    echo "Checking project files..."

                    test -f backend/Dockerfile
                    test -f backend/package.json

                    test -f frontend/Dockerfile
                    test -f frontend/package.json

                    test -f admin/Dockerfile
                    test -f admin/package.json

                    test -f docker-compose.yml

                    echo "All required files found."
                '''
            }
        }

        stage('Build Backend') {
            steps {
                sh '''
                    echo "Building backend..."

                    docker build \
                        -t ${BACKEND_IMAGE}:${TAG} \
                        -t ${BACKEND_IMAGE}:latest \
                        ./backend
                '''
            }
        }

        stage('Build Frontend') {
            steps {
                sh '''
                    echo "Building frontend..."

                    docker build \
                        -t ${FRONTEND_IMAGE}:${TAG} \
                        -t ${FRONTEND_IMAGE}:latest \
                        ./frontend
                '''
            }
        }

        stage('Build Admin') {
            steps {
                sh '''
                    echo "Building admin..."

                    docker build \
                        -t ${ADMIN_IMAGE}:${TAG} \
                        -t ${ADMIN_IMAGE}:latest \
                        ./admin
                '''
            }
        }

        stage('Show Images') {
            steps {
                sh '''
                    echo "Docker images created:"

                    docker images | grep wavelane
                '''
            }
        }

        stage('Login Docker Hub') {
            steps {
                sh '''
                    echo "${DOCKER_USER_PSW}" | docker login \
                        --username "${DOCKER_USER_USR}" \
                        --password-stdin
                '''
            }
        }

        stage('Push Backend') {
            steps {
                sh '''
                    docker push ${BACKEND_IMAGE}:${TAG}
                    docker push ${BACKEND_IMAGE}:latest
                '''
            }
        }

        stage('Push Frontend') {
            steps {
                sh '''
                    docker push ${FRONTEND_IMAGE}:${TAG}
                    docker push ${FRONTEND_IMAGE}:latest
                '''
            }
        }

        stage('Push Admin') {
            steps {
                sh '''
                    docker push ${ADMIN_IMAGE}:${TAG}
                    docker push ${ADMIN_IMAGE}:latest
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    echo "Deploying Wavelane..."

                    docker compose down --remove-orphans || true

                    docker compose up -d

                    echo "Waiting for containers..."
                    sleep 10

                    docker compose ps
                '''
            }
        }
    }

    post {

        always {
            sh 'docker logout || true'
        }

        success {
            echo '''
========================================
       WAVELANE DEPLOYMENT SUCCESS
========================================
'''
        }

        failure {
            echo '''
========================================
       WAVELANE DEPLOYMENT FAILED
========================================
'''
        }
    }
}