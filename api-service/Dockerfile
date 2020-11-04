FROM node:14 as Build

COPY ./ /build

WORKDIR /build/api-service

RUN npm install && pwd && ls -a
RUN npm run build


FROM node:14
COPY --from=Build /build/dist /app

WORKDIR /app/api-service

EXPOSE 8000
CMD [ "node", "app.js" ]