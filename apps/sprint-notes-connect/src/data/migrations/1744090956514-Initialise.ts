import { MigrationInterface, QueryRunner } from "typeorm";

export class Initialise1744090956514 implements MigrationInterface {
    name = 'Initialise1744090956514'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notes" ("sprintId" integer NOT NULL, "clientKey" character varying NOT NULL, "projectKey" character varying NOT NULL, "id" SERIAL NOT NULL, "title" character varying NOT NULL, "content" character varying NOT NULL, "author" character varying NOT NULL, "dateCreated" date NOT NULL, CONSTRAINT "PK_af6206538ea96c4e77e9f400c3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d07fe69b791bece550777a44d8" ON "notes" ("sprintId") `);
        await queryRunner.query(`CREATE INDEX "IDX_22012f74627e856183df01540b" ON "notes" ("clientKey") `);
        await queryRunner.query(`CREATE INDEX "IDX_9cb99b0f91bf875ff3f73e6d7d" ON "notes" ("projectKey") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_9cb99b0f91bf875ff3f73e6d7d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_22012f74627e856183df01540b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d07fe69b791bece550777a44d8"`);
        await queryRunner.query(`DROP TABLE "notes"`);
    }

}
