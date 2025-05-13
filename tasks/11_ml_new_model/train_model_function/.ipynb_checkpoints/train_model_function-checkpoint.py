import json
import pandas as pd
import geopandas as gpd
import numpy as np
from shapely.wkt import loads as wkt_loads
from sklearn.neighbors import NearestNeighbors
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split


def train_model_function(jsonl_path: str):
    k = 10
    test_size = 0.2
    random_state = 42

    with open(jsonl_path, 'r') as f:
        df = pd.DataFrame([json.loads(line) for line in f])

    if 'geog' in df.columns:
        df['geometry'] = df['geog'].apply(lambda x: wkt_loads(x) if isinstance(x, str) else None)
    gdf = gpd.GeoDataFrame(df, geometry='geometry', crs='EPSG:4326')

    cols = [
        'category_code', 'census_tract', 'depth',
        'exterior_condition', 'fireplaces', 'frontage', 'garage_spaces',
        'general_construction', 'interior_condition',
        'number_of_bathrooms', 'number_of_bedrooms', 'number_stories',
        'off_street_open', 'parcel_shape', 'quality_grade', 'sale_price',
        'topography', 'total_area', 'total_livable_area',
        'view_type', 'zoning', 'geometry'
    ]
    gdf = gdf[cols].copy()

    cat_cols = [
        'category_code', 'census_tract', 'exterior_condition',
        'general_construction', 'interior_condition',
        'parcel_shape', 'quality_grade', 'topography',
        'view_type', 'zoning'
    ]
    for c in cat_cols:
        gdf[c] = gdf[c].astype('category')

    num_cols = [
        'depth', 'fireplaces', 'frontage', 'garage_spaces',
        'number_of_bathrooms', 'number_of_bedrooms', 'number_stories',
        'off_street_open', 'sale_price', 'total_area', 'total_livable_area'
    ]
    for c in num_cols:
        gdf[c] = pd.to_numeric(gdf[c], errors='coerce')

    gdf = gdf.query("sale_price != 1 and sale_price <= 200e6 and sale_price >= 5e3").copy()
    gdf = gdf.replace(r'^\s*$', np.nan, regex=True).dropna().copy()
    gdf = gdf.query(
        "number_of_bathrooms <= 20 and "
        "number_of_bedrooms <= 40 and "
        "total_livable_area > 0 and total_livable_area <= 20000 and "
        "total_area > 0 and total_area <= 350000"
    ).copy()

    gdf['avg_price1'] = gdf['sale_price'] / gdf['total_area']
    gdf['avg_price2'] = gdf['sale_price'] / gdf['total_livable_area']
    gdf['sale_price'] = np.log(gdf['sale_price'])

    for c in cat_cols:
        gdf[c] = gdf[c].cat.remove_unused_categories()

    coords = np.vstack([gdf.geometry.y, gdf.geometry.x]).T
    nn = NearestNeighbors(n_neighbors=k+1, algorithm='ball_tree').fit(coords)
    _, idx = nn.kneighbors(coords)
    for val in ['avg_price1', 'avg_price2', 'sale_price']:
        gdf[f'lag_{val}'] = np.nanmean(gdf[val].values[idx[:, 1:]], axis=1)

    simplify_map = {
        'category_code': [11, 14, 16, 1, 2],
        'exterior_condition': [1, 2, 3, 4, 5, 6, 7],
        'general_construction': [1, 3, 5],
        'interior_condition': [0, 4, 5, 6, 7, 8],
        'parcel_shape': ['A', 'B', 'E'],
        'quality_grade': [0, 6, 'X+'],
        'topography': [0, 'B'],
        'view_type': [0, 'E'],
        'zoning': [
            'CA1','CMX1','CMX2','CMX2.5','CMX3','CMX4',
            'I1','I2','I3','ICMX','ICMX|SPPOA',
            'RM1','RM2','RM4','RMX2',
            'RSA2','RSA3','RSA4','RSA5','RSA5|RSA5','RSA6',
            'RSD1','RSD2','RSD3','RTA1'
        ]
    }
    for col, keep_list in simplify_map.items():
        keep_set = set(str(x) for x in keep_list)
        gdf[col] = (
            gdf[col]
               .astype(str)
               .apply(lambda x: x if x in keep_set else 'other')
               .astype('category')
        )

    for c in gdf.select_dtypes(include=['number']).columns:
        if c != 'sale_price':
            gdf[f'{c}_log'] = np.log1p(gdf[c])

    drop_cols = [
        'avg_price1', 'avg_price2',
        'avg_price1_log', 'avg_price2_log',
        'garage_spaces', 'off_street_open',
        'total_area', 'frontage_log',
        'lag_avg_price2_log'
    ]
    gdf = gdf.drop(columns=drop_cols, errors='ignore')

    X = pd.get_dummies(
        gdf.drop(columns=['geometry', 'sale_price']),
        drop_first=True
    )
    y = gdf['sale_price']
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    model = LinearRegression().fit(X_train, y_train)
    return model
