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

market_value_stats AS (
    SELECT
        'market_value' AS field,
        MIN(ly.market_value) AS min_value,
        MAX(ly.market_value) AS max_value,
        APPROX_QUANTILES(ly.market_value, 5) AS quintiles
    FROM lastyear AS ly
    WHERE ly.market_value > 1000
),

predicted_value_stats AS (
    SELECT
        'predicted_value' AS field,
        MIN(ty.predicted_value) AS min_value,
        MAX(ty.predicted_value) AS max_value,
        APPROX_QUANTILES(ty.predicted_value, 5) AS quintiles
    FROM thisyear AS ty
),

absolute_difference_stats AS (
    SELECT
        'absolute_difference' AS field,
        MIN(dif) AS min_value,
        MAX(dif) AS max_value,
        ARRAY_CONCAT(
            [MIN(dif)],
            [-2 * STDDEV(dif)],
            [-STDDEV(dif)],
            [STDDEV(dif)],
            [2 * STDDEV(dif)],
            [MAX(dif)]
        ) AS quintiles
    FROM bothyears
),

percent_difference_stats AS (
    SELECT
        'percent_difference' AS field,
        MIN(perc_dif) AS min_value,
        MAX(perc_dif) AS max_value,
        ARRAY_CONCAT(
            [MIN(perc_dif)],
            [-65.0],
            [-20.0],
            [20.0],
            [65.0],
            [MAX(perc_dif)]
        ) AS quintiles
    FROM bothyears
),

stats AS (
    SELECT field, min_value, max_value, quintiles FROM market_value_stats
    UNION ALL
    SELECT field, min_value, max_value, ARRAY(SELECT CAST(value AS NUMERIC) FROM UNNEST(quintiles) AS value) FROM predicted_value_stats
    UNION ALL
    SELECT field, min_value, max_value, ARRAY(SELECT CAST(value AS NUMERIC) FROM UNNEST(quintiles) AS value) FROM absolute_difference_stats
    UNION ALL
    SELECT field, min_value, max_value, ARRAY(SELECT CAST(value AS NUMERIC) FROM UNNEST(quintiles) AS value) FROM percent_difference_stats
)

SELECT
    *
FROM stats;
