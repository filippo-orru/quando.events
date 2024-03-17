FROM node:20-slim AS base
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install && npm cache clean --force
COPY . ./
RUN npm run build

FROM base
COPY --from=base /app/.output/server/index.mjs /app/.output/server/index.mjs
EXPOSE 8000
CMD [ "node", ".output/server/index.mjs" ]
