pipeline {
    agent any

    tools {
        // Updated to 'Node' to match your snippet. 
        // Ensure "Node" is the exact name in Global Tool Configuration.
        nodejs 'Node' 
    }

    environment {
        // Uses the "Secret Text" credential for IP, matching your snippet
        SERVER_IP = credentials('SERVER_IP') 
        
        // The user from your snippet
        DEPLOY_USER = 'mukul'
        
        // The specific folder you set up in Apache
        TARGET_DIR = '/var/www/careers.etribes.bbills.win'
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build Frontend') {
            steps {
                // Vite builds to 'dist/' by default
                sh 'npm run build'
            }
        }

        stage('Deploy to Server') {
            steps {
                // Uses the ID from your snippet
                sshagent(credentials: ['vmi-ssh-key']) { 
                    script {
                        // 1. Ensure target directory exists on server
                        sh "ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${SERVER_IP} 'mkdir -p ${TARGET_DIR}'"
                        
                        // 2. Fix permissions (Ensure 'mukul' owns the folder so rsync can write)
                        // We also give group ownership to www-data (Apache)
                        sh "ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${SERVER_IP} 'chown -R ${DEPLOY_USER}:www-data ${TARGET_DIR}'"

                        // 3. Sync files
                        // --delete ensures the server folder is an exact mirror of the build
                        sh "rsync -avz --delete -e 'ssh -o StrictHostKeyChecking=no' dist/ ${DEPLOY_USER}@${SERVER_IP}:${TARGET_DIR}"
                        
                        // 4. (Optional) Set permissions for Apache to read files
                        sh "ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${SERVER_IP} 'chmod -R 755 ${TARGET_DIR}'"
                    }
                }
            }
        }
    }
}