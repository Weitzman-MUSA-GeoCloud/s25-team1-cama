SELECT
    CAST(lower_bound AS STRING) AS lower_bound,
    CAST(upper_bound AS STRING) AS upper_bound,
    CAST(property_count AS STRING) AS property_count
FROM `musa5090s25-team1.derived.current_assessment_bins`
ORDER BY lower_bound;