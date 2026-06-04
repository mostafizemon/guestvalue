/**
 * Custom Airtable client using Node's native https module.
 * This bypasses node-fetch (used by the airtable SDK) which has ETIMEDOUT
 * issues with IPv6 fallback on Node 18+ environments.
 */
import https from 'https';

const API_KEY = process.env.AIRTABLE_API_KEY!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const BASE_URL = 'api.airtable.com';

function httpsRequest(path: string, method = 'GET', body?: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : undefined;

    const options: https.RequestOptions = {
      hostname: BASE_URL,
      port: 443,
      path,
      method,
      family: 4, // Force IPv4 to avoid ETIMEDOUT on IPv6-unreachable networks
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
      timeout: 15000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error(`Failed to parse Airtable response: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Airtable request timed out after 15s'));
    });
    req.on('error', reject);

    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function encodeQuery(params: Record<string, any>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((v, i) => parts.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(v)}`));
    } else if (value !== undefined && value !== null) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }
  return parts.length ? '?' + parts.join('&') : '';
}

/** Wraps a raw Airtable record to add a .get() compatibility shim. */
function wrapRecord(raw: any) {
  return {
    id: raw.id,
    createdTime: raw.createdTime,
    fields: raw.fields,
    get(fieldName: string) {
      return raw.fields?.[fieldName];
    },
  };
}

/** Fetch all records from a table (handles Airtable pagination automatically). */
async function selectAll(table: string, query: Record<string, any> = {}): Promise<any[]> {
  const records: any[] = [];
  let offset: string | undefined;

  do {
    const params: Record<string, any> = { ...query };
    if (offset) params.offset = offset;

    // Encode sort array as sort[0][field], sort[0][direction] etc.
    const sortArray = params.sort as Array<{ field: string; direction?: string }> | undefined;
    delete params.sort;

    const sortParts: string[] = [];
    if (sortArray) {
      sortArray.forEach((s, i) => {
        sortParts.push(
          `${encodeURIComponent(`sort[${i}][field]`)}=${encodeURIComponent(s.field)}`
        );
        if (s.direction) {
          sortParts.push(
            `${encodeURIComponent(`sort[${i}][direction]`)}=${encodeURIComponent(s.direction)}`
          );
        }
      });
    }

    const queryStr = encodeQuery(params);
    const sortStr = sortParts.length ? (queryStr ? '&' : '?') + sortParts.join('&') : '';
    const path = `/v0/${BASE_ID}/${encodeURIComponent(table)}${queryStr}${sortStr}`;

    const data = await httpsRequest(path);
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    if (data.records) records.push(...data.records.map(wrapRecord));
    offset = data.offset;
  } while (offset);

  return records;
}

/** Fetch a single record by ID. */
async function findRecord(table: string, recordId: string): Promise<any> {
  const path = `/v0/${BASE_ID}/${encodeURIComponent(table)}/${recordId}`;
  const data = await httpsRequest(path);
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return wrapRecord(data);
}

/** Create records in a table. */
async function createRecords(table: string, fieldsArray: object[]): Promise<any[]> {
  const path = `/v0/${BASE_ID}/${encodeURIComponent(table)}`;
  const body = { records: fieldsArray.map((fields) => ({ fields })) };
  const data = await httpsRequest(path, 'POST', body);
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return (data.records ?? []).map(wrapRecord);
}

/** Update a record (PATCH). */
async function updateRecord(table: string, recordId: string, fields: object): Promise<any> {
  const path = `/v0/${BASE_ID}/${encodeURIComponent(table)}/${recordId}`;
  const data = await httpsRequest(path, 'PATCH', { fields });
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data;
}

// ─── Public table helpers (mirrors old Tables.X API surface) ─────────────────

const makeTable = (tableName: string) => ({
  select: (query: Record<string, any> = {}) => ({
    all: () => selectAll(tableName, query),
  }),
  find: (id: string) => findRecord(tableName, id),
  create: (fieldsArray: object[]) => createRecords(tableName, fieldsArray),
  update: (id: string, fields: object) => updateRecord(tableName, id, fields),
});

export const Tables = {
  Clients:        makeTable('Clients'),
  Experiences:    makeTable('Experiences'),
  Recommendation: makeTable('Recommendation'),
  Massage:        makeTable('Massage'),
  Sales:          makeTable('Sales'),
};
