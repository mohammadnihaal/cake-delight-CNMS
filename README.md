# 🍰 Cake Delight – Cloud-Native Microservices (Node.js + Express + MongoDB)

Browse cakes, filter, build a basket, check out, receive an order-confirmation email and rate your cakes.
Built as independently deployable microservices, packaged with Docker and run on Kubernetes.

## 1. Architecture

```
React UI (nginx) ──> API Gateway :8080 ──┬─> Catalog :3001      ──> cakes
                                         ├─> Order   :3002      ──> orders
                                         ├─> Rating  :3003      ──> ratings        (one MongoDB,
                                         └─> Notification :3004 ──> notifications    one collection each)

REST:   Order ──GET /cakes/:id──> Catalog       (validate cake + price when adding to basket)
Event:  Order ──"order.completed"──> RabbitMQ ──> Notification ──SMTP──> Mailpit
```

| Component | Port | Owns (MongoDB collection) | Notes |
|---|---|---|---|
| frontend | 80 (NodePort 30080) | – | Vite + React, served by nginx, proxies `/api` to the gateway |
| gateway | 8080 | – | Express + http-proxy-middleware, single entry point |
| catalog-service | 3001 | `cakes` | list/filter/details |
| order-service | 3002 | `orders` (basket = order with status `BASKET`, items embedded) | calls Catalog (REST), publishes event |
| rating-service | 3003 | `ratings` | submit ratings, averages |
| notification-service | 3004 | `notifications` | consumes event, sends email, stores status |
| mongo / rabbitmq / mailpit | 27017 / 5672 / 1025+8025 | – | infrastructure |

**Data ownership:** each service reads/writes only its own collection. Collections reference each other by id only
(`ratings.cakeId`, `orders.items[].cakeId`, `notifications.orderId`); there are no cross-service joins or `populate`.
Details are obtained through the other service's API.

**The message queue is used only for notifications.** Everything else is REST. nginx only serves the frontend; services find each other through Kubernetes DNS names (`http://catalog-service:3001`, `amqp://rabbitmq:5672`, ...) configured in `k8s/01-config.yaml`.

Each service uses the same layout: `models/`, `controllers/`, `services/`, `routes/`, `validators/` (request validation happens once, in the route-level Joi middleware).

## 2. Prerequisites
- Docker Desktop (with **Kubernetes enabled**: Settings → Kubernetes → Enable) *or* minikube / kind
- kubectl
- Nothing else; Node is only needed if you want to run a service outside Docker.

Check: `docker version`, `kubectl get nodes`.

## 3. Build the images
From the `cake-delight` folder:

```powershell
./build-images.ps1          # Windows PowerShell
# or: sh build-images.sh    # macOS / Linux / Git Bash
```
This runs `docker build -t cakedelight/<name>:latest ./<name>` for catalog-service, order-service, rating-service, notification-service, gateway and frontend.

Docker Desktop's Kubernetes uses the local Docker images directly. For other clusters load the images:
- minikube: `minikube image load cakedelight/<name>:latest` for each image
- kind: `kind load docker-image cakedelight/<name>:latest` for each image

### No Kubernetes in Docker Desktop? Use kind (tested setup)
```bash
winget install Kubernetes.kind            # then open a new terminal
kind create cluster --name cakedelight --image kindest/node:v1.31.4 --config kind-config.yaml
kind load docker-image cakedelight/catalog-service:latest cakedelight/order-service:latest cakedelight/rating-service:latest cakedelight/notification-service:latest cakedelight/gateway:latest cakedelight/frontend:latest --name cakedelight
```
- `--image kindest/node:v1.31.4` is required when Docker runs on **cgroup v1** (`docker info` shows `CgroupVersion: 1`); newer node images refuse to start there.
- `kind-config.yaml` maps NodePorts so http://localhost:30080 (app) and http://localhost:30025 (Mailpit) work.
- Delete the cluster with `kind delete cluster --name cakedelight`.

## 4. Deploy to Kubernetes
```bash
kubectl apply -f k8s/
kubectl get pods -n cakedelight -w      # wait until every pod is Running and READY 1/1
```
(MongoDB and RabbitMQ take a little longer; the services retry their connections automatically.)

## 5. Seed the cakes (once)
```bash
kubectl apply -f k8s/jobs/seed-job.yaml
kubectl logs job/seed-catalog -n cakedelight        # "[seed] inserted 10 cakes"
```

## 6. Open the app
| What | URL |
|---|---|
| Cake Delight UI | http://localhost:30080 (Docker Desktop) – or `minikube service frontend -n cakedelight`, or `kubectl port-forward svc/frontend 3000:80 -n cakedelight` → http://localhost:3000 |
| Mailpit (emails) | http://localhost:30025 – or `kubectl port-forward svc/mailpit 8025:8025 -n cakedelight` → http://localhost:8025 |
| RabbitMQ UI (optional) | `kubectl port-forward svc/rabbitmq 15672:15672 -n cakedelight` → http://localhost:15672 (guest / guest) |
| Gateway (API) | `kubectl port-forward svc/gateway 8080:8080 -n cakedelight` → http://localhost:8080/api/catalog/cakes |

