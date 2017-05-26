FROM node
WORKDIR /usr/src/billing/
COPY package.json .
CMD npm restore
COPY . .
EXPOSE 80
ENTRYPOINT ["npm", "start"]
HEALTHCHECK CMD curl --fail http://localhost:80/ || exit 1
