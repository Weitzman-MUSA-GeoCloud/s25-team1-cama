gcloud functions deploy create_pwd_table_with_prediccs \
--region=us-east4 \
--runtime=python312 \
--source=. \
--entry-point=run_sql \
--service-account='data-pipeline-user@musa5090s25-team1.iam.gserviceaccount.com' \
--timeout=999s \
--memory=8Gi \
--no-allow-unauthenticated \
--trigger-http \
--gen2

gcloud functions call create_pwd_table_with_prediccs --region=us-east4 --gen2