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
                        echo "$DOCKER_PASS" | docker login \
                        -u "$DOCKER_USER" \
                        --password-stdin
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                sh '''
                    docker push ${IMAGE}:${BUILD_NUMBER}
                    docker push ${IMAGE}:latest
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker compose down || true
                    docker compose up -d --build
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    sleep 10
                    docker ps
                    curl -f http://localhost:4000/api/health
                '''
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }

        success {
            echo 'WaveLane deployed successfully!'
        }

        failure {
            echo 'WaveLane deployment failed.'
        }
    }
}