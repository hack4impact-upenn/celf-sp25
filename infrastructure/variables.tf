variable "github_repo_owner" {
  default     = "hack4impact-upenn"
  type        = string
  description = "Name of the GH repo owner, used the pull the docker images"
}

variable "github_repo_name" {
  default     = "boilerplate-s2022"
  type        = string
  description = "Name of the GH repo, used to pull the docker images"
}

variable "hosted_zone_name" {
  default     = "hackboilerplate.com"
  type        = string
  description = "Domain name"
}

variable "region" {
  default     = "us-east-1"
  type        = string
  description = "Launch region for the ECS cluster"
}

variable "cluster_name" {
  default     = "app-cluster"
  type        = string
  description = "Name of the ECS cluster"
}

///
// ENV VARIABLES
// These are set in .auto.tfvars
///
variable "aws_account_id" {
  type = string
}

variable "atlas_uri" {
  type = string
}

variable "cookie_secret" {
  type = string
}

variable "aws_region" {
  type        = string
  description = "AWS region for SES (e.g., us-east-1)"
  default     = "us-east-1"
}

variable "aws_access_key_id" {
  type        = string
  description = "AWS Access Key ID for SES"
  sensitive   = true
}

variable "aws_secret_access_key" {
  type        = string
  description = "AWS Secret Access Key for SES"
  sensitive   = true
}

variable "ses_from_email" {
  type        = string
  description = "Email address to send emails from (must be verified in SES)"
}
