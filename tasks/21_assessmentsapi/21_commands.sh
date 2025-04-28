gcloud builds submit --tag gcr.io/musa5090s25-team1/bq-api

--------------------------------------------------------------------------------------------------------------------------
ID                                    CREATE_TIME                DURATION  SOURCE                                                                                           IMAGES                                     STATUS
0fdfc9d6-b0e9-4e64-a018-d307ac5a8584  2025-04-28T18:30:02+00:00  37S       gs://musa5090s25-team1_cloudbuild/source/1745865000.380737-9178b1d4d6164c9781c208ff7db870d2.tgz  gcr.io/musa5090s25-team1/bq-api (+1 more)  SUCCESS

gcloud run deploy bq-api \
  --image gcr.io/musa5090s25-team1/bq-api \
  --platform managed \
  --region us-east4 \
  --allow-unauthenticated