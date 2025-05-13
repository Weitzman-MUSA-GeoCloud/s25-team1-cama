python -m venv env
.\env\Scripts\Activate.ps1

pip install functions-framework google-cloud-storage requests python-dotenv

pip install pipreqs
pipreqs --ignore node_modules,env --force

functions-framework --debug --target predict

gcloud functions deploy predict `
  --gen2 `
  --region=us-east4 `
  --runtime=python311 `
  --source=. `
  --entry-point=predict `
  --service-account=train-and-predict@musa5090s25-team1.iam.gserviceaccount.com `
  --timeout=999s `
  --memory=4096MB `
  --no-allow-unauthenticated `
  --set-env-vars `
    DATA_LAKE_BUCKET=musa5090s25-team1-prepared_data,`
    MODEL_BUCKET=musa5090s25-team1-prepared_data,`
    MODEL_FILENAME=model.pkl `
  --trigger-http

gcloud functions call predict `
  --gen2 `
  --region=us-east4 `
  --data '{"jsonl_gcs_path":"gs://musa5090s25-team1-prepared_data/opa_properties/data.jsonl"}'