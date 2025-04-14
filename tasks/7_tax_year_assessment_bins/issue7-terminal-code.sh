gcloud functions deploy create_tax_year_assessments \
--region=us-east4 \
--runtime=python312 \
--source=. \
--entry-point=run_sql \
--service-account='data-pipeline-user@musa5090s25-team1.iam.gserviceaccount.com' \
--timeout=999s \
--memory=16Gi \
--no-allow-unauthenticated \
--trigger-http \
--gen2

gcloud functions call create_tax_year_assessments --region=us-east4 --gen2