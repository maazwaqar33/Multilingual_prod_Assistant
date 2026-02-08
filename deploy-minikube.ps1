# TodoEvolve - Local K8s Deployment with Minikube
# This script sets up TodoEvolve on a local Minikube cluster

# Prerequisites:
# - Docker Desktop installed
# - Minikube installed (winget install Kubernetes.minikube)
# - kubectl installed (winget install Kubernetes.kubectl)
# - Helm installed (winget install Helm.Helm)

# --- Step 1: Start Minikube ---
Write-Host "Starting Minikube cluster..." -ForegroundColor Cyan
minikube start --driver=docker --memory=4096 --cpus=2

# Enable ingress addon
Write-Host "Enabling ingress addon..." -ForegroundColor Cyan
minikube addons enable ingress

# --- Step 2: Build Docker Images ---
Write-Host "Building Docker images in Minikube context..." -ForegroundColor Cyan
& minikube -p minikube docker-env | Invoke-Expression

# Build Backend
Write-Host "Building backend image..." -ForegroundColor Yellow
docker build -t todoevolve/backend:latest ./backend

# Build Frontend
Write-Host "Building frontend image..." -ForegroundColor Yellow
docker build -t todoevolve/frontend:latest ./frontend

# --- Step 3: Create Secrets ---
Write-Host "Creating Kubernetes secrets..." -ForegroundColor Cyan

# Read secrets from .env if exists
$envFile = ".\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    foreach ($line in $envContent) {
        if ($line -match "^([^=]+)=(.+)$") {
            Set-Variable -Name $matches[1] -Value $matches[2]
        }
    }
}

# Default values if not set
$BETTER_AUTH_SECRET = if ($env:BETTER_AUTH_SECRET) { $env:BETTER_AUTH_SECRET } else { "production-secret-min-32-characters-long-here" }
$GEMINI_API_KEY = if ($env:GEMINI_API_KEY) { $env:GEMINI_API_KEY } else { "your-gemini-api-key" }
$OPEN_ROUTER_KEY = if ($env:OPEN_ROUTER_KEY) { $env:OPEN_ROUTER_KEY } else { "your-openrouter-key" }

kubectl create secret generic todoevolve-secrets `
    --from-literal=better-auth-secret=$BETTER_AUTH_SECRET `
    --from-literal=gemini-api-key=$GEMINI_API_KEY `
    --from-literal=open-router-key=$OPEN_ROUTER_KEY `
    --dry-run=client -o yaml | kubectl apply -f -

# --- Step 4: Deploy with Helm ---
Write-Host "Deploying backend with Helm..." -ForegroundColor Cyan
helm upgrade --install todoevolve-backend ./helm/charts/backend `
    --set image.pullPolicy=Never `
    --set image.tag=latest

Write-Host "Deploying frontend with Helm..." -ForegroundColor Cyan
helm upgrade --install todoevolve-frontend ./helm/charts/frontend `
    --set image.pullPolicy=Never `
    --set image.tag=latest `
    --set env.NEXT_PUBLIC_API_URL="http://$(minikube ip):8000"

# --- Step 5: Wait for pods ---
Write-Host "Waiting for pods to be ready..." -ForegroundColor Cyan
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=todoevolve-backend --timeout=120s
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=todoevolve-frontend --timeout=120s

# --- Step 6: Get Access URLs ---
Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Backend URL: http://$(minikube ip):8000" -ForegroundColor Yellow
Write-Host "Frontend URL: http://$(minikube ip):3000" -ForegroundColor Yellow

# Open in browser
Write-Host "`nOpening TodoEvolve in browser..." -ForegroundColor Cyan
minikube service todoevolve-frontend --url

Write-Host "`nTo check pod status: kubectl get pods" -ForegroundColor Gray
Write-Host "To view logs: kubectl logs -l app.kubernetes.io/name=todoevolve-backend" -ForegroundColor Gray
Write-Host "To stop Minikube: minikube stop" -ForegroundColor Gray
