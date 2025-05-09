import { migrationRunner } from '@forge/sql';

migrationRunner
  .enqueue(
    'v001_create_notes_table',
    `CREATE TABLE IF NOT EXISTS Notes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sprintId INTEGER NOT NULL,
        projectKey VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        dateCreated DATE NOT NULL
    );`
  )
  .enqueue(
    `v002_index_notes_table_by_sprint_and_project`,
    `CREATE INDEX IF NOT EXISTS idx_sprintId_projectkey ON Notes (
        sprintId, projectKey
    );`
  )

export async function runSchemaMigrations() {
  const response = {
    headers: { 'Content-Type': 'application/json' },
    statusCode: 200,
    statusMessage: 'Ok',
    body: {},
  };
  try {
    console.log('Running migrations...');
    const successfulMigrations = await migrationRunner.run();
    console.log(
      'Migrations completed successfully, applied:',
      successfulMigrations
    );
    const migrationHistory = (await migrationRunner.list())
      .map((y) => `${y.id}, ${y.name}, ${y.migratedAt.toUTCString()}`)
      .join('\n');
    console.log(
      'Migrations history:\nid, name, migrated_at\n',
      migrationHistory
    );
    response.body = {
      status: 'success',
    };
  } catch (error: any) {
    console.error('Error running migrations:', error, JSON.stringify(error));
    console.dir(error, {depth: 5});
    response.statusCode = 500;
    response.statusMessage = 'Error while executing migrations';
    response.body = {
      status: 'error',
    };
  }
  return response;
}