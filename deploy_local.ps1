Write-Host "Building Backend Image inside Minikube..."
./minikube.exe image build -t todo-backend:latest ./backend

Write-Host "Building Frontend Image inside Minikube..."
./minikube.exe image build -t todo-frontend:latest ./frontend

Write-Host "Deploying with Helm..."

if (Test-Path ".\helm.exe") {
    $helmCmd = ".\helm.exe"
} else {
    $helmCmd = "helm"
}

& $helmCmd upgrade --install todo-backend ./helm/charts/backend
& $helmCmd upgrade --install todo-frontend ./helm/charts/frontend

Write-Host "Deployment Complete! Access service with:"
Write-Host "./minikube.exe service todo-frontend"
