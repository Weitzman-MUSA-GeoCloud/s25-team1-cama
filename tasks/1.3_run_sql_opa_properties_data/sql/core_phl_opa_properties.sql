CREATE OR REPLACE TABLE `musa5090s25-team1.core.opa_properties` AS (
    SELECT
        parcel_number AS property_id,
        *
    FROM `musa5090s25-team1.source.opa_properties`
);