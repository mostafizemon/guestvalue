import fs from 'fs';
import https from 'https';

const envFile = fs.readFileSync('.env.local', 'utf8');
const envLines = envFile.split('\n');
const env = {};
for (const line of envLines) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
  }
}

const API_KEY = env.AIRTABLE_API_KEY;
const BASE_ID = env.AIRTABLE_BASE_ID;

const path = `/v0/${BASE_ID}/Experiences?maxRecords=3`;

const options = {
  hostname: 'api.airtable.com',
  port: 443,
  path: path,
  method: 'GET',
  family: 4,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(JSON.stringify(JSON.parse(data).records.map(r => r.fields), null, 2)));
});
req.on('error', e => console.error(e));
req.end();
