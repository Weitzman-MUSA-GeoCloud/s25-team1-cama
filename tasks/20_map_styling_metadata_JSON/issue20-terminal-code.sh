# check if function works locally
functions-framework --debug \
    --target create_mapstyle_metadata
 # --target generate-assessment-chart-configs
 # --target generate_assessment_chart_configs

gcloud functions deploy create-mapstyle-metadata \
--region=us-east4 \
--runtime=python312 \
--source=. \
--entry-point=create_mapstyle_metadata \
--service-account='data-pipeline-user@musa5090s25-team1.iam.gserviceaccount.com' \
--timeout=999s \
--memory=8Gi \
--no-allow-unauthenticated \
--set-env-vars='DATA_LAKE_PUBLIC=musa5090s25-team1-public' \
--trigger-http

gcloud functions call create-mapstyle-metadata --region=us-east4 --gen2
