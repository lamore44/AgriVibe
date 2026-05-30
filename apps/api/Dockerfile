# Stage 1: Build binary
FROM rust:1.80-slim as builder
WORKDIR /app

# Install system dependencies needed for compiling
RUN apt-get update && apt-get install -y pkg-config libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy workspace configurations and manifests
COPY Cargo.toml Cargo.lock ./
COPY apps/api/Cargo.toml apps/api/Cargo.toml

# Create dummy source file to compile and cache dependencies
RUN mkdir -p apps/api/src && echo "fn main() {}" > apps/api/src/main.rs
RUN cargo build --release --manifest-path apps/api/Cargo.toml

# Copy actual source files
COPY apps/api/src apps/api/src

# Rebuild actual application
RUN touch apps/api/src/main.rs && cargo build --release --manifest-path apps/api/Cargo.toml

# Stage 2: Runtime image
FROM debian:bookworm-slim
WORKDIR /app

# Install OpenSSL & certificates (needed for secure outgoing HTTP requests)
RUN apt-get update && apt-get install -y ca-certificates openssl && rm -rf /var/lib/apt/lists/*

# Copy compiled binary from builder
COPY --from=builder /app/target/release/agrivibe_backend ./backend

# Default port
EXPOSE 8080
ENV PORT=8080

CMD ["./backend"]
