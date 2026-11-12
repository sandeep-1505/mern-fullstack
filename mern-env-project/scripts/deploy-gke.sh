#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-circuitrank}"
REGION="${REGION:-asia-south1}"
REPO_NAME="${REPO_NAME:-mern-repo}"
CLUSTER_NAME="${CLUSTER_NAME:-mern-prod-cluster}"
NAMESPACE="${NAMESPACE:-mern-prod}"
IMAGE_TAG="${IMAGE_TAG:-v1.0.0}"
IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/mern-app:${IMAGE_TAG}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "==> 1. Enabling required GCP APIs..."
gcloud services enable \
  container.googleapis.com \
  artifactregistry.googleapis.com \
  --project="${PROJECT_ID}"

echo "==> 2. Ensuring Artifact Registry repository '${REPO_NAME}' exists..."
if ! gcloud artifacts repositories describe "${REPO_NAME}" --location="${REGION}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud artifacts repositories create "${REPO_NAME}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="Docker repository for MERN production app" \
    --project="${PROJECT_ID}"
fi

echo "==> 3. Configuring Docker auth and building/pushing ${IMAGE_URI}..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet
docker build --platform linux/amd64 -t "${IMAGE_URI}" "${PROJECT_DIR}"
docker push "${IMAGE_URI}"

echo "==> 4. Ensuring GKE Autopilot cluster '${CLUSTER_NAME}' exists..."
if ! gcloud container clusters describe "${CLUSTER_NAME}" --region="${REGION}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud container clusters create-auto "${CLUSTER_NAME}" \
    --region="${REGION}" \
    --release-channel=regular \
    --project="${PROJECT_ID}"
fi

echo "==> 5. Fetching GKE credentials..."
gcloud container clusters get-credentials "${CLUSTER_NAME}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}"

echo "==> 6. Applying namespace and ConfigMap..."
kubectl apply -f "${PROJECT_DIR}/k8s/00-namespace.yaml"
kubectl apply -f "${PROJECT_DIR}/k8s/01-configmap.yaml"

echo "==> 7. Creating Kubernetes Secrets (if not already present)..."
if ! kubectl -n "${NAMESPACE}" get secret mongo-secret >/dev/null 2>&1; then
  MONGO_USER="mernadmin"
  MONGO_PASS="$(openssl rand -hex 24)"
  kubectl -n "${NAMESPACE}" create secret generic mongo-secret \
    --from-literal=MONGO_INITDB_ROOT_USERNAME="${MONGO_USER}" \
    --from-literal=MONGO_INITDB_ROOT_PASSWORD="${MONGO_PASS}" \
    --from-literal=MONGO_INITDB_DATABASE="mern_db"
else
  MONGO_USER="$(kubectl -n "${NAMESPACE}" get secret mongo-secret -o jsonpath='{.data.MONGO_INITDB_ROOT_USERNAME}' | base64 -d)"
  MONGO_PASS="$(kubectl -n "${NAMESPACE}" get secret mongo-secret -o jsonpath='{.data.MONGO_INITDB_ROOT_PASSWORD}' | base64 -d)"
fi

if ! kubectl -n "${NAMESPACE}" get secret mern-app-secret >/dev/null 2>&1; then
  kubectl -n "${NAMESPACE}" create secret generic mern-app-secret \
    --from-literal=MONGO_URI="mongodb://${MONGO_USER}:${MONGO_PASS}@mongo-0.mongo-headless.${NAMESPACE}.svc.cluster.local:27017/mern_db?authSource=admin" \
    --from-literal=JWT_SECRET="$(openssl rand -base64 32)" \
    --from-literal=API_KEY="$(openssl rand -hex 24)"
fi

echo "==> 8. Deploying MongoDB StatefulSet, App Deployment, Service, HPA, NetworkPolicy, and PDB..."
kubectl apply -f "${PROJECT_DIR}/k8s/03-mongo-statefulset.yaml"
kubectl -n "${NAMESPACE}" rollout status statefulset/mongo --timeout=300s

kubectl apply -f "${PROJECT_DIR}/k8s/04-app-deployment.yaml"
kubectl -n "${NAMESPACE}" set image deployment/mern-app mern-app="${IMAGE_URI}"
kubectl apply -f "${PROJECT_DIR}/k8s/05-app-service.yaml"
kubectl apply -f "${PROJECT_DIR}/k8s/06-hpa.yaml"
kubectl apply -f "${PROJECT_DIR}/k8s/07-network-policy.yaml"
kubectl apply -f "${PROJECT_DIR}/k8s/08-pdb.yaml"

kubectl -n "${NAMESPACE}" rollout status deployment/mern-app --timeout=300s
kubectl -n "${NAMESPACE}" get pods,svc,hpa,pdb
