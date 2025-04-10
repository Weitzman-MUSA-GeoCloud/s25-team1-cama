CREATE OR REPLACE TABLE `musa5090s25-team1.derived.tax_year_assessment_bins` AS (
    WITH bins AS (
        SELECT
            assmnts.year AS tax_year,
            FLOOR(LOG(PARSE_NUMERIC(assmnts.market_value))) AS log_bins -- assessed values (market_value) were log transformed as to have a normal distribution on the chart to be made from this table
        FROM `musa5090s25-team1.source.opa_assessments` AS assmnts
        WHERE SAFE_CAST(assmnts.market_value AS NUMERIC) > 0
    )

    SELECT
        bins.tax_year, -- The year for which the tax assessment value applies
        bins.log_bins AS lower_bound, -- The minimum assessed value cutoff in the histogram bin
        bins.log_bins + 1 AS upper_bound, -- The maximum assessed value cutoff in the histogram bin
        COUNT(*) AS property_count -- The number of properties that fall between that min and max value
    FROM bins
    GROUP BY bins.tax_year, bins.log_bins
);
