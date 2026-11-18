# Builds one Docker image per component. Run from the cake-delight folder.
$ErrorActionPreference = 'Stop'
foreach ($svc in 'catalog-service', 'order-service', 'rating-service', 'notification-service', 'gateway', 'frontend') {
  Write-Host "Building cakedelight/$svc ..."
  docker build -t "cakedelight/${svc}:latest" "./$svc"
}
Write-Host 'All images built.'
