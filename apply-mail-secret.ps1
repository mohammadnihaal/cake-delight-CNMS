# Loads notification-service/.env into the cluster as secret "mail-secret" and restarts the notification service.
$ErrorActionPreference = 'Stop'
kubectl create secret generic mail-secret -n cakedelight --from-env-file=notification-service/.env --dry-run=client -o yaml | kubectl apply -f -
kubectl rollout restart deploy/notification-service -n cakedelight
kubectl rollout status deploy/notification-service -n cakedelight
kubectl logs -n cakedelight -l app=notification-service --tail=5
