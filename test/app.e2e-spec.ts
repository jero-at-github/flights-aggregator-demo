import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', async () => {    
    let timerStart: Date = new Date();
    let response = await request(app.getHttpServer()).get('/flights');
    let timerEnd: Date = new Date();

    // if the request response is later than 1 second we exepect an error
    if (Math.abs(timerEnd.getTime() - timerStart.getTime()) >= 1000) {        
      expect(response.status == 500);        
      expect(
        response.body['message'] === 'No flight sources available at the moment' ||
        response.body['message'] === 'Time limit exceeded'
      ).toBeTruthy();
    } else {
      // if succeded, we expect at least the data of one of the requests (5)
      expect(response.status == 200);
      expect(response.body.length).toBeGreaterThanOrEqual(5);
    }              
  });
});