## 6b. Send real emails (SMTP settings in `.env`)
All mail settings live in `notification-service/.env` (template: `.env.example`):
`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` and `MAIL_FROM` (the "from" address).
1. Edit `notification-service/.env` with your real SMTP account. For Gmail: turn on 2-Step Verification, create an
   **App password** (https://myaccount.google.com/apppasswords) and use it as `SMTP_PASS`; set `MAIL_FROM` to the same Gmail address. No quotes around values.
2. Load it into the cluster and restart the notification service:
   ```powershell
   ./apply-mail-secret.ps1
   ```
   (cmd equivalent: `kubectl create secret generic mail-secret -n cakedelight --from-env-file=notification-service/.env --dry-run=client -o yaml | kubectl apply -f -` then `kubectl rollout restart deploy/notification-service -n cakedelight`)
3. Check the log: `kubectl logs -n cakedelight -l app=notification-service --tail=5` should say `SMTP ready: ...`. `SMTP check failed ... Invalid login` means wrong user/app password.
4. Place an order with a real email address; the mail arrives in that inbox. Failed sends are retried 3 times and then stored with `status: FAILED` and the error (`GET /api/notification/notifications`).
Without the `mail-secret` the service falls back to Mailpit (fake inbox). With Docker Compose the same `.env` is read automatically.
`.env` is git-ignored and never copied into the Docker image.

## 7. Try the end-to-end flow
1. Browse cakes; use the name / category / price filters.
2. Add cakes to the basket; open the basket; change quantities or remove items.
3. Enter an email and **Checkout**.
4. Open Mailpit – the order confirmation email is there. `GET /api/notification/notifications` shows `status: SENT`.
5. In the confirmation dialog rate the cakes (1–5 stars); the average appears on the cake card.

## 8. API reference (through the gateway, prefix `/api/<service>`)
The `X-User-Id` header identifies the user (default `demo-user`; there is no authentication).

**Catalog** `/api/catalog`
- `GET /cakes?name=&category=&minPrice=&maxPrice=` – list/filter
- `GET /cakes/categories` – distinct categories
- `GET /cakes/:id` – details

**Order** `/api/order`
- `GET /basket`
- `POST /basket/items` `{cakeId, quantity?}` – add (validates against Catalog)
- `PUT /basket/items/:cakeId` `{quantity}`
- `DELETE /basket/items/:cakeId`
- `POST /checkout` `{email}` – confirms the order, publishes `order.completed`
- `GET /orders/:id`

**Rating** `/api/rating`
- `POST /ratings` `{cakeId, score (1-5), comment?}`
- `GET /ratings/:cakeId`
- `GET /ratings/:cakeId/average` → `{cakeId, average, count}`
- `GET /ratings/averages` – averages for all cakes

**Notification** `/api/notification`
- `GET /notifications` – recent delivery statuses

Invalid input returns `400 {"error":"Validation failed","details":[...]}`.

## 9. Data model (Mongoose schemas)
```js
Cake         { name, description, category, price, available, imageUrl }                  // collection: cakes
Order        { userId, email, status: BASKET|CONFIRMED, total,
               items: [{ cakeId, name, price, quantity }] }                               // collection: orders
Rating       { cakeId, userId, score: 1..5, comment }                                      // collection: ratings
Notification { orderId, channel: EMAIL, status: SENT|FAILED, message }                    // collection: notifications
```
Full definitions: `*-service/src/models/`.

## 10. Event contract – `order.completed` (RabbitMQ queue `order.completed`, durable, JSON)
```json
{
  "eventId": "uuid",
  "type": "order.completed",
  "occurredAt": "2026-11-14T10:00:00.000Z",
  "orderId": "mongo-object-id",
  "userId": "demo-user",
  "email": "customer@example.com",
  "items": [{ "cakeId": "mongo-object-id", "name": "Red Velvet Dream", "quantity": 2, "price": 26 }],
  "total": 52
}
```
Producer: Order service. Consumer: Notification service (idempotent per `orderId`).

## 11. Resilience demo
- Scale a service: `kubectl scale deploy/catalog-service --replicas=3 -n cakedelight` (the UI keeps working; the Service load-balances).
- Notification down: `kubectl scale deploy/notification-service --replicas=0 -n cakedelight`, place an order, then `--replicas=1`; the queued event is delivered and the email arrives.
- Failures are handled with request timeouts + retries (Order → Catalog), automatic reconnects (MongoDB, RabbitMQ), `/health` probes, and request logging (`kubectl logs deploy/<name> -n cakedelight`).

## 12. Optional: run with Docker Compose
```bash
docker compose up --build
```
UI at http://localhost:3000, Mailpit at http://localhost:8025. The `seed` container loads the cakes automatically.

## 13. Troubleshooting
| Symptom | Fix |
|---|---|
| `ErrImagePull` / `ImagePullBackOff` | Images not built/loaded into the cluster – redo step 3 |
| Pod `CrashLoopBackOff` | `kubectl logs <pod> -n cakedelight` |
| UI shows no cakes | Run the seed job (step 5) |
| Port 30080 not reachable | Use `kubectl port-forward svc/frontend 3000:80 -n cakedelight` |
| No email in Mailpit | Check `kubectl logs deploy/notification-service -n cakedelight` and that RabbitMQ pod is Ready |

## 14. Shut down
| Goal | Command |
|---|---|
| Remove the app, keep the cluster | `kubectl delete namespace cakedelight` |
| Stop the app but keep data/config (pods to 0) | `kubectl scale deploy --all --replicas=0 -n cakedelight` (start again with `--replicas=1`) |
| Delete the whole kind cluster | `kind delete cluster --name cakedelight` |
| Stop Docker Compose | `docker compose down` |
