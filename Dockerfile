FROM golang:1.25

WORKDIR /app

COPY back-end/go.mod back-end/go.sum ./
RUN go mod download

COPY back-end/  .
COPY front-end/ ../front-end/

RUN go build -o main .

CMD ["./main"]