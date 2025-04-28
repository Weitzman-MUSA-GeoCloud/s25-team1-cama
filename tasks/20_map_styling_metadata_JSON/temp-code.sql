WITH lastyear AS (
    SELECT
        parcel_number,
        PARSE_NUMERIC(market_value) AS market_value
    FROM `musa5090s25-team1.source.opa_assessments`
    WHERE year = '2024'
),

thisyear AS (
    SELECT
        property_id,
        predicted_value
    FROM `musa5090s25-team1.derived.current_assessments`
),

bothyears AS (
    SELECT
        ly.parcel_number,
        ly.market_value,
        ty.predicted_value,
        CASE ly.market_value
            WHEN 0 THEN NULL
            ELSE ROUND(ty.predicted_value - ly.market_value, 2)
        END AS dif,
        CASE ly.market_value
            WHEN 0 THEN NULL
            ELSE ROUND(100 * (ty.predicted_value - ly.market_value) / ly.market_value, 2)
        END AS perc_dif
    FROM thisyear AS ty
    JOIN lastyear AS ly
        ON ty.property_id = ly.parcel_number
),

lastyear_quin AS (
    SELECT
        APPROX_QUANTILES(ly.market_value, 5) AS lastyear_quin
    FROM lastyear AS ly
    WHERE ly.market_value > 1000
),

thisyear_quin AS (
    SELECT
        APPROX_QUANTILES(ty.predicted_value, 5) AS thisyear_quin
    FROM thisyear AS ty
),

abs_dif AS (
    SELECT
        APPROX_QUANTILES(dif, 5) AS absdif_quin
    FROM bothyears
),

perc_dif AS (
    SELECT
        APPROX_QUANTILES(perc_dif, 5) AS percdif_quin
    FROM bothyears
)
-- ,
-- all_quin AS (
--     SELECT thisyear_quin FROM thisyear_quin UNION ALL
--     SELECT lastyear_quin FROM lastyear_quin UNION ALL
--     SELECT absdif_quin FROM abs_dif UNION ALL
--     SELECT percdif_quin FROM perc_dif
-- )
SELECT * FROM thisyear_quin;
