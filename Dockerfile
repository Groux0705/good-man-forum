FROM node:18-alpine AS base

# Server build stage
FROM base AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production

COPY server/ ./
RUN npm run build

# Client build stage
FROM base AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

# Copy server
COPY --from=server-build /app/server/dist ./server/dist
COPY --from=server-build /app/server/node_modules ./server/node_modules
COPY --from=server-build /app/server/package.json ./server/
COPY --from=server-build /app/server/prisma ./server/prisma

# Copy client build
COPY --from=client-build /app/client/dist ./client/dist

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

WORKDIR /app/server
CMD ["npm", "start"]