python3 -m venv env

.\env\Scripts\Activate.ps1

pip install `
  functions-framework `
  google-cloud-storage `
  requests `
  python-dotenv

pip install pipreqs
pipreqs --ignore node_modules --force

functions-framework --debug --target predict

gcloud functions deploy predict `
  --region=us-east4 `
  --runtime=python312 `
  --source=. `
  --entry-point=predict `
  --service-account='train-and-predict@musa5090s25-team1.iam.gserviceaccount.com' `
  --timeout=999s `
  --memory=4096MB `
  --no-allow-unauthenticated `
  --set-env-vars="DATA_LAKE_BUCKET=musa5090s25-team1-prepared_data" `
  --trigger-http

gcloud functions call predict `
  --region=us-east4 `
  --gen2 `
  --data '{"jsonl_gcs_path":"gs://musa5090s25-team1-prepared_data/opa_properties/data.jsonl"}'