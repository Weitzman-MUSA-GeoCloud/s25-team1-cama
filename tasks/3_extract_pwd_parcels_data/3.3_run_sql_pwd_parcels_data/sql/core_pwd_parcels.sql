CREATE OR REPLACE TABLE `musa5090s25-team1.core.pwd_parcels` AS (
    SELECT
        parcel_id AS property_id,
        *
    FROM `musa5090s25-team1.source.pwd_parcels`
);
