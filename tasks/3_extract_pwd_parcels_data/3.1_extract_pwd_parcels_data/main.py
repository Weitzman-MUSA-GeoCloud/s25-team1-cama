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
def extract_pwd_parcels(request):
    url = 'https://opendata.arcgis.com/api/v3/datasets/84baed491de44f539889f2af178ad85c_0/downloads/data?format=csv&spatialRefId=4326&where=1%3D1'
    filename = DIRNAME / 'pwd_parcels.csv'
    blobname = 'pwd_parcels/pwd_parcels.csv'

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