import { Column, Index } from 'typeorm';

export type SprintItemRow = {
  sprintId: number;
  clientKey: string;
  projectKey: string;
  installationId: string;
};

export abstract class SprintItem {
  @Index()
  @Column('integer')
  sprintId!: number;

  @Index()
  @Column({
    type: 'varchar',
    nullable: true,
  })
  clientKey!: string;

  @Index()
  @Column('varchar')
  projectKey!: string;

  @Index()
  @Column({
    type: 'varchar',
    nullable: true,
  })
  installationId!: string;

  constructor(row?: SprintItemRow) {
    if (!row) {
      return;
    }
    this.sprintId = row.sprintId;
    this.clientKey = row.clientKey;
    this.projectKey = row.projectKey;
    this.installationId = row.installationId;
  }
}
