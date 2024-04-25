import { diskStorage } from 'multer';
import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { MulterModule } from '@nestjs/platform-express';
import { extname, join } from 'path';

export const imageFileFilter = (req, file: Express.Multer.File, callback) => {
  return file.mimetype === 'image/gif' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp' ? callback(null, true) : callback(new Error('Only image files are allowed!'), false);


};

@Module({
  imports: [
    MulterModule.register({
      // dest: '/usr/files',
      //limits: { fileSize: 1000000 },
      // storage: diskStorage({
      //   destination: '/usr/files',
      // }),
      fileFilter: imageFileFilter,
    }),
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule { }
