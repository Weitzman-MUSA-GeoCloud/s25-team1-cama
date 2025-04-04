CREATE OR REPLACE EXTERNAL TABLE `musa5090s25-team1.source.pwd_parcels` (
  `objectid` STRING,
  `parcelid` STRING,
  `tencode` STRING,
  `address` STRING,
  `owner1` STRING,
  `owner2` STRING,
  `bldg_code` STRING,
  `bldg_desc` STRING,
  `brt_id` STRING,
  `num_brt` STRING,
  `num_accounts` STRING,
  `gross_area` STRING,
  `pin` STRING,
  `parcel_id` STRING,
  `shape__area` STRING,
  `shape__length` STRING,
  `geog` STRING
)
OPTIONS (
  format = 'JSON',
  uris = ['gs://musa5090s25-team1-prepared_data/pwd_parcels/*.jsonl']
);
