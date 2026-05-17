pipeline {
    agent any

    tools {
        nodejs 'NodeJS' // Replace with your configured NodeJS installation in Jenkins
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                // Use 'bat' if Jenkins is running natively on Windows, 'sh' for Linux
                bat 'npm install --legacy-peer-deps'
            }
        }

        stage('Build Frontend') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Build completed. The dist/ directory is ready for deployment.'
                // Example: Deploy to an Nginx folder or AWS S3
                // bat 'xcopy /E /I dist\\* C:\\nginx\\html\\'
            }
        }
    }
}
