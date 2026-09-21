#!/usr/bin/env bash
# ==============================================================================
# Google Cloud Platform Bootstrap & Deployment Script
# Provisions Cloud SQL (PostgreSQL 16), Artifact Registry, Secret Manager,
# Service Accounts, and Cloud Run Services.
# ==============================================================================

set -euo pipefail

# Configurable variables (can be overridden via environment variables)
PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project)}"
REGION="${GCP_REGION:-us-central1}"
ARTIFACT_REPO="${GCP_ARTIFACT_REPO:-el-dugout-repo}"
SQL_INSTANCE_NAME="${CLOUD_SQL_INSTANCE_NAME:-el-dugout-postgres}"
DB_NAME="${POSTGRES_DB:-el_dugout_ve}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_PASSWORD="${POSTGRES_PASSWORD:-$(openssl rand -base64 16)}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -base64 32)}"
BACKEND_SERVICE="el-dugout-backend"
FRONTEND_SERVICE="el-dugout-frontend"

echo "================================================================="
echo "  Deploying El Dugout Ve (eldugoutve.com) to Google Cloud Platform"
echo "  Project ID : ${PROJECT_ID}"
echo "  Region     : ${REGION}"
echo "  Cloud SQL  : ${SQL_INSTANCE_NAME} (PostgreSQL 16)"
echo "================================================================="

# 1. Enable Required GCP APIs
echo "==> [1/7] Enabling Google Cloud APIs..."
gcloud services enable \
    run.googleapis.com \
    sqladmin.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    cloudbuild.googleapis.com \
    iam.googleapis.com \
    --project="${PROJECT_ID}"

# 2. Create Artifact Registry Repository
echo "==> [2/7] Checking Artifact Registry..."
if ! gcloud artifacts repositories describe "${ARTIFACT_REPO}" --location="${REGION}" --project="${PROJECT_ID}" &>/dev/null; then
    echo "Creating Artifact Registry repository '${ARTIFACT_REPO}'..."
    gcloud artifacts repositories create "${ARTIFACT_REPO}" \
        --repository-format=docker \
        --location="${REGION}" \
        --description="Docker repository for El Dugout Ve images" \
        --project="${PROJECT_ID}"
else
    echo "Artifact Registry repository '${ARTIFACT_REPO}' already exists."
fi

# 3. Provision Google Cloud SQL (PostgreSQL 16)
echo "==> [3/7] Checking Google Cloud SQL instance..."
if ! gcloud sql instances describe "${SQL_INSTANCE_NAME}" --project="${PROJECT_ID}" &>/dev/null; then
    echo "Creating Cloud SQL PostgreSQL 16 instance '${SQL_INSTANCE_NAME}' (this may take a few minutes)..."
    gcloud sql instances create "${SQL_INSTANCE_NAME}" \
        --database-version=POSTGRES_16 \
        --tier=db-f1-micro \
        --region="${REGION}" \
        --storage-type=SSD \
        --storage-size=10GB \
        --storage-auto-increase \
        --project="${PROJECT_ID}"

    echo "Creating database '${DB_NAME}'..."
    gcloud sql databases create "${DB_NAME}" --instance="${SQL_INSTANCE_NAME}" --project="${PROJECT_ID}"

    echo "Setting user '${DB_USER}' password..."
    gcloud sql users set-password "${DB_USER}" \
        --instance="${SQL_INSTANCE_NAME}" \
        --password="${DB_PASSWORD}" \
        --project="${PROJECT_ID}"
else
    echo "Cloud SQL instance '${SQL_INSTANCE_NAME}' already exists."
fi

# Retrieve Cloud SQL Connection Name (format: PROJECT:REGION:INSTANCE)
SQL_CONNECTION_NAME=$(gcloud sql instances describe "${SQL_INSTANCE_NAME}" --format="value(connectionName)" --project="${PROJECT_ID}")
echo "Cloud SQL Connection Name: ${SQL_CONNECTION_NAME}"

# 4. Store Secrets in GCP Secret Manager
echo "==> [4/7] Configuring GCP Secret Manager..."
# Connection string using Cloud SQL Unix socket:
PROD_DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost/${DB_NAME}?host=/cloudsql/${SQL_CONNECTION_NAME}"

create_or_update_secret() {
    local secret_name="$1"
    local secret_value="$2"
    if ! gcloud secrets describe "${secret_name}" --project="${PROJECT_ID}" &>/dev/null; then
        echo "Creating secret '${secret_name}'..."
        echo -n "${secret_value}" | gcloud secrets create "${secret_name}" --data-file=- --project="${PROJECT_ID}"
    else
        echo "Updating secret '${secret_name}'..."
        echo -n "${secret_value}" | gcloud secrets versions add "${secret_name}" --data-file=- --project="${PROJECT_ID}"
    fi
}

create_or_update_secret "DATABASE_URL" "${PROD_DATABASE_URL}"
create_or_update_secret "JWT_SECRET" "${JWT_SECRET}"

# 5. Build and Push Images using Cloud Build
echo "==> [5/7] Submitting Build to Cloud Build..."
IMAGE_BACKEND="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}/backend:latest"
IMAGE_FRONTEND="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}/frontend:latest"

gcloud builds submit --config=deploy/cloudbuild.yaml \
    --substitutions="_REGION=${REGION},_REPO_NAME=${ARTIFACT_REPO},_CLOUD_SQL_INSTANCE=${SQL_INSTANCE_NAME}" \
    --project="${PROJECT_ID}"

# 6. Retrieve Service URLs
echo "==> [6/7] Retrieving Deployed Service URLs..."
BACKEND_URL=$(gcloud run services describe "${BACKEND_SERVICE}" --region="${REGION}" --format="value(status.url)" --project="${PROJECT_ID}" 2>/dev/null || echo "Pending")
FRONTEND_URL=$(gcloud run services describe "${FRONTEND_SERVICE}" --region="${REGION}" --format="value(status.url)" --project="${PROJECT_ID}" 2>/dev/null || echo "Pending")

echo "================================================================="
echo "  Deployment Complete!"
echo "  Frontend URL : ${FRONTEND_URL}"
echo "  Backend API  : ${BACKEND_URL}/api"
echo "  Swagger Docs : ${BACKEND_URL}/api/docs"
echo "  Health Check : ${BACKEND_URL}/api/health"
echo "================================================================="
