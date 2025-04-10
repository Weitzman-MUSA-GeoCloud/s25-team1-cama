CREATE OR REPLACE EXTERNAL TABLE `musa5090s25-team1.source.opa_assessments` (
  `parcel_number` STRING,
  `year` STRING,
  `market_value` STRING,
  `taxable_land` STRING,
  `taxable_building` STRING,
  `exempt_land` STRING,
  `exempt_building` STRING,
  `objectid` STRING
)
OPTIONS (
  format = 'JSON',
  uris = ['gs://musa5090s25-team1-prepared_data/opa_assessments/*.jsonl']
)
