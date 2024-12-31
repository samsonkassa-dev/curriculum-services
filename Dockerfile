# Use the official Node.js image as a base
FROM node:18-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml into the container
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

#Env
ENV NEXT_PUBLIC_API_URL: "http://164.90.209.220:8081/api"


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
