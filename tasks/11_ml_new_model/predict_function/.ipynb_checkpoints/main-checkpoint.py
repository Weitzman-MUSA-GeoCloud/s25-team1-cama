import os
import pathlib
import pickle
from dotenv import load_dotenv
import functions_framework
from flask import jsonify, make_response
from google.cloud import storage
from predict_function import predict_function

load_dotenv()

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

    if _model is None:
        bucket = storage_client.bucket(MODEL_BUCKET)
        blob = bucket.blob(f"models/{MODEL_FILENAME}")
        blob.download_to_filename(str(TMP_MODEL_PATH))
        with open(TMP_MODEL_PATH, "rb") as f:
            _model = pickle.load(f)

    payload = request.get_json(silent=True)
    if not payload or "jsonl_gcs_path" not in payload:
        return make_response(
            jsonify({"error": "必须提供 'jsonl_gcs_path'"}),
            400
        )

    gcs_uri = payload["jsonl_gcs_path"]
    prefix = f"gs://{DATA_BUCKET}/"
    blob_path = gcs_uri[len(prefix):]
    bucket = storage_client.bucket(DATA_BUCKET)
    bucket.blob(blob_path).download_to_filename(str(TMP_DATA_PATH))

    try:
        result_gdf = predict_function(_model, str(TMP_DATA_PATH))
    except Exception as e:
        return make_response(
            jsonify({"error": f"预测失败: {e}"}), 500
        )

    return make_response(
        result_gdf.to_json(),
        200,
        {"Content-Type": "application/json"}
    )
