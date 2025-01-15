import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';
import { SprintItem, SprintItemRow } from './sprintItem';

export type NoteList = {
  sprintId: number;
  notes: Note[];
};

type NoteRow = SprintItemRow & {
  id?: string;
  title: string;
  content: string;
  author: string;
  dateCreated: Date;
};

@Entity({ name: 'notes' })
export class Note extends SprintItem {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column('varchar')
  title!: string;

  @Column('varchar')
  content!: string;

  @Column('varchar')
  author!: string;

  @Column('date')
  dateCreated!: Date;

  constructor(row?: NoteRow) {
    if (!row) {
      super();
      return;
    }
    super(row);
    this.title = row.title;
    this.content = row.content;
    this.author = row.author;
    this.dateCreated = row.dateCreated;
  }
}
