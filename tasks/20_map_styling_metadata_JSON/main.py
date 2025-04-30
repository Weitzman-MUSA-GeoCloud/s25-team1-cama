import dotenv
import json
from google.cloud import bigquery
from google.cloud import storage
import functions_framework
dotenv.load_dotenv()


DIR_NAME = pathlib.Path(__file__).parent
SQL_DIR_NAME = DIR_NAME / 'sql'  # Relative to this file

@functions_framework.http
def create_mapstyle_metadata(request):
    
    sql_files = [
        'styling_metadata.sql'
    ]

    bigquery_client = bigquery.Client()

    print('Starting current assessment query...')
    for sql_filename in sql_files:
        sql_path = SQL_DIR_NAME / sql_filename
        if not sql_path.exists() or not sql_path.is_file():
            return f'File {sql_path} not found', 404

        with open(sql_path, 'r', encoding='utf-8') as sql_file:
            sql_query = sql_file.read()

        query_results = bigquery_client.query_and_wait(sql_query)
        print(f'Ran the SQL file {sql_path}!')
    
    rows = list(query_results)

    features = []
    for row in rows:
        features.append({
            'type': 'Feature',
            'properties': {
                'field': row['field'],
                'min': row['min_value'],
                'max': row['max_value'],
                'break_points': row['quintiles']
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
