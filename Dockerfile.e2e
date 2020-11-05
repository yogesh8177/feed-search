FROM node:14 as Build

COPY ./ /build

WORKDIR /build

RUN npm install
RUN npm run build


FROM node:14
COPY --from=Build /build/dist /app

WORKDIR /app

EXPOSE 8000
CMD [ "node", "app.js" ]