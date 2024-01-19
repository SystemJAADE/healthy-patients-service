import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  // TODO: This works with the real database, but we need to mock it
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // TODO: Implement proper tests with authentication, this is just a placeholder
  // It returns 401 because we don't have a valid token
  it('/triages (GET)', () => {
    return request(app.getHttpServer()).get('/triages').expect(401);
  });
});
