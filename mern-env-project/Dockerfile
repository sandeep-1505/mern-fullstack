# Production Dockerfile for MERN Environment Variables Project
# 1. Base image: Official lightweight Node.js Alpine image
FROM node:20-alpine

# 2. Set environment to production
ENV NODE_ENV=production

# 3. Create and set working directory
WORKDIR /app

# 4. Copy dependency declarations first to leverage Docker layer caching
COPY package*.json ./

# 5. Install production dependencies cleanly
RUN npm ci --omit=dev

# 6. Copy application source files
COPY . .

# 7. Ensure non-root 'node' user owns the application directory for security
RUN chown -R node:node /app

# 8. Switch to non-root user
USER node

# 9. Expose application port
EXPOSE 5000

# 10. Start the application
CMD ["node", "server.js"]
