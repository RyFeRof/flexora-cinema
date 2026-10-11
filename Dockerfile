# ---- сборка ----
FROM golang:1.26 AS build
WORKDIR /src
COPY back-end/go.mod back-end/go.sum ./
RUN go mod download
COPY back-end/ .
RUN CGO_ENABLED=0 go build -o /out/server .

# ---- запуск ----
FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=build /out/server ./server
COPY back-end/migrations ./migrations
RUN mkdir -p uploads
EXPOSE 8080
CMD ["./server"]
