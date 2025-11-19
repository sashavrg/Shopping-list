# Build stage
FROM rust:1.75 as builder

WORKDIR /app

# Copy manifests
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs to build dependencies
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src

# Copy source code
COPY src ./src
COPY migrations ./migrations

# Build the actual application
RUN touch src/main.rs && cargo build --release

# Runtime stage
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy the binary from builder
COPY --from=builder /app/target/release/shopping_list_backend /app/
COPY --from=builder /app/migrations /app/migrations

# Copy frontend dist if it exists
COPY dist ./dist 2>/dev/null || true

# Create directory for database
RUN mkdir -p /app/data

# Set environment variables
ENV DATABASE_URL=sqlite:/app/data/shopping_list.db
ENV PORT=3001

EXPOSE 3001

CMD ["./shopping_list_backend"]
