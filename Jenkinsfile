pipeline {
    agent any
    
    triggers {
        pollSCM('H/5 * * * *') // Check GitHub every 5 minutes
    }
    
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
                    
                    // Build new image
                    docker.build("my-static-website")
                    
                    // Run new container
                    docker.image("my-static-website").run(
                        "--name my-static-website -p 8080:80"
                    )
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
