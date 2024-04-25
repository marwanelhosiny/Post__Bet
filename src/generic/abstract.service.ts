import { ForbiddenException, HttpException, Logger, Options } from "@nestjs/common";
import { DeleteResult, Repository } from "typeorm";
import { OBaseEntity } from "../generic/base.entity";
import { paginate } from 'nestjs-typeorm-paginate';
import { NotEquals } from "class-validator";


const log = new Logger('AbstractService');

export abstract class AbstractService<E extends OBaseEntity>{

    constructor(public repository: Repository<any>) {

    }

    // save M Created By Override 
    async save(req: E): Promise<E> {
        return await this.repository.save<E>(req);
    }

    // save M Created By Override 
    async saveAll(req: E[]): Promise<E[]> {
        return await this.repository.save<E[]>(req, { chunk: 100 });
    }

    async findAllAndCount(): Promise<{ records: E[], count: number }> {
        const results = await this.repository.findAndCount({ loadEagerRelations: false });
        return {
            records: results[0],
            count: results[1]
        };
    }


    async findPaginated({ page, pageSize }: { page: number; pageSize: number }) {
        let queryBuilder = this.repository.createQueryBuilder('q');
        queryBuilder.orderBy('q.updatedAt', 'DESC');
        return paginate<E>(queryBuilder, { page: page, limit: pageSize });
    }

    async findAll(options?): Promise<E[]> {
        if (!options) {
            options = { loadEagerRelations: true, loadRelationIds: false, } 
        }
        let queryBuilder = this.repository.createQueryBuilder('q');
        queryBuilder.orderBy('q.updatedAt', 'DESC');
        return await queryBuilder.setOption(options).getMany()
    }
    async count(options?): Promise<number> {
        if (!options) {
            options = { lloadEagerRelations: false }
        }
        
        return await this.repository.count(options)
    }

    async findById(id: number): Promise<E> {
        return this.findOneBy({ id: id })

    }

    async findOneBy(options): Promise<E> {
        try {
            return await this.repository.findOneByOrFail(options)
        } catch (err) {
            throw new HttpException(err.message, 404)
        }

    }


    async findObjectById(id: number): Promise<E> {
        return await this.repository.findOneOrFail({ where: { id: id }, loadEagerRelations: true },)
    }
    async findRandom(): Promise<E> {
        return await this.repository.createQueryBuilder()
            .orderBy('id', Date.now() % 2 == 0 ? 'ASC' : 'DESC')
            .limit(1)
            .getOne();
    }


    async update(id: number, req: any): Promise<any> {

        let existsRecord = await this.findOneBy({ id: id });
        req.updatedAt = new Date();
        // Handling Nested Update
        for (const key in req) {
            if (req[key] && req[key].constructor.name == 'Array') {
                for (const oldKey in existsRecord) {
                    if (oldKey == key)
                        delete existsRecord[key]
                }
            }
        }
        this.repository.merge(existsRecord, req);
        let updateResult = await this.repository.save(existsRecord);
        return existsRecord;
    }


    async delete(id: number,): Promise<DeleteResult> {
        try {
            return await this.repository.delete(id);
        } catch (e) {
            // TODO check exception type
            throw new ForbiddenException(
                'this entity has other records assigned to it',
            );
        }
    }


}