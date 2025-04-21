import dotenv
dotenv.load_dotenv()

import json

from google.cloud import bigquery
from google.cloud import storage
import functions_framework

@functions_framework.http
def generate_current_assessment_chart_configs(request):
    bigquery_client = bigquery.Client()

    print('Starting query...')
    sql = '''
        SELECT
            CAST(lower_bound AS STRING) AS lower_bound,
            CAST(upper_bound AS STRING) AS upper_bound,
            CAST(property_count AS STRING) AS property_count
        FROM `musa5090s25-team1.derived.current_assessment_bins`
        ORDER BY lower_bound
    '''

    query_results = bigquery_client.query_and_wait(sql)
    rows = list(query_results)
    print('Finished query.')

    features = []
    for row in rows:
        features.append({
            'type': 'Feature',
            'properties': {
                'lower_bound': row['lower_bound'],
                'upper_bound': row['upper_bound'],
                'property_count': row['property_count']
            }
        })

    feature_collection = {
        'type': 'FeatureCollection',
        'features': features
    }

    myjson = json.dumps(feature_collection)

    print('Uploading to GCS...')
    storage_client = storage.Client()
    bucket = storage_client.bucket('musa5090s25-team1-public')
    blob = bucket.blob('configs/current_assessment_bins.json')
    blob.upload_from_string(myjson)
    print('Finished uploading.')

    return 'Success!'

# from dotenv import load_dotenv
# load_dotenv()

# # import csv
# # import json
# import os
# # import pathlib

# import functions_framework
# from google.cloud import bigquery

# @functions_framework.http
# def generate_assessment_chart_json(request):
#     print('Creating JSON file of current tax year assessment distribution chart data...')

#     bigquery_client = bigquery.Client()
    
#     # Get the public bucket names from environment variables
#     public_bucket_name = os.getenv('DATA_LAKE_PUBLIC')

#     project = "musa5090s25-team1"
#     dataset_id = "derived"
#     table_name = "tax_year_assessment_bins"
#     JSON_destination = "/configs/current_assessment_bins.json"

#     destination_uri = "gs://{}/{}".format(public_bucket_name, JSON_destination)
#     dataset_ref = bigquery.DatasetReference(project, dataset_id)
#     table_ref = dataset_ref.table(table_name)
#     job_config = bigquery.job.ExtractJobConfig()
#     job_config.destination_format = bigquery.DestinationFormat.NEWLINE_DELIMITED_JSON

#     extract_job = bigquery_client.extract_table(
#         table_ref,
#         destination_uri,
#         job_config=job_config,
#         # Location must match that of the source table.
#         location="us-east4",  # was previously "US"
#     )  # API request
#     extract_job.result()  # Waits for job to complete.

#     return f'Processed from {table_name} and uploaded (as a JSON file) to gs://{public_bucket_name}/{JSON_destination}'
