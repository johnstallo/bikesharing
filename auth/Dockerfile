FROM node
WORKDIR /usr/src/auth/
ENV AZP_WORKSPACE_SYNC_TARGET /usr/src/auth
COPY package.json .
RUN npm install
# CMD npm restore
# COPY . .
EXPOSE 80
ENTRYPOINT ["npm", "start"]
HEALTHCHECK CMD curl --fail http://localhost:80/ || exit 1
COPY . .