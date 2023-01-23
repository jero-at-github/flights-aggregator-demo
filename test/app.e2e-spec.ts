import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as _ from 'lodash';

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
    const maxIterations: number = 10;
    let iteration: number = 0;

    // since we can get a combination of possible succes and error responses,
    // we try couple of times to get the chance to test the different cases
    while (iteration < maxIterations) {          
      let timerStart: number = performance.now();
      let response = await request(app.getHttpServer()).get('/flights');
      let timerEnd: number = performance.now();
      
      let executionTime = timerEnd - timerStart;      
      
      if (response.status == 500) {              
        expect(
          response.body['message'] === 'No flight sources available at the moment'
        ).toBeTruthy();                      
      } else {
        // if succeded, we expect at least the data of one of the requests (5)
        expect(response.status == 200);
        expect(response.body.length).toBeGreaterThanOrEqual(5);
        expect(executionTime).toBeLessThanOrEqual(1000);
      }         
                 
      iteration ++;
    }    
  });
});
