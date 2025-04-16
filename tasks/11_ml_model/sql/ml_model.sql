CREATE OR REPLACE MODEL `musa5090s25-team1.derived.sale_price_log_model`
OPTIONS(
  model_type = 'linear_reg',
  input_label_cols = ['log_sale_price']
) AS

SELECT
  LOG(CAST(sale_price AS NUMERIC)) AS log_sale_price,
  zip_code,
  CAST(number_of_bathrooms AS NUMERIC) AS number_of_bathrooms,
  CAST(number_of_bedrooms AS NUMERIC) AS number_of_bedrooms
FROM
  `musa5090s25-team1.derived.current_assessments_model_training_data`
WHERE
  SAFE_CAST(number_of_bathrooms AS NUMERIC) IS NOT NULL AND
  SAFE_CAST(number_of_bedrooms AS NUMERIC) IS NOT NULL AND
  SAFE_CAST(sale_price AS NUMERIC) IS NOT NULL AND
  CAST(sale_price AS NUMERIC) > 0;