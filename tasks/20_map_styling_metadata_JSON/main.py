import dotenv
dotenv.load_dotenv()

import json

from google.cloud import bigquery
from google.cloud import storage
import functions_framework

@functions_framework.http
def create_mapstyle_metadata(request):
    bigquery_client = bigquery.Client()

    print('Starting query...')
    sql = '''
        
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
    blob = bucket.blob('configs/mapstyle_metadata.json')
    blob.upload_from_string(myjson)
    print('Finished uploading.')

    return 'Success!'
