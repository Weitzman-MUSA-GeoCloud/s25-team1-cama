from dotenv import load_dotenv
load_dotenv()

import csv
import json
import os
import pathlib

import pyproj
from shapely import wkt
import functions_framework
from google.cloud import storage

DIRNAME = pathlib.Path(__file__).parent


@functions_framework.http
def prepare_phl_opa_assessments(request):
    print('Preparing OPA assessments data...')

    raw_filename = DIRNAME / 'opa_assessments.csv'
    prepared_filename = DIRNAME / 'data.jsonl'

    # Get the source and destination bucket names from environment variables
    source_bucket_name = os.getenv('DATA_LAKE_BUCKET')
    destination_bucket_name = os.getenv('DESTINATION_DATA_LAKE_BUCKET')

    storage_client = storage.Client()

    # Download the data from the source bucket
    source_bucket = storage_client.bucket(source_bucket_name)
    raw_blobname = 'opa_assessments/opa_assessments.csv'
    blob = source_bucket.blob(raw_blobname)
    blob.download_to_filename(raw_filename)
    print(f'Downloaded to {raw_filename}')

    # Load the data from the CSV file
    with open(raw_filename, 'r') as f:
        reader = csv.DictReader(f)
        data = list(reader)

    # Set up the projection
    #transformer = pyproj.Transformer.from_proj('epsg:2272', 'epsg:4326')

    # Write the data to a JSONL file
    with open(prepared_filename, 'w') as f:
        for i, row in enumerate(data):
        #     geom_wkt = row.pop('shape').split(';')[1]
        #     if geom_wkt == 'POINT EMPTY':
        #         row['geog'] = None
        #     else:
        #         geom = wkt.loads(geom_wkt)
        #         x, y = transformer.transform(geom.x, geom.y)
        #         row['geog'] = f'POINT({x} {y})'
            f.write(json.dumps(row) + '\n')

    print(f'Processed data into {prepared_filename}')

    # Upload the prepared data to the destination bucket
    destination_bucket = storage_client.bucket(destination_bucket_name)
    prepared_blobname = 'opa_assessments/data.jsonl'
    blob = destination_bucket.blob(prepared_blobname)
    blob.upload_from_filename(prepared_filename)
    print(f'Uploaded to {prepared_blobname}')

    return f'Processed data into {prepared_filename} and uploaded to gs://{destination_bucket_name}/{prepared_blobname}'
