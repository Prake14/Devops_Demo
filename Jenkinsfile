pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', 
                url: 'https://github.com/Prake14/Devops_Demo'
            }
        }
        
        stage('Build and Run') {
            steps {
                script {
                    // Stop and remove any existing container
                    sh 'docker stop my-static-website || true'
                    sh 'docker rm my-static-website || true'
                    
                    // Build new image (corrected syntax)
                    sh 'docker build -t my-static-website .'
                    
                    // Run new container with proper port mapping
                    sh 'docker run -d --name my-static-website -p 8081:80 my-static-website'
                }
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up intermediate containers...'
            sh 'docker system prune -f' // Optional: clean up unused containers/images
        }
    }
}
