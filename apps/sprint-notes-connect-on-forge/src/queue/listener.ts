import Resolver from '@forge/resolver';
import { InvocationError, InvocationErrorCode, Queue } from '@forge/events';
import { getNoteMigrationJob } from './helper';
import { migrateData } from './dataMigrator';

export function resolveQueueHandlers(resolver: Resolver) {
    resolver.define('migrate-note-data', async ({ payload, context }) => {
        const job = getNoteMigrationJob(context.jobId);
        const attempt = context.retryContext ? context.retryContext.retryCount : 0;
        if(job) {
            try {
                const page = payload.page;
                console.log(`Processing migration job for page: ${page}`);
                await migrateData(page, 50);
                return;
            }
            catch (error) {
                console.error(`Error processing migration job for page: ${payload.page}`, error);
                job.cancel();
                return new InvocationError({
                    retryAfter: 10 * Math.pow(2, attempt),
                    retryReason: InvocationErrorCode.FUNCTION_RETRY_REQUEST,
                    retryData: {
                        error,
                        payload
                    }
                })
            }
        }
    });
}