FROM node:8

# 앱 디렉터리 생성
WORKDIR /usr/src/app

# 앱 의존성 설치
COPY package*.json ./
RUN npm install

# 앱 소스 추가
COPY Apps ./Apps
COPY Build ./Build
COPY Source ./Source
COPY Specs ./Specs
COPY ThirdParty ./ThirdParty
COPY favicon.ico ./
COPY gulpfile.js ./
COPY index.html ./
COPY server.js ./

EXPOSE 8090 
CMD [ "node", "server.js" ]
