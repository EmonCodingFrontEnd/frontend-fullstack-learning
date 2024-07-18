FROM nginx:1.25.4
MAINTAINER 问秋 liming2011071@163.com
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
EXPOSE 80

ADD k8s/dockerfiles/html.tar.gz /usr/share/nginx/html
CMD ["nginx","-g","daemon off;"]