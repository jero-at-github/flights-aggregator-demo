import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Flight } from 'src/flights/flights.interface';

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
    // since we can get a combination of succes and error requests,
    // we try couple of times to get the chance to test both cases
    for (let i: number = 0; i < 5; i ++) {
      let timerStart: Date = new Date();
      let response = await request(app.getHttpServer()).get('/flights');
      let timerEnd: Date = new Date();

      // if the request response is later than 1 second we exepect an error
      if (Math.abs(timerEnd.getTime() - timerStart.getTime()) >= 1000) {        
        expect(response.status == 500);
        expect(response.body['statusCode']).toBe(500);
        expect(response.body['message']).toBe('Time limit exceeded');
      } else {
        // if succeded, we expect at least the data of one of the requests (5)
        expect(response.status == 200);
        expect(response.body.length).toBeGreaterThanOrEqual(5);
      }      
    }    
  });
});
