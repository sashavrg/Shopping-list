# first stage: build frontend static

FROM node:18-alpine as frontend-build

WORKDIR /app/Frontend

COPY Frontend/package*.json ./
RUN npm install

COPY Frontend/ ./
RUN npm run build

# second stage: prepare backend with static frontend files

FROM node:18-alpine as backend-build

WORKDIR /app/Backend

COPY Backend/package*.json ./
RUN npm install

COPY Backend/ ./

# copy frontend build files to backend dist folder

COPY --from=frontend-build /app/Frontend/dist ./dist

# third stage: run backend server

FROM node:18-alpine

WORKDIR /app/Backend

# copy backend files and installed modules

COPY --from=backend-build /app/Backend ./

EXPOSE 3036

CMD ["node", "index.js"]