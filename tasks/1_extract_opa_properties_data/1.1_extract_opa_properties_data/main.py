from dotenv import load_dotenv
import os
import pathlib
import requests
import functions_framework
from google.cloud import storage

load_dotenv()

DIRNAME = pathlib.Path(__file__).parent
BUCKET_NAME = os.getenv('DATA_LAKE_BUCKET')

@functions_framework.http
def extract_phl_opa_properties(request):
    url = 'https://opendata-downloads.s3.amazonaws.com/opa_properties_public.csv'
    filename = DIRNAME / 'opa_properties.csv'
    blobname = 'opa_properties/opa_properties.csv'

    # Download the file
    response = requests.get(url)
    response.raise_for_status()
    with open(filename, 'wb') as f:
        f.write(response.content)
    print(f'Downloaded {filename}')

    # Upload the file to Cloud Storage
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(blobname)
    blob.upload_from_filename(filename)
    print(f'Uploaded {blobname} to {BUCKET_NAME}')

    return f'Downloaded to {filename} and uploaded to gs://{BUCKET_NAME}/{blobname}'