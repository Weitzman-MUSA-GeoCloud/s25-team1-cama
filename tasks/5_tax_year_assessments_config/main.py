from dotenv import load_dotenv
load_dotenv()

# import csv
# import json
import os
# import pathlib

import functions_framework
from google.cloud import bigquery

@functions_framework.http
def generate_assessment_chart_configs(request):
    print('Creating JSON file of current tax year assessment distribution chart data...')

    bigquery_client = bigquery.Client()
    
    # Get the public bucket names from environment variables
    public_bucket_name = os.getenv('DATA_LAKE_PUBLIC')

    project = "musa5090s25-team1"
    dataset_id = "derived"
    table_name = "tax_year_assessment_bins"
    JSON_destination = "/configs/current_assessment_bins.json"

    destination_uri = "gs://{}/{}".format(public_bucket_name, JSON_destination)
    dataset_ref = bigquery.DatasetReference(project, dataset_id)
    table_ref = dataset_ref.table(table_name)
    job_config = bigquery.job.ExtractJobConfig()
    job_config.destination_format = bigquery.DestinationFormat.NEWLINE_DELIMITED_JSON

    extract_job = bigquery_client.extract_table(
        table_ref,
        destination_uri,
        job_config=job_config,
        # Location must match that of the source table.
        location="us-east4",  # was previously "US"
    )  # API request
    extract_job.result()  # Waits for job to complete.

    return f'Processed from {table_name} and uploaded (as a JSON file) to gs://{public_bucket_name}/{JSON_destination}'
