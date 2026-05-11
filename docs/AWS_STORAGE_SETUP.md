# AWS Storage Setup

CodeWithKasa stores media configuration from the admin Site Settings
dashboard. The env file should only contain infrastructure values needed to boot
the app. Upload credentials, bucket settings, CloudFront URL, and related media
settings should be saved from the dashboard after installation.

## Required AWS Resources

Create these resources before enabling S3 storage:

- S3 bucket for uploaded media.
- IAM user or role with scoped access to that bucket.
- CloudFront distribution in front of the bucket for optimized public delivery.

## S3 Bucket

Recommended defaults:

- Block public access: keep enabled for private buckets.
- Object ownership: bucket owner enforced.
- Versioning: optional, useful for production rollback.
- CORS: allow your frontend domain to read uploaded assets.

Example CORS:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD", "PUT", "POST"],
    "AllowedOrigins": ["https://your-domain.com", "http://localhost:3000"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## IAM Policy

Use the smallest possible bucket-level policy for the app user:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME"
    }
  ]
}
```

## CloudFront

Recommended setup:

- Origin: the S3 bucket.
- Viewer protocol policy: redirect HTTP to HTTPS.
- Cache policy: optimized caching for images/assets.
- Origin access control: enabled when the bucket is private.
- Alternate domain name: optional, for example `cdn.your-domain.com`.
- TLS certificate: use AWS Certificate Manager in `us-east-1` for CloudFront.

After CloudFront is deployed, save the distribution domain or custom CDN domain
in Site Settings.

## Dashboard Fields

After installation, go to:

`Admin -> Settings -> Site -> Storage & Checkout`

Add:

- AWS region.
- S3 bucket name.
- Access key ID.
- Secret access key.
- CloudFront URL.

Then upload a test image from Media Manager and verify that public pages load it
through the CDN.
