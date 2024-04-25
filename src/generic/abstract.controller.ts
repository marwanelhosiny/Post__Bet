
import { Injectable, ValidationPipe, ValidationPipeOptions, Type, ArgumentMetadata, Post, UsePipes, Body, Get, Param, Query, Patch, Put, Delete, ClassSerializerInterceptor, UseInterceptors, UseGuards } from "@nestjs/common";
import { ApiBody, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { DeleteResult } from "typeorm";
// import { JwtAuthGuard } from "../modules/guards/jwt-auth.guard";
import { AbstractValidationPipe } from "./abstract-validation.pipe";
import { AbstractService } from "./abstract.service";
import { AdminGuard } from "../guards/admin.guard";




export function ControllerFactory<E>(model: Type<E>): any {

    const createPipe = new AbstractValidationPipe({ whitelist: true, transform: true }, { body: model });

    class AbstractController<E, Service extends AbstractService<any>> {

        constructor(private service: Service) {

        }

        // @Post()
        // // @UsePipes(createPipe)
        // // @UseGuards(JwtAuthGuard)
        // @UseInterceptors(ClassSerializerInterceptor)
        // @ApiBody({ type: model })
        // @ApiResponse({ type: model })
        // async saveOne(@Body() body: E):Promise <E> {
        //     console.log(body)
        //     return await this.service.save(body)
        // }

        @Post()
        @UseInterceptors(ClassSerializerInterceptor)
        @UseGuards(AdminGuard)
        @ApiResponse({ type: model, })
        @ApiBody({ type: model, })
        async save(@Body() body: E): Promise<E> {
            return await this.service.save(body);
        }

        @Post('add')
        @UseInterceptors(ClassSerializerInterceptor)
        @UseGuards(AdminGuard)
        @ApiResponse({ type: model, isArray: true })
        @ApiBody({ type: model, isArray: true })
        async saveArray(@Body() body: E[]): Promise<E[]> {
            return this.service.saveAll(body);
        }

        @ApiQuery({ name: 'page', required: false, type: Number })
        @ApiQuery({ name: 'pageSize', required: false, type: Number })
        @UseInterceptors(ClassSerializerInterceptor)
        @Get()
        @UseGuards(AdminGuard)
        @ApiResponse({ type: model, isArray: true })
        async findAll(@Query('page') page: number, @Query('pageSize') pageSize: number): Promise<E[] | Pagination<E, IPaginationMeta>> {
            return page ? this.service.findPaginated({ page: page, pageSize: pageSize ?? 100 }) : this.service.findAll();
        }


        @Get('count')
        // @UseGuards(AdminGuard)
        async count(): Promise<number> {
            return this.service.count();
        }


        @Get('allAndCount')
        @UseGuards(AdminGuard)
        @UseInterceptors(ClassSerializerInterceptor)
        @ApiResponse({
            type: () => {
                return { records: [model], count: Number }
            }, isArray: true
        })
        async findAllAndCount(): Promise<{ records: E[], count: number }> {
            return this.service.findAllAndCount();
        }

        @Get(':id')
        @UseGuards(AdminGuard)
        @UseInterceptors(ClassSerializerInterceptor)
        @ApiResponse({ type: model })
        async findById(@Param('id') id: number,): Promise<E> {
            return this.service.findById(id);
        }

        @Put(':id')
        @UseGuards(AdminGuard)
        @UseInterceptors(ClassSerializerInterceptor)
        @ApiBody({ type: model })
        @ApiResponse({ type: model })
        async updateOne(@Param('id') id: number, @Body() body: E): Promise<E> {
            return this.service.update(id, body);
        }

        @Delete(':id')
        @UseGuards(AdminGuard)
        @ApiResponse({ type: DeleteResult })
        async deleteOne(@Param('id') id: number): Promise<DeleteResult> {
            return this.service.delete(id);
        }
    }

    return AbstractController;
}
