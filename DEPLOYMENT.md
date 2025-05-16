# PataBaseFiti Frontend Deployment Guide

## Option 1: Traditional Deployment

### Build the Application
```bash
npm run build
```

This will create a `dist` folder with all the static files needed for deployment.

### Deploy to Hosting Services

#### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`

#### Netlify
1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run: `netlify deploy`

#### GitHub Pages
1. Add `"homepage": "https://yourusername.github.io/repo-name"` to package.json
2. Install gh-pages: `npm install --save-dev gh-pages`
3. Add deploy scripts to package.json:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
4. Run: `npm run deploy`

## Option 2: Docker Deployment

### Local Docker Deployment
```bash
# Build the Docker image
docker build -t patabasefiti-frontend .

# Run the container
docker run -p 3000:3000 patabasefiti-frontend
```

### Using Docker Compose
```bash
docker-compose up -d
```

### Deploying to Cloud Services

#### AWS Elastic Container Service (ECS)
1. Push your Docker image to Amazon ECR
2. Create an ECS cluster and service using the AWS Console or CLI

#### Google Cloud Run
```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/[PROJECT-ID]/patabasefiti-frontend

# Deploy to Cloud Run
gcloud run deploy patabasefiti-frontend --image gcr.io/[PROJECT-ID]/patabasefiti-frontend --platform managed
```

#### Azure Container Instances
```bash
# Create a resource group
az group create --name patabasefiti-group --location eastus

# Create a container instance
az container create --resource-group patabasefiti-group --name patabasefiti-frontend --image [YOUR-REGISTRY]/patabasefiti-frontend --dns-name-label patabasefiti --ports 3000
```

## Environment Variables

For production deployments, make sure to set the following environment variables:

- `VITE_BASE_PATH`: The base path for your application (if not deployed at root)
- Any API endpoints or service URLs needed by your application

## Post-Deployment Verification

1. Check that all routes are working correctly
2. Verify that all assets (images, fonts, etc.) are loading
3. Test user authentication flows
4. Ensure responsive design works on various devices
