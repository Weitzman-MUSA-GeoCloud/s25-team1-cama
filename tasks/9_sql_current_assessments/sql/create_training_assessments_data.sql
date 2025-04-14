CREATE OR REPLACE TABLE `musa5090s25-team1.derived.current_assessments_model_training_data` AS (
    SELECT 
        CAST(sale_price AS NUMERIC) AS sale_price,
        IFNULL(NULLIF(basements, ""), "NA") AS basements,
        IFNULL(NULLIF(building_code, ""), "NA") AS building_code,
        IFNULL(NULLIF(census_tract, ""), "NA") AS census_tract,
        IFNULL(NULLIF(exterior_condition, ""), "NA") AS exterior_condition,
        IFNULL(NULLIF(zip_code, ""), "NA") AS zip_code,
        IFNULL(NULLIF(zoning, ""), "NA") AS zoning,
        IFNULL(NULLIF(number_of_bathrooms, ""), "NA") AS number_of_bathrooms,
        IFNULL(NULLIF(number_of_bedrooms, ""), "NA") AS number_of_bedrooms,
        IFNULL(NULLIF(number_stories, ""), "NA") AS number_stories,
        IFNULL(NULLIF(total_area, ""), "NA") AS total_area,
        IFNULL(NULLIF(year_built, ""), "NA") AS year_built
    FROM (
        SELECT *,
               ROW_NUMBER() OVER (
                   PARTITION BY property_id 
                   ORDER BY sale_date DESC
               ) AS row_num
        FROM `musa5090s25-team1.core.opa_properties`
        WHERE sale_price IS NOT NULL 
          AND sale_price != ""
          AND SAFE_CAST(sale_price AS NUMERIC) > 1000
    )
    WHERE row_num = 1
);