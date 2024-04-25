import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

export class EnumValidationPipe<E> implements PipeTransform<string, Promise<E>> {
    private readonly enumType: E;

    constructor(enumType: E) {
        this.enumType = enumType;
    }

    transform(value: string, metadata: ArgumentMetadata): Promise<E> {
        const enumValues = Object.values(this.enumType);

        if (!enumValues.includes(value)) {
            const errorMessage = `The value '${value}' is not valid. Acceptable values: ${enumValues.join(', ')}`;
            throw new BadRequestException(errorMessage);
        }

        return Promise.resolve(value as E);
    }
}