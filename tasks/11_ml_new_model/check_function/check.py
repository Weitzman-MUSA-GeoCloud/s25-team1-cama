import os
import json
import logging
from shapely.geometry import Point
import pandas as pd
import geopandas as gpd
import numpy as np
from geopy.geocoders import Nominatim
from sklearn.neighbors import BallTree
from google.cloud import storage

logging.basicConfig(level=logging.INFO)

def check_function(address: str) -> dict:
    """
    Given a US address, geocode it and find the nearest point in the predictions JSON stored in GCS.
    Returns a dict with original address, geocoded coords, nearest sale and predicted prices, and distance in meters.
    """
    # 1. Geocode the address
    geolocator = Nominatim(user_agent="check_function")
    location = geolocator.geocode(address)
    if location is None:
        logging.error("Geocoding failed for address: %s", address)
        raise ValueError(f"Could not geocode address: {address}")

    query_point = Point(location.longitude, location.latitude)
    logging.info("Geocoded address '%s' to (%f, %f)", address, query_point.x, query_point.y)

    # 2. Load predictions GeoJSON from GCS
    bucket_name = os.getenv("DATA_LAKE_BUCKET")
    predictions_object = os.getenv("PREDICTIONS_OBJECT")  # e.g., 'predict/predict.json'
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(predictions_object)
    geojson_str = blob.download_as_string()
    data = json.loads(geojson_str)

    # 3. Construct GeoDataFrame
    gdf = gpd.GeoDataFrame.from_features(data.get('features', []))
    if gdf.empty:
        raise ValueError("No prediction features found in the JSON file")

    # 4. Prepare for nearest neighbor search using Haversine
    # Extract lat/lon arrays
    coords = np.vstack([gdf.geometry.y.values, gdf.geometry.x.values]).T
    # Build BallTree on radians
    tree = BallTree(np.deg2rad(coords), metric='haversine')

    # Query the nearest neighbor
    dist_rad, idx = tree.query([[query_point.y, query_point.x]], k=1)
    nearest_idx = idx[0][0]
    distance_m = dist_rad[0][0] * 6371000  # Earth radius in meters
    nearest = gdf.iloc[nearest_idx]

    # 5. Prepare result
    result = {
        'address': address,
        'latitude': query_point.y,
        'longitude': query_point.x,
        'nearest_sale_price': nearest.get('sale_price'),
        'nearest_predicted_price': nearest.get('predicted_price'),
        'distance_meters': distance_m
    }
    logging.info("Nearest point at index %d, distance %f m", nearest_idx, distance_m)
    return result
