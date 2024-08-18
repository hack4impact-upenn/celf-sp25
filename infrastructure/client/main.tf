# Load environment variables from the .env file
provider "local" {}

resource "local_file" "dotenv" {
  content  = file("${path.module}/.env")
  filename = "${path.module}/.terraform.env"
}

provider "aws" {
  region     = "us-west-1" # Set your desired region
  access_key = var.aws_access_key_id
  secret_key = var.aws_secret_access_key
}

# S3 Bucket
resource "aws_s3_bucket" "static_website" {
  bucket = var.s3_bucket_name
}

# S3 bucket ownership controls
resource "aws_s3_bucket_ownership_controls" "static_website" {
  bucket = aws_s3_bucket.static_website.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# Allow public access by disabling public access block
resource "aws_s3_bucket_public_access_block" "static_website" {
  bucket = aws_s3_bucket.static_website.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 Bucket ACL to allow public read access
resource "aws_s3_bucket_acl" "static_website" {
  depends_on = [
    aws_s3_bucket_ownership_controls.static_website,
    aws_s3_bucket_public_access_block.static_website,
  ]

  bucket = aws_s3_bucket.static_website.id
  acl    = "public-read"
}

# S3 Bucket Website Configuration
resource "aws_s3_bucket_website_configuration" "static_website_config" {
  bucket = aws_s3_bucket.static_website.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# Upload files to S3 bucket
resource "aws_s3_object" "website_files" {
  for_each = fileset("../../client/build", "**/*")

  bucket = aws_s3_bucket.static_website.bucket
  key    = each.key
  source = "../../client/build/${each.key}"
  # No ACL specified to avoid AccessControlListNotSupported errors
}

# S3 Bucket Policy to allow public access to all objects
# resource "aws_s3_bucket_policy" "static_website_policy" {
#   bucket = aws_s3_bucket.static_website.id
#   depends_on = [
#     aws_s3_bucket_acl.static_website,
#     aws_s3_bucket_website_configuration.static_website_config,
#   ]

#   policy = jsonencode({
#     Version = "2012-10-17",
#     Statement = [
#       {
#         Sid       = "PublicReadGetObject",
#         Effect    = "Allow",
#         Principal = "*",
#         Action    = "s3:GetObject",
#         Resource  = "${aws_s3_bucket.static_website.arn}/*"
#       }
#     ]
#   })
# }

# CloudFront Distribution
resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket.static_website.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.static_website.bucket

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = aws_s3_bucket.static_website.bucket
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  # Handle 403 errors by serving index.html with a 200 status code
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  # Default root object
  default_root_object = "index.html"

  enabled         = true
  is_ipv6_enabled = true
  price_class     = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

output "s3_bucket_name" {
  value = aws_s3_bucket.static_website.bucket
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.cdn.domain_name
}
