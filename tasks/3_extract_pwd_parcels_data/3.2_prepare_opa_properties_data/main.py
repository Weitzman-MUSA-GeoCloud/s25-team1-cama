from dotenv import load_dotenv
load_dotenv()

import json
import os
import pathlib

import functions_framework
from shapely.geometry import shape, mapping
from google.cloud import storage

DIRNAME = pathlib.Path(__file__).parent


@functions_framework.http
def prepare_pwd_parcels(request):
    print('Preparing PWD Parcels data (GeoJSON)...')

    raw_filename = DIRNAME / 'pwd_parcels.geojson'
    prepared_filename = DIRNAME / 'data.jsonl'

    # Get bucket names from environment variables
    source_bucket_name = os.getenv('DATA_LAKE_BUCKET')
    destination_bucket_name = os.getenv('DESTINATION_DATA_LAKE_BUCKET')

    storage_client = storage.Client()

    # Download the data from the source bucket
    source_bucket = storage_client.bucket(source_bucket_name)
    raw_blobname = 'pwd_parcels/pwd_parcels.geojson'
    blob = source_bucket.blob(raw_blobname)
    blob.download_to_filename(raw_filename)
    print(f'Downloaded to {raw_filename}')

    # Load and process the GeoJSON data
    with open(raw_filename, 'r') as f:
        geojson = json.load(f)

    features = geojson['features']

    with open(prepared_filename, 'w') as f:
        for feature in features:
            properties = feature.get('properties', {})
            geometry = feature.get('geometry')

            # Use full GeoJSON geometry or WKT if you prefer
            if geometry:
                # Optional: convert to WKT
                geom = shape(geometry)
                properties['geog'] = geom.wkt  # or use json.dumps(geometry) for raw GeoJSON geometry
            else:
                properties['geog'] = None

            f.write(json.dumps(properties) + '\n')

    print(f'Processed data into {prepared_filename}')

    # Upload the processed file to the destination bucket
    destination_bucket = storage_client.bucket(destination_bucket_name)
    prepared_blobname = 'pwd_parcels/data.jsonl'
    blob = destination_bucket.blob(prepared_blobname)
    blob.upload_from_filename(prepared_filename)
    print(f'Uploaded to {prepared_blobname}')

    return f'Processed data into {prepared_filename} and uploaded to gs://{destination_bucket_name}/{prepared_blobname}'