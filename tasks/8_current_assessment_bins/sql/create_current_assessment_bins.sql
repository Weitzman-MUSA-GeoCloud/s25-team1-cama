CREATE OR REPLACE TABLE `musa5090s25-team1.derived.current_assessment_bins` AS (
    WITH bins AS (
        SELECT
            FLOOR(LOG(assmnts.predicted_value)) AS log_bins
        FROM `musa5090s25-team1.derived.current_assessments` AS assmnts
        WHERE assmnts.predicted_value > 0
    )

    SELECT
        bins.log_bins AS lower_bound, -- The minimum assessed value cutoff in the histogram bin
        bins.log_bins + 1 AS upper_bound, -- The maximum assessed value cutoff in the histogram bin
        COUNT(*) AS property_count -- The number of properties that fall between that min and max value
    FROM bins
    GROUP BY bins.log_bins
    ORDER BY bins.log_bins
);