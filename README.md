# Shopping list app
 
a simple, full-stack shopping list app built with Node.js, React, and MongoDB. designed for easy self-hosting via Docker. probably overkill, I know.

## features

- React frontend serving static files via backend
- backend API and frontend served from one (1!!) container
- connects to your MongoDB Atlas cluster or local MongoDB
- easily deployable with Docker / compose
- designed for private usage behind VPN or reverse proxy

---

## quickstart

### prerequisites

- Docker installed on your server / machine
- MongoDB connection string (e.g. MongoDB Atlas URI) (for this scope it's free!)
- optional: Tailscale network for secure internal access (i love tailscale)

---

## usage

### environment variables

`PORT` - port the backend server listens on (default: 3001)
`MONGODB_URI` - your MongoDB connection string

---

### run with Docker CLI

```bash
docker run -d \
  -p 3001:3001
  -e PORT=3001 \
  -e MONGODB_URI="yourmongodbconnectionstring" \
  ghcr.io/sashavrg/shopping-list:latest
```

### run with Docker Compose

```yaml
version: "3.8"

services:
  shopping-list:
    image: ghcr.io/sashavrg/shopping-list:latest
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - MONGODB_URI=your-mongodb-connection-string
    restart: unless-stopped
```
run

```bash
docker-compose up -d
```

## reverse proxy

if you want to expose the app via a domain, you can configure a reverse proxy (nginx etc) to forward requests to your server's IP and port.

if running inside a private VPN like Tailscale, you can point the proxy to your server's Tailscale IP.

---

## future improvements

- add volume mount for config file
- support local MongoDB deployment
- add https with self-signed certs for private VPN use
- enhance frontend and features

## license

MIT License © sashavrg