import os
import pathlib
import pickle
from dotenv import load_dotenv
import functions_framework
from flask import jsonify, make_response
from google.cloud import storage
from train_model_function import train_model_function

load_dotenv()

dirname = pathlib.Path(__file__).parent
BUCKET_NAME = os.getenv('DATA_LAKE_BUCKET')
MODEL_BUCKET_PATH = 'models'

@functions_framework.http
def train_model(request):

    request_json = request.get_json(silent=True)
    if not request_json or 'jsonl_gcs_path' not in request_json:
        return make_response(jsonify({'error': "must provide 'jsonl_gcs_path'"}), 400)

    gcs_path = request_json['jsonl_gcs_path']
    local_tmp = dirname / 'temp_data.jsonl'
    pickle_path = dirname / 'trained_model.pkl'

    os.system(f"gsutil cp {gcs_path} {local_tmp}")

    model = train_model_function(str(local_tmp))

    with open(pickle_path, 'wb') as f:
        pickle.dump(model, f)

    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(f"{MODEL_BUCKET_PATH}/{pickle_path.name}")
    blob.upload_from_filename(str(pickle_path))

    model_gcs_uri = f"gs://{BUCKET_NAME}/{MODEL_BUCKET_PATH}/{pickle_path.name}"
    return make_response(jsonify({'status': 'success', 'model_uri': model_gcs_uri}), 200)
