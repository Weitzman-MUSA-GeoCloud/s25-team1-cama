CREATE OR REPLACE EXTERNAL TABLE `musa5090s25-team1.source.pwd_parcels` (
  
)
OPTIONS (
  format = 'JSON',
  uris = ['gs://musa5090s25-team1-prepared_data/pwd_parcels/*.jsonl']
)