export class ResponseDto {
  success: boolean;
  message: string;
  data?: any;
}

export interface AbstractResponse<T> {
  success: boolean;
  message?: string;
  status: number;
  data?: T;
}
