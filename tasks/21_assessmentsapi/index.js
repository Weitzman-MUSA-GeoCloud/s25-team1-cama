import express from 'express';
import cors from 'cors';
import { BigQuery } from '@google-cloud/bigquery';

const app = express();
const bigquery = new BigQuery();

// Allow CORS from anywhere (or restrict later!)
app.use(cors());

app.get('/query-assessments', async (req, res) => {
  const propertyId = req.query.property_id;

  if (!propertyId) {
    return res.status(400).json({ error: 'Missing property_id' });
  }

  const query = `
    SELECT property_id, year, market_value
    FROM \`musa5090s25-team1.core.opa_assessments\`
    WHERE property_id = @propertyId
    ORDER BY year DESC
  `;

  const options = {
    query,
    params: { propertyId }
  };

  try {
    const [job] = await bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();
    res.json(rows);
  } catch (error) {
    console.error('BigQuery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('BigQuery API is running.');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));