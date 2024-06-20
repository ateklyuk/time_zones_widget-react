pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'echo "This is my first step"'
                def cmd = 'git name-rev --name-only HEAD > branch'
                isUnix()?sh(cmd):bat(cmd)
                def branch = readFile('branch').trim()
                echo("Branch is '${branch}'")
            }
        }
        stage('Test') {
            steps {
                echo 'Testing..'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
            }
        }
    }
}