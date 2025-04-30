gcloud functions deploy run_property_tiles_job \
  --region=us-east4 \
  --runtime=python312 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point=run_property_tiles_job \
  --gen2 \
  --timeout=999s \
  --memory=16Gi \
  --service-account='data-pipeline-user@musa5090s25-team1.iam.gserviceaccount.com'

gcloud functions call run_property_tiles_job --region=us-east4 --gen2