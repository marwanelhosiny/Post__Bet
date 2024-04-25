import {
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { join } from 'path';
import { FileService } from './file.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('File')
@Controller('File')
export class FileController {
  constructor(private readonly fileService: FileService) { }

  @Post('upload')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'),)
  async uploadedFile(
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2000000 }),// 2 Megabyte

        ]
      })
    ) file: Express.Multer.File,
  ) {
    return this.fileService.upload(req, file.originalname, file)
  }

  @Get(':fileName')
  async retrieve(@Param('fileName') fileName: string, @Res() res,) {
    return await this.fileService.getFile(res, fileName)
  }

  @Delete(':fileName')
  async delete(@Param('fileName') fileName: string, @Res() res,) {
    return await this.fileService.deleteFile(res, fileName)
  }

  // @Post('upload')
  // @UseGuards(JwtAuthGuard)
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: diskStorage({
  //       destination: '/usr/files',
  //       filename(
  //         req,
  //         file: Express.Multer.File,
  //         callback: (error: Error | null, filename: string) => void,
  //       ) {
  //         callback(
  //           null,
  //           file.fieldname +
  //           '-' +
  //           Date.now().toString(8) +
  //           '.' +
  //           file.mimetype.split('/')[1],
  //         );
  //       },
  //     }),
  //     fileFilter: (req, file: Express.Multer.File, callback) => {
  //       return file.mimetype === 'image/gif' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp' ? callback(null, true) : callback(new Error('Only image files are allowed!'), false);


  //     },
  //   }),
  // )
  // async uploadedFile(
  //   @Req() req,
  //   @UploadedFile() file: Express.Multer.File,
  // ) {
  //   return this.fileService.upload(req, file)
  // }


  // @Get(':filepath')
  // seeUploadedFile(@Param('filepath') image, @Res() res) {
  //   return res.sendFile(image, {
  //     root: '/usr/files',
  //   });
  // }
}
