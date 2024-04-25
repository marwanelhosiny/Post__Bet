import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
// import { PostgresConnectionOptions } from 'typeorm';  // Import the specific connection options type for PostgreSQL

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  
    app = moduleFixture.createNestApplication();
    await app.init();
  
    // Connect to the test database
    // await connectToTestDatabase(); // Implement this function to connect to the test database
  });
  
  // afterEach(async () => {
  //   // Clean up the test database
  //   await cleanupTestDatabase(); // Implement this function to clean up the test database
  //   await app.close();
  // });


//   async function connectToTestDatabase(): Promise<void> {
//     const connectionOptions: PostgresConnectionOptions = {
//         type: 'postgres',
//         host: process.env.DB_HOST,
//         port: +process.env.DB_PORT,
//         username: process.env.DB_USERNAME,
//         password: process.env.DB_PASSWORD,
//         database: process.env.DB_NAME,
//         synchronize: true,
//         entities: ['dist/**/*.entity{.ts,.js}'], // Adjust the path to your entities
//         logging: false,
//         logger: 'advanced-console',
//     };

//     try {
//         // Create the TypeORM connection
//         await createConnection(connectionOptions);
//         console.log('Connected to the test database');
//     } catch (error) {
//         console.error('Error connecting to the test database:', error);
//         throw error; // Rethrow the error to fail the test if connection fails
//     }
// }
  

  

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
