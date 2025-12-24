# Admin Dashboard - Dockerfile optimized for Google Cloud Run

# Build stage
FROM node:20-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Runtime stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S appgroup 2>/dev/null || addgroup -S appgroup && \
    adduser -u 1001 -S -G appgroup appuser 2>/dev/null || adduser -S -G appgroup appuser && \
    chown -R appuser:appgroup /app || true

# Copy package files
COPY --chown=appuser:appgroup package*.json ./

# Install production dependencies only
RUN npm install --only=production && \
    npm cache clean --force

# Copy standalone server
COPY --chown=appuser:appgroup --from=builder /app/.next/standalone ./
# Copy static files
COPY --chown=appuser:appgroup --from=builder /app/.next/static ./.next/static
# Copy public files if they exist
RUN mkdir -p ./public
COPY --chown=appuser:appgroup --from=builder /app/public ./public 2>/dev/null || true

# Set environment variables
ENV NODE_ENV=production \
    PORT=8080 \
    HOSTNAME="0.0.0.0"

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the application using standalone output
CMD ["node", "server.js"]
