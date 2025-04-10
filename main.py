import pathlib
import functions_framework
from google.cloud import bigquery

DIR_NAME = pathlib.Path(__file__).parent
SQL_DIR_NAME = DIR_NAME / 'sql'

@functions_framework.http
def create_tax_year_assessments(request):
    # Read the SQL file specified in the request
    sql_path = SQL_DIR_NAME / request.args.get('sql')
    
    bigquery_client = bigquery.Client()
    print('Starting query...')
    
    # Check that file exists, otherwise return an error message
    if not sql_path.exists() or not sql_path.is_file():
        return f'File {sql_path} not found', 404
    
    # Read SQL file
    with open(sql_path, 'r', encoding='utf-8') as sql_file:
        sql_query = sql_file.read()

    # Run the SQL query
    bigquery_client.query_and_wait(sql_query)
    print(f'Ran the SQL file {sql_path} to create tax year assessments table.')

    return f'Success!'
