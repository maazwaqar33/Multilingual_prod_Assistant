$env:Path = "C:\Program Files\Docker\Docker\resources\bin;" + $env:Path

if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "Minikube often requires Administrator privileges (Hyper-V). Please restart PowerShell as Administrator."
}

Write-Host "Cleaning up old Minikube state..."
./minikube.exe delete

Write-Host "Trying Minikube with Docker driver..."
./minikube.exe start --driver=docker

if ($LASTEXITCODE -ne 0) {
    Write-Warning "Docker driver failed. Trying Hyper-V (Requires Admin)..."
    ./minikube.exe start --driver=hyperv
}

Write-Host "Minikube status:"
./minikube.exe status
