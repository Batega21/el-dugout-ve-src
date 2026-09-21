variable "project_id" {
  description = "Google Cloud Platform Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region for Cloud Run & Cloud SQL"
  type        = string
  default     = "us-central1"
}

variable "app_name" {
  description = "Application name prefix"
  type        = string
  default     = "el-dugout"
}

variable "db_tier" {
  description = "Cloud SQL database tier"
  type        = string
  default     = "db-f1-micro"
}

variable "db_password" {
  description = "Database master password (leave empty to generate)"
  type        = string
  sensitive   = true
  default     = ""
}
