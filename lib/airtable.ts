import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!);

export const Tables = {
  Clients:        base('Clients'),
  Experiences:    base('Experiences'),
  Recommendation: base('Recommendation'),
  Massage:        base('Massage'),
  Sales:          base('Sales'),
};
