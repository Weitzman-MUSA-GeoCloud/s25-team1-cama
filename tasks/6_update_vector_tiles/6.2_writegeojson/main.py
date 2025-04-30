import functions_framework
from google.cloud import bigquery
from google.cloud import storage
import geojson
import json
import shapely.wkt
from shapely.geometry import mapping

# Settings
PROJECT_ID = "musa5090s25-team1"
BQ_TABLE = "musa5090s25-team1.derived.pwd_parcels_with_predictions"
BUCKET_NAME = "musa5090s25-team1-temp_data"
OUTPUT_BLOB = "property_tile_info.geojson"

@functions_framework.http
def export_predictions_to_geojson(request):
    try:
        # Initialize clients
        bq_client = bigquery.Client()
        storage_client = storage.Client()

        # Query BigQuery (directly using geog column, which is WKT)
        query = f"""
            SELECT
                pwd_id,
                address,
                geog,  -- Already in WKT format
                opa_id,
                property_id,
                predicted_at,
                current_assessed_value,
                tax_year_assessed_value
            FROM `{BQ_TABLE}`
        """
        query_job = bq_client.query(query)
        rows = query_job.result()

        features = []
        for row in rows:
            try:
                # Parse WKT to shapely geometry
                shape = shapely.wkt.loads(row.geog)  # Directly parse WKT

                # Convert Shapely to GeoJSON format
                geometry = mapping(shape)

                # Build properties dictionary
                properties = {
                    "pwd_id": row.pwd_id,
                    "address": row.address,
                    "opa_id": row.opa_id,
                    "property_id": row.property_id,
                    "predicted_at": str(row.predicted_at),
                    "current_assessed_value": row.current_assessed_value,
                    "tax_year_assessed_value": row.tax_year_assessed_value
                }

                feature = geojson.Feature(geometry=geometry, properties=properties)
                features.append(feature)
            except Exception as feature_error:
                print(f"Error processing feature: {feature_error}")
                continue

        feature_collection = geojson.FeatureCollection(features)

        # Save GeoJSON to GCS
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(OUTPUT_BLOB)
        blob.upload_from_string(
            data=json.dumps(feature_collection),
            content_type="application/geo+json"
        )

        return f"Exported {len(features)} features to gs://{BUCKET_NAME}/{OUTPUT_BLOB}", 200

    except Exception as e:
        print(f"Error in export_predictions_to_geojson: {str(e)}")
        return f"Error: {str(e)}", 500