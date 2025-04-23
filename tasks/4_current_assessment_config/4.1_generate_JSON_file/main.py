import dotenv
dotenv.load_dotenv()

import json

from google.cloud import bigquery
from google.cloud import storage
import functions_framework

@functions_framework.http
def generate_assessment_chart_configs(request):
    bigquery_client = bigquery.Client()

    print('Starting query...')
    sql = '''
        SELECT
            tax_year,
            CAST(lower_bound AS STRING) AS lower_bound,
            CAST(upper_bound AS STRING) AS upper_bound,
            CAST(property_count AS STRING) AS property_count
        FROM `musa5090s25-team1.derived.tax_year_assessment_bins`
        ORDER BY tax_year, PARSE_NUMERIC(lower_bound)
    '''

    query_results = bigquery_client.query_and_wait(sql)
    rows = list(query_results)
    print('Finished query.')

    features = []
    for row in rows:
        features.append({
            'type': 'Feature',
            'properties': {
                'tax_year': row['tax_year'],
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
    blob = bucket.blob('configs/tax_year_assessment_bins.json')
    blob.upload_from_string(myjson)
    print('Finished uploading.')

    return 'Success!'
