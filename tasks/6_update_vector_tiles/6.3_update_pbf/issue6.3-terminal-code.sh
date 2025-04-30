# From Mjumbe

### Deploy a cloud run task with a Docker image
gcloud run jobs deploy generate-property-tiles \
  --service-account='data-pipeline-user@musa5090s25-team1.iam.gserviceaccount.com' \
  --cpu 4 \
  --memory 4Gi \
  --region us-east4 \
  --source=. \
  --timeout=3600s

gcloud run jobs execute generate-property-tiles \
  --region us-east4

gcloud run jobs executions describe generate-property-tiles-822d2 \
  --region us-east4








# Sean for ref

#### Only needed once when creating new job

gcloud artifacts repositories create generate-property-tiles --repository-format=docker `
--location=us-east4

#### Do whenever docker build is changed
gcloud builds submit `
  --region us-east4 `
  --tag us-east4-docker.pkg.dev/musa5090s25-team4/generate-property-tiles/tiles-image:1

#### Change to update/create depending on if job already exists
gcloud run jobs create generate-property-tiles `
  --image us-east4-docker.pkg.dev/musa5090s25-team4/generate-property-tiles/tiles-image:1 `
  --service-account data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
  --cpu 4 `
  --memory 4Gi `
  --region us-east4
shell
gcloud run jobs execute generate-property-tiles --region=us-east4
