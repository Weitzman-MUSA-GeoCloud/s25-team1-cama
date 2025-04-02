gcloud functions deploy prepare_opa_properties \
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

gcloud functions call prepare_opa_properties --region=us-east4 --gen2
