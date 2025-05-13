import os
import logging
import functions_framework
from flask import jsonify, make_response
from google.cloud import storage
from check_function import check_function

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
DATA_BUCKET        = os.getenv("DATA_LAKE_BUCKET")
PREDICTIONS_OBJECT = os.getenv("PREDICTIONS_OBJECT")  # e.g. "predict/predict.json"

# Validate required environment variables at startup
if not DATA_BUCKET or not PREDICTIONS_OBJECT:
    logger.error("Required environment variables are missing: DATA_LAKE_BUCKET or PREDICTIONS_OBJECT")
    raise RuntimeError("Environment variables not set")

# Initialize GCS client and cache
storage_client = storage.Client()
_predictions_gdf = None

def _load_predictions():
    """Download and cache the predictions GeoDataFrame from GCS."""
    global _predictions_gdf
    if _predictions_gdf is None:
        logger.info("Downloading predictions from gs://%s/%s", DATA_BUCKET, PREDICTIONS_OBJECT)
        blob = storage_client.bucket(DATA_BUCKET).blob(PREDICTIONS_OBJECT)
        geojson_bytes = blob.download_as_string()
        import geopandas as gpd  # delayed import
        _predictions_gdf = gpd.read_file(geojson_bytes.decode("utf-8"))
        logger.info("Loaded %d prediction records", len(_predictions_gdf))
    return _predictions_gdf

@functions_framework.http
def check(request):
    """
    HTTP Cloud Function for address lookup.
    Expects JSON: {"address": "<US address>"}
    Returns JSON with nearest sale and predicted price plus distance.
    """
    # 1. Validate request payload
    payload = request.get_json(silent=True)
    if not payload or "address" not in payload:
        logger.error("Invalid payload: %s", payload)
        return make_response(
            jsonify({"status": "error", "message": "Must provide 'address' field"}),
            400
        )

    address = payload["address"]
    logger.info("Received address: %s", address)

    # 2. Load and cache predictions
    try:
        predictions_gdf = _load_predictions()
    except Exception as e:
        logger.exception("Failed to load prediction data")
        return make_response(
            jsonify({"status": "error", "message": f"Failed to load predictions: {e}"}),
            500
        )

    # 3. Run lookup logic
    try:
        result = check_function(address, predictions_gdf)
    except ValueError as ve:
        logger.warning("Client error during lookup: %s", ve, exc_info=True)
        return make_response(
            jsonify({"status": "error", "message": str(ve)}),
            400
        )
    except Exception:
        logger.exception("Unexpected server error during lookup")
        return make_response(
            jsonify({"status": "error", "message": "Internal server error"}),
            500
        )

    # 4. Return success
    return make_response(
        jsonify({"status": "success", "data": result}),
        200
    )