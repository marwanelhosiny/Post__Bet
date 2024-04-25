import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { AbstractResponse } from '../dtos/response.dto';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, AbstractResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<AbstractResponse<T>> {
    let defaultStatus = 200;

    return next.handle().pipe(
      map((data) => {
        // let cloned = data;
        // try {
        //   const { status, ...rest } = data;
        //   cloned = rest;
        //   if (status) {
        //     defaultStatus = status;
        //   }
        // } catch (e) {}
        return {
          success: true,
          status: defaultStatus,
          data: data,
        };
      }),
    );
  }
}