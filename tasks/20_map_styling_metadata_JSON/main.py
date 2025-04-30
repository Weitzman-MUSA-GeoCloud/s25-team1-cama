import dotenv
import json
from google.cloud import bigquery
from google.cloud import storage
import functions_framework
dotenv.load_dotenv()


@functions_framework.http
def create_mapstyle_metadata(request):
    bigquery_client = bigquery.Client()

    sql_file = './styling_metadata.sql'

    sql_query = sql_file.read()

    print('Starting query...')
    query_results = bigquery_client.query_and_wait(sql_query)
    rows = list(query_results)
    print('Finished query, hooray!')

    features = []
    for row in rows:
        features.append({
            'type': 'Feature',
            'properties': {
                'field': row['styling_metadata. field'],
                'min_value': row['styling_metadata. min_value'],
                'max_value': row['styling_metadata. max_value'],
                'quintiles': row['styling_metadata. quintiles']
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
    blob = bucket.blob('configs/mapstyle_metadata.json')
    blob.upload_from_string(myjson)
    print('Finished uploading.')

    return 'Success!'
