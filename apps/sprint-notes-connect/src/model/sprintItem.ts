import { Column, Index } from "typeorm";

export type SprintItemRow = {
    sprintId: number;
    clientKey: string;
    projectKey: string;
}

export abstract class SprintItem {
    @Index()
    @Column("integer")
    sprintId!: number;

    @Index()
    @Column("varchar")
    clientKey!: string;

    @Index()
    @Column("varchar")
    projectKey!: string;

    constructor(row?: SprintItemRow) {
        if (!row) {
            return;
        }
        this.sprintId = row.sprintId;
        this.clientKey = row.clientKey;
        this.projectKey = row.projectKey;
    }
}