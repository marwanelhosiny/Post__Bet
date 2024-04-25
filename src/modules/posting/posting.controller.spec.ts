import { Test, TestingModule } from '@nestjs/testing';
import { PostingController } from './posting.controller';
import { PostingService } from './posting.service';

describe('PostingController', () => {
  let controller: PostingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostingController],
      providers: [PostingService],
    }).compile();

    controller = module.get<PostingController>(PostingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
