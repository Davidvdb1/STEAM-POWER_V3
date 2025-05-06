# STEAM-POWER_V3
 STEAM Power in webcomponents

## Deployment Instructions

### 1. Push code to main branch

### 2. Run workflow
This should happen automatically.
If this is not done automatically, go to https://github.com/Davidvdb1/STEAM-POWER_V3/actions/workflows/docker-image.yml

### 3. Pull containers on server
Commands:
```bash
# Disable containers from docker-compose.yml that are still running
docker compose down

# Remove all docker cache (not always necessary)
docker system prune -a

# Pull the images needed by docker-compose.yml
docker compose pull

# Start the containers (remove -d if you want to see the logs)
docker compose up -d

# Open shell in a running container
docker exec -it steam-power_v3-backend-1 sh
```

### Docker Compose Configuration
The docker-compose.yml on the server handles:
- Defining environment variables in the backend
- Linking the db container with the backend container
- Running Prisma migrations
- Running the seed file
- Starting Prisma studio
- Copying productionConfig.js to config.js in the frontend

### Troubleshooting
If the website hasn't updated, it could be due to browser cache or Cloudflare cache.
