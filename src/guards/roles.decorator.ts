import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
// import { RolesGuard } from './roles.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

export function Role(role: string[]) {
    return applyDecorators(
        UseGuards(JwtAuthGuard),
        SetMetadata('roles', role),
        // UseGuards(RolesGuard),
    );
}

// applyDecorators();
