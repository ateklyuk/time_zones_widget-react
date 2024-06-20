pipeline {
    agent any
    stages {
        stage ('Repo Checkout') {
            script {
            checkout scmGit(
                        branches: [[name: '*/B_ApiRepository_2_create']],
                        extensions: [],
                        userRemoteConfigs: [[credentialsId: 'gitHubKey', url: 'git@github.com:ateklyuk/time_zones_widget-react.git']])
            }
        }
        stage('Build') {
            steps {
                script {
                    sh 'echo "This is my first step"'
                    def cmd = 'git name-rev --name-only HEAD > branch'
                    isUnix()?sh(cmd):bat(cmd)
                    def branch = readFile('branch').trim()
                    echo("Branch is '${branch}'")
                }
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