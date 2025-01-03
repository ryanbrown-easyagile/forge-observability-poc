import { DataSource } from 'typeorm';
import { Note } from '@jira-observability/es-notes-domain';

export const dataSource: DataSource = new DataSource({
  type: 'postgres',
  entities: [Note],
  url: process.env.DATABASE_URL,
  maxQueryExecutionTime: 5000,
});
