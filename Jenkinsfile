pipeline {
    agent any
    stages {
        stage('Repo Checkout') {
            steps {
                script {
                    sh 'echo "This is my first step"'
                    def cmd = 'git name-rev --name-only HEAD > branch'
                    isUnix()?sh(cmd):bat(cmd)
                    def branch = readFile('branch').trim()
                    echo("Branch is '${branch}'")
                }
            }
            steps {
                script {
                    checkout scmGit(
                        branches: [[name: '*/'+'${branch}']],
                        extensions: [],
                        userRemoteConfigs: [[credentialsId: 'gitHubKey', url: 'git@github.com:ateklyuk/time_zones_widget-react.git']])
                }
            }
        }
        stage('Build') {

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