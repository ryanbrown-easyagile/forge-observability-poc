import { MigrationInterface, QueryRunner } from "typeorm";

export class AddForgeIds1744157258047 implements MigrationInterface {
    name = 'AddForgeIds1744157258047'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notes" ADD "installationId" character varying`);
        await queryRunner.query(`ALTER TABLE "notes" ALTER COLUMN "clientKey" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_c9139f56b81226f0f29ce29a80" ON "notes" ("installationId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_c9139f56b81226f0f29ce29a80"`);
        await queryRunner.query(`ALTER TABLE "notes" ALTER COLUMN "clientKey" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notes" DROP COLUMN "installationId"`);
    }

}
