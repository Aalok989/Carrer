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
                // 'file' binds the content of your secret file to the variable 'ENV_FILE_PATH'
                withCredentials([file(credentialsId: '85057d61-e5aa-4475-a19d-a9dd11048106', variable: 'ENV_FILE_PATH')]) {
                    script {
                        // 1. Copy the secret file to ".env" so Vite can find it
                        sh 'cp $ENV_FILE_PATH .env'
                        
                        // 2. Run the build (Vite automatically reads .env)
                        sh 'npm run build'
                        
                        // 3. (Security) Delete the file immediately after building
                        sh 'rm .env'
                    }
                }
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