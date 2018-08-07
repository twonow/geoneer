FROM node:8

# 앱 디렉터리 생성
WORKDIR /usr/src/app

# 앱 의존성 설치
COPY package*.json ./
RUN npm install

# 앱 소스 추가
COPY index.html ./
COPY index2.js ./

EXPOSE 1234
CMD [ "npm", "start" ]