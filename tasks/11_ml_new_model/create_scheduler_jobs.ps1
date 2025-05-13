set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

gcloud scheduler jobs create http retrain-model-job `
  --schedule="0 9 1 * *" `
  --time-zone="America/New_York" `
  --http-method=POST `
  --uri="https://us-east4-musa5090s25-team1.cloudfunctions.net/train_model" `
  --message-body='{"jsonl_gcs_path":"gs://musa5090s25-team1-prepared_data/opa_properties/data.jsonl"}' `
  --oauth-service-account-email=train-and-predict@musa5090s25-team1.iam.gserviceaccount.com

gcloud scheduler jobs create http gen-predictions-job `
  --schedule="10 9 1 * *" `
  --time-zone="America/New_York" `
  --http-method=POST `
  --uri="https://us-east4-musa5090s25-team1.cloudfunctions.net/predict" `
  --message-body='{"jsonl_gcs_path":"gs://musa5090s25-team1-prepared_data/opa_properties/data.jsonl"}' `
  --oauth-service-account-email=train-and-predict@musa5090s25-team1.iam.gserviceaccount.com
