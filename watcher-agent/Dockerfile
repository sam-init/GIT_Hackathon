FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod .
COPY cmd/watcher/main.go ./cmd/watcher/
RUN go build -o watcher ./cmd/watcher/

FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/watcher .
CMD ["./watcher"]
