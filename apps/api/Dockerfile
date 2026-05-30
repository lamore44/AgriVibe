# Stage 1: Build binary
FROM rust:1.87-slim as builder
WORKDIR /app

RUN apt-get update && apt-get install -y pkg-config libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

COPY Cargo.toml Cargo.lock ./
COPY apps/api/Cargo.toml apps/api/Cargo.toml

RUN mkdir -p apps/api/src && echo "fn main() {}" > apps/api/src/main.rs
RUN cargo build --release --manifest-path apps/api/Cargo.toml

COPY apps/api/src apps/api/src

RUN touch apps/api/src/main.rs && cargo build --release --manifest-path apps/api/Cargo.toml

# Stage 2: Runtime image
FROM debian:bookworm-slim
WORKDIR /app

RUN apt-get update && apt-get install -y ca-certificates openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/agrivibe_backend ./backend

EXPOSE 8080
ENV PORT=8080

CMD ["./backend"]