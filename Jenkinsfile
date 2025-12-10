pipeline {
    agent any

    tools {
        nodejs 'node'
    }

    environment {
        SERVER_IP = '173.249.31.55'
        DEPLOY_USER = 'ubuntu' 
        TARGET_DIR = '/var/www/careers.etribes.bbills.win'
    }

    stages {
        stage('Clean Workspace') {
            steps {
                // Wipes the Jenkins folder clean before starting to ensure no cache issues
                cleanWs() 
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                sshagent(['deploy-ssh-key']) {
                    // Added '--delete' flag here. 
                    // This makes the server folder an EXACT mirror of the build folder.
                    // WARNING: Be careful that TARGET_DIR is correct, or it will wipe the wrong folder!
                    sh "rsync -avz --delete -e 'ssh -o StrictHostKeyChecking=no' dist/ ${DEPLOY_USER}@${SERVER_IP}:${TARGET_DIR}"
                }
            }
        }
    }
}