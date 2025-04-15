import { Queue } from "@forge/events";

export function pushToNoteMigrationQueue(pageNumber: number) {
    const queue = new Queue({ key: 'notes-migration' });
    queue.push({
        page: pageNumber
    });
}

export function getNoteMigrationJob(jobId: any) {
    const queue = new Queue({ key: 'notes-migration' });
    return queue.getJob(jobId);
}