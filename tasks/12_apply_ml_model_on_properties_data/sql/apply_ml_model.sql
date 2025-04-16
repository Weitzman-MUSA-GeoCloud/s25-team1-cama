CREATE OR REPLACE TABLE `musa5090s25-team1.derived.current_assessments` AS
SELECT
  property_id,
  EXP(predicted_log_sale_price) AS predicted_value,
  CURRENT_TIMESTAMP() AS predicted_at
FROM ML.PREDICT(
  MODEL `musa5090s25-team1.derived.sale_price_log_model`,
  (
    SELECT
      property_id,
      census_tract,
      zip_code,
      CAST(number_of_bathrooms AS NUMERIC) AS number_of_bathrooms,
      CAST(number_of_bedrooms AS NUMERIC) AS number_of_bedrooms
    FROM `musa5090s25-team1.core.opa_properties`
    WHERE
      SAFE_CAST(number_of_bathrooms AS NUMERIC) IS NOT NULL AND
      SAFE_CAST(number_of_bedrooms AS NUMERIC) IS NOT NULL
  )
);