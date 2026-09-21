output "cloud_sql_connection_name" {
  description = "Google Cloud SQL Connection Name (PROJECT:REGION:INSTANCE)"
  value       = google_sql_database_instance.postgres.connection_name
}

output "artifact_registry_repo" {
  description = "Artifact Registry Docker URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.name}"
}

output "service_account_email" {
  description = "Cloud Run Service Account"
  value       = google_service_account.cloudrun_sa.email
}
