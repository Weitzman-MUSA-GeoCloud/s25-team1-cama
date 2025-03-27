python3 -m venv env

pip install \
  functions-framework \
  google-cloud-storage \
  requests \
  python-dotenv

pip install pipreqs
# this is for populating the requirements.txt file

pipreqs --ignore node_modules --force

functions-framework --debug \
  --target extract_phl_opa_properties

gcloud functions deploy extract_phl_opa_properties-attempt10 \
--region=us-east4 \
--runtime=python312 \
--source=. \
--entry-point=extract_phl_opa_properties \
--service-account='data-pipeline-user@musa5090s25-team1.iam.gserviceaccount.com' \
--timeout=999s \
--memory=4096MB \
--no-allow-unauthenticated \
--set-env-vars='DATA_LAKE_BUCKET=musa5090s25-team1-raw_data' \
--trigger-http

gcloud functions call extract_phl_opa_properties-attempt10 --region=us-east4 --gen2

gcloud functions deploy prepare_phl_opa_properties-attempt2 \
--region=us-east4 \
--runtime=python312 \
--source=. \
--entry-point=prepare_phl_opa_properties \
--service-account='data-pipeline-user@musa5090s25-team1.iam.gserviceaccount.com' \
--timeout=999s \
--memory=8Gi \
--no-allow-unauthenticated \
--set-env-vars='DATA_LAKE_BUCKET=musa5090s25-team1-raw_data,DESTINATION_DATA_LAKE_BUCKET=musa5090s25-team1-prepared_data' \
--trigger-http

gcloud functions call prepare_phl_opa_properties-attempt2 --region=us-east4 --gen2
