import dotenv
import json
from google.cloud import bigquery
from google.cloud import storage
import functions_framework
dotenv.load_dotenv()


@functions_framework.http
def create_mapstyle_metadata(request):
    bigquery_client = bigquery.Client()

    # Current Assessed Values
    print('Starting current assessment query...')
    sql = '''
        SELECT
            APPROX_QUANTILES(predicted_value, 5) AS thisyear_quin
        FROM `musa5090s25-team1.derived.current_assessments`
    '''

    query_results = bigquery_client.query_and_wait(sql)
    # rows = list(query_results)
    print('Finished current assessment query.')

    features = []
    features.append({
        'type': 'Feature',
        'current_assessed_value': {
            'min': query_results[0],
            'max': query_results[-1],
            'breakpoints': query_results
        }
    })
    print('Added current assessment data to feature collection.')


    # Last year's Assessed Values
    print('Starting previous assessment query...')
    sql = '''
        SELECT
            APPROX_QUANTILES(PARSE_NUMERIC(market_value), 5) AS lastyear_quin
        FROM `musa5090s25-team1.source.opa_assessments`
        WHERE year = '2024' AND market_value > 1000
    '''

    query_results = bigquery_client.query_and_wait(sql)
    # rows = list(query_results)
    print('Finished previous assessment query.')

    features.append({
        'type': 'Feature',
        'tax_year_assessed_value': {
            'min': query_results[0],
            'max': query_results[-1],
            'breakpoints': query_results
        }
    })
    print('Added previous assessment data to feature collection.')


    # Absolute Difference (between last year's and current assessed values)
    print('Starting absolute difference query...')
    sql = '''
        WITH lastyear AS (
            SELECT
                parcel_number,
                PARSE_NUMERIC(market_value) AS market_value
            FROM `musa5090s25-team1.source.opa_assessments`
            WHERE year = '2024'
        ),

        thisyear AS (
            SELECT
                property_id,
                predicted_value
            FROM `musa5090s25-team1.derived.current_assessments`
        ),

        bothyears AS (
          SELECT
              ly.parcel_number,
              ly.market_value,
              ty.predicted_value
              ROUND(ty.predicted_value - ly.market_value) AS dif,
              ROUND(100*(ty.predicted_value - ly.market_value)/ly.market_value, 2) AS perc_dif
          FROM thisyear AS ty
          JOIN lastyear AS ly 
              ON ty.property_id = ly.parcel_number
        )

        SELECT
            APPROX_QUANTILES(ABS(dif), 3) AS absdif_quin
        FROM bothyears
    '''

    query_results = bigquery_client.query_and_wait(sql)
    # rows = list(query_results)
    print('Finished absolute difference query.')

    features.append({
        'type': 'Feature',
        'tax_year_assessed_value': {
            'min': query_results[0],
            'max': query_results[-1],
            'breakpoints': query_results
        }
    })
    print('Added absolute difference data to feature collection.')


    # Percent Difference (between last year's and current assessed values)
    print('Starting percent difference query...')
    sql = '''
        WITH lastyear AS (
            SELECT
                parcel_number,
                PARSE_NUMERIC(market_value) AS market_value
            FROM `musa5090s25-team1.source.opa_assessments`
            WHERE year = '2024'
        ),

        thisyear AS (
            SELECT
                property_id,
                predicted_value
            FROM `musa5090s25-team1.derived.current_assessments`
        ),

        bothyears AS (
          SELECT
              ly.parcel_number,
              ly.market_value,
              ty.predicted_value
              ROUND(ty.predicted_value - ly.market_value) AS dif,
              ROUND(100*(ty.predicted_value - ly.market_value)/ly.market_value, 2) AS perc_dif
          FROM thisyear AS ty
          JOIN lastyear AS ly 
              ON ty.property_id = ly.parcel_number
        )

        SELECT
            APPROX_QUANTILES(ABS(perc_dif), 3) AS percdif_quin
        FROM bothyears
    '''

    query_results = bigquery_client.query_and_wait(sql)
    # rows = list(query_results)
    print('Finished percent difference query.')

    features.append({
        'type': 'Feature',
        'tax_year_assessed_value': {
            'min': -query_results[-1],
            'max': query_results[-1],
            'breakpoints': list(-query_results[-1], -query_results[-2], query_results[-3], query_results)
        }
    })
    print('Added percent difference data to feature collection.')

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
