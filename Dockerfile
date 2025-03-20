FROM node:23-alpine3.20

# Set up environment variables
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Enable corepack for pnpm
RUN corepack enable

WORKDIR /app

# Copy only package files first to leverage Docker caching
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# Copy the rest of the files
COPY . .

COPY .env .env


# Build the project
RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "start"]
