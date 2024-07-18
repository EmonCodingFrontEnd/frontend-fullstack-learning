pipeline {
  agent {
    node {
      label 'maven'
    }
  }

  parameters {
    choice(name: 'MODULE_NAME', choices: ['fullstack-admin-web'], description: '对于多模块项目，选择一个待构建的模块')
    choice(name: 'BUILD_ENV', choices: ['prod','qa','uat'], description: '执行编译命令 npm run build $BUILD_ENV')
    string(name: 'TAG_NAME', defaultValue: '', description: 'SCM标签，指定后则为SCM和镜像打标签，比如：v1.0.0，默认不打标签')
    choice(name: 'DEPLOY_TO', choices: ['','fsmall-test','fsmall-prod'], description: '请选择部署环境，默认不部署')
  }

  environment {
    DOCKER_CREDENTIAL_ID = 'harbor-id'
    GITHUB_CREDENTIAL_ID = 'gitee-id'
    KUBECONFIG_CREDENTIAL_ID = 'fsmall-kubeconfig'
    REGISTRY = '192.168.32.116:30002'
    DOCKERHUB_NAMESPACE = 'ks-devops-harbor'
    GITHUB_ACCOUNT_OR_ORG = 'EmonCodingFrontEnd'
    IMAGE = "$REGISTRY/$DOCKERHUB_NAMESPACE/$MODULE_NAME:${(new Date()).format('yyyyMMddHHmm')}"
  }

  stages {
    stage('拉取代码') {
      steps {
        sh 'printenv'
        sh 'echo 检出代码并构建模块 $MODULE_NAME'
        git(url: 'https://gitee.com/EmonCodingFrontEnd/frontend-fullstack-learning.git', credentialsId: 'gitee-id', branch: 'master', changelog: true, poll: false)
      }
    }

    stage('安装、编译与打包') {
      agent {
        kubernetes {
          inheritFrom 'nodejs base'
          containerTemplate {
            name 'nodejs'
            image 'node:16.20.2'
          }
        }
      }
      steps {
        sh 'echo 安装、编译与打包'
        container('nodejs') {
          sh 'npm config set registry https://registry.npmmirror.com'
          sh 'npm install --ignore-scripts --legacy-peer-deps'
          sh 'npm rebuild node-sass'
          sh 'npm run build $BUILD_ENV'
          sh 'tar -zcvf k8s/dockerfiles/html.tar.gz -C dist .'
          stash(name:'html',includes: 'k8s/dockerfiles/html.tar.gz')
        }
      }
    }

    stage('构建并推送快照镜像') {
      steps {
        sh 'echo 构建并推送快照镜像到镜像仓库 $IMAGE'
        container ('maven') {
          unstash("html")
          sh 'docker build -f k8s/Dockerfile -t $IMAGE .'
          withCredentials([usernamePassword(passwordVariable : 'DOCKER_PASSWORD' ,usernameVariable : 'DOCKER_USERNAME' ,credentialsId : "$DOCKER_CREDENTIAL_ID")]) {
            sh 'echo "$DOCKER_PASSWORD" | docker login $REGISTRY -u "$DOCKER_USERNAME" --password-stdin'
            sh 'docker push $IMAGE'
          }
        }
      }
    }

    stage('推送最新镜像'){
      environment {
        LASTED_IMAGE = "$REGISTRY/$DOCKERHUB_NAMESPACE/$MODULE_NAME:latest"
      }
      steps{
        sh 'echo 构建并推送最新镜像到镜像仓库 $LASTED_IMAGE'
        container ('maven') {
          sh 'docker tag $IMAGE $LASTED_IMAGE'
          sh 'docker push $LASTED_IMAGE'
        }
       }
    }
  
    stage('部署到测试环境') {
      when {
        expression {
          return params.DEPLOY_TO && !params.TAG_NAME
        }
      }
      environment {
        IMAGE = "$REGISTRY/$DOCKERHUB_NAMESPACE/$MODULE_NAME:latest"
        NAMESPACE = "$DEPLOY_TO"
      }
      steps {
        input(id: 'deploy-to-k8s-test', message: String.format('是否部署模块 %s 的 %s 镜像到 %s 环境？', params.MODULE_NAME, env.IMAGE, params.DEPLOY_TO), ok: '确定')
        container ('maven') {
          withCredentials([
              kubeconfigFile(
              credentialsId: env.KUBECONFIG_CREDENTIAL_ID,
              variable: 'KUBECONFIG')
              ]) {
              sh 'envsubst < k8s/k8s-deploy.yaml | kubectl apply -f -'
              }
        }
      }
    }
        
    stage('推送指定标签镜像') {
      when {
        branch 'master'
        expression {
          return params.TAG_NAME =~ /v.*/
        }
      }
      environment {
        TAG_IMAGE = "$REGISTRY/$DOCKERHUB_NAMESPACE/$MODULE_NAME:$TAG_NAME"
      }
      steps {
        sh 'echo 构建并推送指定标签镜像到镜像仓库 $TAG_IMAGE'
        container('maven') {
          input(id: '发布指定标签的镜像', message: String.format('为镜像打指定标签 %s ？', params.TAG_NAME), ok: '确定')
          withCredentials([usernamePassword(passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME', credentialsId: "$GITHUB_CREDENTIAL_ID")]) {
            sh 'git config --global user.email "kubesphere@yunify.com" '
            sh 'git config --global user.name "kubesphere" '
            sh 'git tag -a $TAG_NAME -m "$TAG_NAME" '
            sh 'git push http://$GIT_USERNAME:$GIT_PASSWORD@gitee.com/$GITHUB_ACCOUNT_OR_ORG/backend-fullstack-learning.git --tags --ipv4'
          }
  
          sh 'docker tag $IMAGE $TAG_IMAGE '
          sh 'docker push $TAG_IMAGE '
        }
      }
    }
    
    stage('部署到生产环境') {
      when {
        branch 'master'
        expression {
          return params.DEPLOY_TO && params.TAG_NAME =~ /v.*/
        }
      }
      environment {
        IMAGE = "$REGISTRY/$DOCKERHUB_NAMESPACE/$MODULE_NAME:$TAG_NAME"
        NAMESPACE = "$DEPLOY_TO"
      }
      steps {
        sh 'printenv'
        input(id: 'deploy-to-k8s-prod', message: String.format('是否部署模块 %s 的 %s 镜像到 %s 环境？', params.MODULE_NAME, env.IMAGE, params.DEPLOY_TO), ok: '确定')
        container ('maven') {
          withCredentials([
              kubeconfigFile(
              credentialsId: env.KUBECONFIG_CREDENTIAL_ID,
              variable: 'KUBECONFIG')
              ]) {
              sh 'envsubst < k8s/k8s-deploy.yaml | kubectl apply -f -'
              }
        }
      }
    }
  }
}