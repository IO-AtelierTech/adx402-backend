#-----------------------------------------------------------------------------
# Base Stage
# Sets up a common base with a non-root user and essential tools.
#-----------------------------------------------------------------------------
FROM node:23-alpine AS base

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Create a non-root user and group for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nodejs

#-----------------------------------------------------------------------------
# Builder Stage
# Installs all dependencies, builds the application, then prunes dev deps.
#-----------------------------------------------------------------------------
FROM base AS builder

# Enable Yarn v4+
RUN corepack enable

# Copy package manager files and install ALL dependencies (incl. dev)
# This is necessary for build tools like TypeScript (tsc) and tsoa.
COPY --chown=nodejs:nodejs package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

# Copy only the files needed for the build to optimize caching
COPY --chown=nodejs:nodejs tsconfig.json tsconfig.node.json tsoa.json ./

# Copy source code
COPY --chown=nodejs:nodejs src/ ./src/

# Build the application
# The `build` script from package.json runs tsoa and tsc
RUN yarn build

# Prune development dependencies to create a lean node_modules for production
RUN yarn workspaces focus --production

#-----------------------------------------------------------------------------
# Production Stage
# Creates the final, small, and secure image for deployment.
#-----------------------------------------------------------------------------
FROM base AS production

# Set environment for production
ENV APP_ENV=production

# Copy necessary files from the builder stage with correct permissions
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/build ./build
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

# Switch to the non-root user
USER nodejs

# Expose port 8080. Cloud Run injects the final PORT env variable.
ENV PORT=8080
EXPOSE 8080

# Use dumb-init to handle signals properly and gracefully shut down
ENTRYPOINT ["dumb-init", "--"]

# Command to start the application
CMD ["node", "--import", "/app/build/instrument.js", "/app/build/server.js"]
