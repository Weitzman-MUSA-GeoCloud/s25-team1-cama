CREATE OR REPLACE TABLE `musa5090s25-team1.derived.pwd_parcels_with_predictions` AS
WITH joined_parcels AS (
  SELECT 
    p.property_id AS pwd_id,
    p.address,
    p.geog,
    o.property_id AS opa_id
  FROM 
    `musa5090s25-team1.core.pwd_parcels` p
  INNER JOIN 
    `musa5090s25-team1.core.opa_properties` o
  ON 
    LOWER(TRIM(p.address)) = LOWER(TRIM(o.location))
)

SELECT 
  j.pwd_id,
  j.address,
  j.geog,
  j.opa_id,
  ca.property_id,
  ca.predicted_at,
  ca.predicted_value AS current_assessed_value,
  oa.market_value AS tax_year_assessed_value
FROM 
  joined_parcels j
INNER JOIN 
  `musa5090s25-team1.derived.current_assessments` ca
ON 
  j.opa_id = ca.property_id
INNER JOIN 
  `musa5090s25-team1.core.opa_assessments` oa
ON 
  j.opa_id = oa.property_id
WHERE 
  oa.year = '2024'
;