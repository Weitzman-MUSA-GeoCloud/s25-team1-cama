CREATE OR REPLACE MODEL `musa5090s25-team1.derived.sale_price_linear_regression`
OPTIONS(
  model_type = 'linear_reg',
  input_label_cols = ['sale_price']
) AS

SELECT
  CAST(sale_price AS NUMERIC) AS sale_price,
  census_tract,
  zip_code,
  CAST(number_of_bathrooms AS NUMERIC) AS number_of_bathrooms,
  CAST(number_of_bedrooms AS NUMERIC) AS number_of_bedrooms,
FROM
  `musa5090s25-team1.derived.current_assessments_model_training_data`
WHERE
  SAFE_CAST(number_of_bathrooms AS NUMERIC) IS NOT NULL AND
  SAFE_CAST(number_of_bedrooms AS NUMERIC) IS NOT NULL AND
  sale_price IS NOT NULL;