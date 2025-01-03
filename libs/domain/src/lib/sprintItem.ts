import { Column, Index } from "typeorm";

export type SprintItemRow = {
    sprintId: number;
    clientKey: string;
    projectKey: string;
}

export abstract class SprintItem {
    @Index()
    @Column()
    sprintId: number;

    @Index()
    @Column()
    clientKey: string;

    @Index()
    @Column()
    projectKey: string;

    constructor({ sprintId, clientKey, projectKey }: SprintItemRow) {
        this.sprintId = sprintId;
        this.clientKey = clientKey;
        this.projectKey = projectKey;
    }
}