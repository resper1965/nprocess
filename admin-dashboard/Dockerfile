# Admin Dashboard - Dockerfile optimized for Google Cloud Run

# Build stage
FROM node:20-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Runtime stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1000 appgroup && \
    adduser -D -u 1000 -G appgroup appuser && \
    chown -R appuser:appgroup /app

# Copy package files
COPY --chown=appuser:appgroup package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder
COPY --chown=appuser:appgroup --from=builder /app/.next ./.next
COPY --chown=appuser:appgroup --from=builder /app/public ./public
COPY --chown=appuser:appgroup --from=builder /app/next.config.js ./

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
    CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the application
CMD ["npm", "start"]
