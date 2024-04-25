import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class FileService {

    private s3Client = new S3Client({
        region: process.env.S3_REGION,
        credentials: {
            secretAccessKey: process.env.S3_ACCESS_SECRET_KEY,
            accessKeyId: process.env.S3_ACCESS_KEY,
        }
    })

    async upload(req, fileName: string, file: Express.Multer.File) {
        let currentTimeStamp = Date.now();
        let fileParts = fileName.split(".")
        let newFileName = `${fileParts[0].replace(" ", "-")}-${currentTimeStamp}.${fileParts[1]}`;
        let res = await this.s3Client.send(
            new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: newFileName,
                Body: file.buffer

            })
        )

        return {
            id: newFileName,
            timeStamp: currentTimeStamp,
            s3: res
        };
    }

    async getFile(res, fileName: string): Promise<void> {
        try {
            const data = await this.s3Client.send(
                new GetObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: fileName,
                })
            );

            res.header('Content-Disposition', 'inline; filename="' + fileName + '"');
            res.header('Content-Length', data.ContentLength.toString());

            // Retain existing headers
            // res.header('Access-Control-Allow-Origin', '*');
            res.header('Content-Type', `image/${fileName.split(".")[1]}`);
            res.header('ETag', data.ETag);

            res.send(Buffer.from(await data.Body.transformToByteArray()));

        } catch (error) {
            console.error('Error retrieving file from S3:', error);
            res.send('Error retrieving file from S3');
        }
    }


    async deleteFile(res, fileName: string): Promise<void> {
        try {
            const data = await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: fileName,
                })
            );
            console.log(data);
            return res.json(`File ${fileName} deleted successfully`)

        } catch (error) {
            console.error('Error retrieving file from S3:', error);
            res.send(`Error deleting file ${fileName}from S3`);
        }
    }

    // async s3_upload(file, bucket, name, mimetype) {
    //     const params = {
    //         Bucket: bucket,
    //         Key: String(name),
    //         Body: file,
    //         ACL: 'public-read',
    //         ContentType: mimetype,
    //         ContentDisposition: 'inline',
    //         CreateBucketConfiguration: {
    //             LocationConstraint: 'eu-west-2',
    //         },
    //     };

    //     try {
    //         let s3Response = await this.s3Client.upload(params).promise();
    //         return s3Response;
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }

    // async upload(req, fileName: string, file) {
    //     let bucketName = process.env.S3_BUCKET_NAME

    //     let res = await this.s3_upload(
    //         file.buffer,
    //         bucketName,
    //         fileName,
    //         file.mimetype,
    //     );

    //     return res
    // }



    // async upload(req, file) {
    //     console.log(file.path)
    //     const response = readFile(file.path,(err, buff) => {
    //         if (err) {
    //             console.log(err)
    //         }
    //         else {
    //             console.log(buff)
    //         }
    //     })
    //     return {
    //         id: file.filename,
    //         timeStamp: Date.now()
    //     }
    // }
}