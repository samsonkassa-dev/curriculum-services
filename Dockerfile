# Use the official Node.js image as a base
FROM node:18-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json, pnpm-lock.yaml, and .npmrc into the container
COPY package.json pnpm-lock.yaml .npmrc ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the entire project into the working directory inside the container
COPY . .

# Expose the port on which Next.js will run (default is 3000)
EXPOSE 3000

# Set the environment variable for production
ENV NODE_ENV=production

# Build the Next.js app
RUN pnpm build

# Start the Next.js app
CMD ["pnpm", "start"]
