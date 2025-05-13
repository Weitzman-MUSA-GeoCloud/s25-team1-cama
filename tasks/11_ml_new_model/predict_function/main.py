import os
import pathlib
import pickle
import logging
import functions_framework
from flask import jsonify, make_response
from google.cloud import storage
from predict_function import predict_function

logging.basicConfig(level=logging.INFO)

DATA_BUCKET    = os.getenv("DATA_LAKE_BUCKET")
MODEL_BUCKET   = os.getenv("MODEL_BUCKET")
MODEL_FILENAME = os.getenv("MODEL_FILENAME")

TMP_MODEL_PATH = pathlib.Path("/tmp") / MODEL_FILENAME
TMP_DATA_PATH  = pathlib.Path("/tmp") / "data.jsonl"

storage_client = storage.Client()
_model = None  

@functions_framework.http
def predict(request):
    global _model

    if not DATA_BUCKET or not MODEL_BUCKET or not MODEL_FILENAME:
        logging.error("Missing required environment variables")
        return make_response(
            jsonify({"error": "Missing required environment variables"}), 500
        )

    if _model is None:
        try:
            bucket = storage_client.bucket(MODEL_BUCKET)
            blob = bucket.blob(f"models/{MODEL_FILENAME}")
            blob.download_to_filename(str(TMP_MODEL_PATH))
            with open(TMP_MODEL_PATH, "rb") as f:
                _model = pickle.load(f)
            logging.info("Model loaded from gs://%s/models/%s", MODEL_BUCKET, MODEL_FILENAME)
        except Exception as e:
            logging.exception("Failed to load model")
            return make_response(
                jsonify({"error": f"Model load error: {e}"}), 500
            )

    payload = request.get_json(silent=True)
    if not payload or "jsonl_gcs_path" not in payload:
        return make_response(
            jsonify({"error": "must provide 'jsonl_gcs_path'"}),
            400
        )

    gcs_uri = payload["jsonl_gcs_path"]
    prefix = f"gs://{DATA_BUCKET}/"
    if not gcs_uri.startswith(prefix):
        logging.error("Invalid data GCS URI: %s", gcs_uri)
        return make_response(
            jsonify({"error": f"jsonl_gcs_path must start with {prefix}"}),
            400
        )
    blob_path = gcs_uri[len(prefix):]
    try:
        bucket = storage_client.bucket(DATA_BUCKET)
        bucket.blob(blob_path).download_to_filename(str(TMP_DATA_PATH))
        logging.info("Downloaded data to %s", TMP_DATA_PATH)
    except Exception as e:
        logging.exception("Failed to download data")
        return make_response(
            jsonify({"error": f"Data download error: {e}"}), 500
        )

    try:
        result_gdf = predict_function(_model, str(TMP_DATA_PATH))
    except Exception as e:
        logging.exception("Prediction failed")
        return make_response(
            jsonify({"error": f"Prediction error: {e}"}), 500
        )

    result_json = result_gdf.to_json()

    try:
        out_bucket = storage_client.bucket(DATA_BUCKET)
        out_blob = out_bucket.blob("predict/predict.json")
        out_blob.upload_from_string(result_json, content_type="application/json")
        logging.info("Uploaded predictions to gs://%s/predict/predict.json", DATA_BUCKET)
    except Exception as e:
        logging.exception("Failed to upload predictions")
        return make_response(
            jsonify({"error": f"Upload predictions error: {e}"}), 500
        )

    return make_response(
        jsonify({
            "status": "success",
            "predictions_uri": f"gs://{DATA_BUCKET}/predict/predict.json"
        }),
        200
    )
