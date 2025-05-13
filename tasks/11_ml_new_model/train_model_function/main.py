import os
import uuid
import logging
import pickle
import functions_framework
from flask import jsonify, make_response
from google.cloud import storage
from train_model_function import train_model_function

logging.basicConfig(level=logging.INFO)

BUCKET_NAME = os.getenv('DATA_LAKE_BUCKET')
MODEL_BUCKET_PATH = os.getenv('MODEL_BUCKET_PATH', 'models')
MODEL_FILENAME = 'model.pkl'

storage_client = storage.Client()

@functions_framework.http
def train_model(request):
    req = request.get_json(silent=True)
    if not req or 'jsonl_gcs_path' not in req:
        return make_response(jsonify({'error': "must provide 'jsonl_gcs_path'"}), 400)

    gcs_uri = req['jsonl_gcs_path']  # e.g. gs://bucket/path/to/file.jsonl
    expected_prefix = f"gs://{BUCKET_NAME}/"
    if not gcs_uri.startswith(expected_prefix):
        logging.error("Invalid GCS URI: %s", gcs_uri)
        return make_response(jsonify({'error': f"jsonl_gcs_path must start with {expected_prefix}"}), 400)

    blob_path = gcs_uri[len(expected_prefix):]
    tmp_jsonl = f"/tmp/{uuid.uuid4()}.jsonl"
    tmp_model = f"/tmp/{MODEL_FILENAME}"

    try:
        bucket = storage_client.bucket(BUCKET_NAME)
        bucket.blob(blob_path).download_to_filename(tmp_jsonl)
        logging.info("Downloaded JSONL to %s", tmp_jsonl)
    except Exception:
        logging.exception("Failed to download JSONL from GCS")
        return make_response(jsonify({'error': 'download failed'}), 500)

    try:
        model = train_model_function(tmp_jsonl)
        logging.info("Model training completed")
    except Exception:
        logging.exception("Model training failed")
        return make_response(jsonify({'error': 'training failed'}), 500)

    try:
        with open(tmp_model, 'wb') as f:
            pickle.dump(model, f)
        dest_blob = f"{MODEL_BUCKET_PATH}/{MODEL_FILENAME}"
        bucket.blob(dest_blob).upload_from_filename(tmp_model)
        logging.info("Uploaded model to gs://%s/%s", BUCKET_NAME, dest_blob)
    except Exception:
        logging.exception("Failed to upload model to GCS")
        return make_response(jsonify({'error': 'upload failed'}), 500)

    for path in (tmp_jsonl, tmp_model):
        try:
            os.remove(path)
        except OSError:
            pass

    model_uri = f"gs://{BUCKET_NAME}/{dest_blob}"
    return make_response(jsonify({'status': 'success', 'model_uri': model_uri}), 200)