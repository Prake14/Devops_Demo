pipeline {
    agent any
    
    stages {
        stage('Build & Deploy') {
            steps {
                script {
                    // Build from Dockerfile
                    sh 'docker build -t my-app .'
                    
                    // Cleanup old container
                    sh 'docker stop my-app || true'
                    sh 'docker rm my-app || true'
                    
                    // Run new container
                    sh 'docker run -d --name my-app -p 8081:80 my-app'
                }
            }
        }
    }
    
    post {
        always {
            echo 'Container status:'
            sh 'docker ps -a | grep my-app'
        }
    }
}
