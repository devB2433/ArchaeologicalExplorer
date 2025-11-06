# Multi-stage build for Archaeological Explorer
# Stage 1: Build frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy backend code
COPY --chown=nodejs:nodejs server ./server

# Copy built frontend from builder stage
COPY --chown=nodejs:nodejs --from=builder /app/dist ./dist

# Copy public assets
COPY --chown=nodejs:nodejs public ./public

# Create data directory with proper permissions
RUN mkdir -p /app/data && \
    chown -R nodejs:nodejs /app/data

# Switch to non-root user
USER nodejs

# Expose port (will be bound to 127.0.0.1 externally)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => { process.exit(1); });"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server/index.js"]
