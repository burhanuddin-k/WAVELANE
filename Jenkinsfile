pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 1, unit: 'HOURS')
        timestamps()
    }

    parameters {
        choice(
            name: 'DEPLOY_ENV',
            choices: ['dev', 'staging', 'prod'],
            description: 'Environment to deploy to'
        )
    }

    environment {
        DOCKERHUB_REGISTRY = 'docker.io'
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        GITHUB_CREDENTIALS = credentials('github-credentials')
        AWS_CREDENTIALS = credentials('aws-credentials')
        AWS_REGION = 'us-east-1'
        IMAGE_TAG = "${BUILD_NUMBER}-${GIT_COMMIT.take(7)}"
        DOCKER_REGISTRY_URL = "${DOCKERHUB_CREDENTIALS_USR}"
        COMPOSE_PROJECT_NAME = "wavelane-${DEPLOY_ENV}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    echo "Branch: ${GIT_BRANCH}"
                    echo "Commit: ${GIT_COMMIT}"
                    echo "Build Number: ${BUILD_NUMBER}"
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        script {
                            dir('backend') {
                                sh """
                                    docker build \
                                        -t ${DOCKER_REGISTRY_URL}/wavelane-backend:${IMAGE_TAG} \
                                        -t ${DOCKER_REGISTRY_URL}/wavelane-backend:latest \
                                        .
                                """
                            }
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        script {
                            dir('frontend') {
                                sh """
                                    docker build \
                                        -t ${DOCKER_REGISTRY_URL}/wavelane-frontend:${IMAGE_TAG} \
                                        -t ${DOCKER_REGISTRY_URL}/wavelane-frontend:latest \
                                        .
                                """
                            }
                        }
                    }
                }
                stage('Build Admin') {
                    steps {
                        script {
                            dir('admin') {
                                sh """
                                    docker build \
                                        -t ${DOCKER_REGISTRY_URL}/wavelane-admin:${IMAGE_TAG} \
                                        -t ${DOCKER_REGISTRY_URL}/wavelane-admin:latest \
                                        .
                                """
                            }
                        }
                    }
                }
            }
        }

        stage('Test Images') {
            steps {
                script {
                    sh """
                        docker run --rm \
                            ${DOCKER_REGISTRY_URL}/wavelane-backend:${IMAGE_TAG} \
                            node -v
                    """
                }
            }
        }

        stage('Push to DockerHub') {
            when {
                expression {
                    return env.GIT_BRANCH == 'origin/main' || env.GIT_BRANCH == 'origin/develop'
                }
            }
            steps {
                script {
                    sh """
                        echo "${DOCKERHUB_CREDENTIALS_PSW}" | docker login -u "${DOCKERHUB_CREDENTIALS_USR}" --password-stdin
                    """
                    sh """
                        docker push ${DOCKER_REGISTRY_URL}/wavelane-backend:${IMAGE_TAG}
                        docker push ${DOCKER_REGISTRY_URL}/wavelane-backend:latest
                        docker push ${DOCKER_REGISTRY_URL}/wavelane-frontend:${IMAGE_TAG}
                        docker push ${DOCKER_REGISTRY_URL}/wavelane-frontend:latest
                        docker push ${DOCKER_REGISTRY_URL}/wavelane-admin:${IMAGE_TAG}
                        docker push ${DOCKER_REGISTRY_URL}/wavelane-admin:latest
                    """
                    sh """
                        docker logout
                    """
                }
            }
        }

        stage('Deploy to Dev') {
            when {
                expression { return params.DEPLOY_ENV == 'dev' }
            }
            steps {
                script {
                    sh """
                        echo "Deploying to DEV environment..."
                        ./scripts/deploy.sh dev ${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Test in Dev') {
            when {
                expression { return params.DEPLOY_ENV == 'dev' }
            }
            steps {
                script {
                    sh """
                        echo "Running smoke tests on DEV..."
                        sleep 10
                        curl -f http://dev-backend.wavelane.local:4000/api/health || exit 1
                    """
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                expression { return params.DEPLOY_ENV == 'staging' }
            }
            steps {
                script {
                    sh """
                        echo "Deploying to STAGING environment..."
                        ./scripts/deploy.sh staging ${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Test in Staging') {
            when {
                expression { return params.DEPLOY_ENV == 'staging' }
            }
            steps {
                script {
                    sh """
                        echo "Running smoke tests on STAGING..."
                        sleep 10
                        curl -f http://staging-backend.wavelane.local:4000/api/health || exit 1
                    """
                }
            }
        }

        stage('Approval for Prod') {
            when {
                expression { return params.DEPLOY_ENV == 'prod' }
            }
            steps {
                script {
                    def userInput = input(
                        id: 'ProdDeployment',
                        message: 'Deploy to PRODUCTION?',
                        ok: 'Deploy',
                        submitter: 'admin'
                    )
                }
            }
        }

        stage('Deploy to Prod') {
            when {
                expression { return params.DEPLOY_ENV == 'prod' }
            }
            steps {
                script {
                    sh """
                        echo "Deploying to PRODUCTION environment..."
                        ./scripts/deploy.sh prod ${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Test in Prod') {
            when {
                expression { return params.DEPLOY_ENV == 'prod' }
            }
            steps {
                script {
                    sh """
                        echo "Running smoke tests on PROD..."
                        sleep 10
                        curl -f http://prod-backend.wavelane.local:4000/api/health || exit 1
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWps()
            sh 'docker logout || true'
        }
        success {
            echo "Pipeline completed successfully!"
        }
        failure {
            echo "Pipeline failed! Check logs above."
        }
    }
}
