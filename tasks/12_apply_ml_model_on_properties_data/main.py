import pathlib
import functions_framework
from google.cloud import bigquery

DIR_NAME = pathlib.Path(__file__).parent
SQL_DIR_NAME = DIR_NAME / 'sql'  # Relative to this file

@functions_framework.http
def run_sql(request):
    sql_files = [
        'apply_ml_model.sql'
    ]

    bigquery_client = bigquery.Client()

    for sql_filename in sql_files:
        sql_path = SQL_DIR_NAME / sql_filename
        if not sql_path.exists() or not sql_path.is_file():
            return f'File {sql_path} not found', 404

        with open(sql_path, 'r', encoding='utf-8') as sql_file:
            sql_query = sql_file.read()

        bigquery_client.query_and_wait(sql_query)
        print(f'Ran the SQL file {sql_path}')

    return 'Ran all SQL files successfully'
