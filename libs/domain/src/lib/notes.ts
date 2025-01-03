import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';
import { SprintItem, SprintItemRow } from './sprintItem';

export type NoteList = {
  sprintId: number;
  notes: Note[];
};

type NoteRow = SprintItemRow & {
  id?: number;
  title: string;
  content: string;
  author: string;
  dateCreated: Date;
};

@Entity()
export class Note extends SprintItem {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  author: string;

  @Column()
  dateCreated: Date;

  constructor({ id, sprintId, clientKey, projectKey, title, content, author, dateCreated }: NoteRow) {
    super({ sprintId, clientKey, projectKey });
    this.id = id;
    this.title = title;
    this.content = content;
    this.author = author;
    this.dateCreated = dateCreated;
  }
}
