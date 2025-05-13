python -m venv env
.\env\Scripts\Activate.ps1

pip install `
  functions-framework `
  google-cloud-storage `
  pandas `
  numpy `
  shapely `
  scikit-learn `
  geopy `
  python-dotenv

pip install pipreqs
pipreqs --ignore node_modules,env --force

functions-framework --debug --target check

gcloud functions deploy check `
  --gen2 `
  --region=us-east4 `
  --runtime=python311 `
  --source=. `
  --entry-point=check `
  --service-account=train-and-predict@musa5090s25-team1.iam.gserviceaccount.com `
  --timeout=120s `
  --memory=1024MB `
  --no-allow-unauthenticated `
  --set-env-vars `
     DATA_LAKE_BUCKET=musa5090s25-team1-prepared_data,`
     PREDICTIONS_OBJECT=predict/predict.json `
  --trigger-http

gcloud functions call check `
  --gen2 `
  --region=us-east4 `
  --data '{"address":"1600 Pennsylvania Ave NW, Washington, DC"}'