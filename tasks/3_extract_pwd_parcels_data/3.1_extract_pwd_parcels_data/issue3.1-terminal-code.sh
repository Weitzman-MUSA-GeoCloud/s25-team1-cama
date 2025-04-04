functions-framework --debug \
  --target extract_pwd_parcels

# deploy the function!

gcloud functions deploy extract_pwd_parcels \
--region=us-east4 \
--runtime=python312 \
--source=. \
--entry-point=extract_pwd_parcels \
--service-account='data-pipeline-user@musa5090s25-team1.iam.gserviceaccount.com' \
--timeout=540s \
--memory=8Gi \
--no-allow-unauthenticated \
--set-env-vars='DATA_LAKE_BUCKET=musa5090s25-team1-raw_data' \
--trigger-http

gcloud functions call extract_pwd_parcels --region=us-east4 --gen2