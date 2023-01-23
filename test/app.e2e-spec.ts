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
    const maxIterations: number = 10;
    let iteration: number = 0;

    // since we can get a combination of succes and error possible responses,
    // we try couple of times to get the chance to test the different cases
    while (iteration < maxIterations) {          
      let timerStart: Date = new Date();
      let response = await request(app.getHttpServer()).get('/flights');
      let timerEnd: Date = new Date();      
      
      let executionTime = Math.abs(timerEnd.getTime() - timerStart.getTime());    
      
      if (response.status == 500) {              
        expect(
          response.body['message'] === 'No flight sources available at the moment'
        ).toBeTruthy();                      
      } else {
        // if succeded, we expect at least the data of one of the requests (5)
        expect(response.status == 200);
        expect(response.body.length).toBeGreaterThanOrEqual(5);
        expect(executionTime <= 1000).toBeTruthy();
      }         
      
      // if the request was successfully, the cache system should return the same response the second time
      if (response.status == 200) {
        let response2 = await request(app.getHttpServer()).get('/flights');      
        expect(response.status === response2.status).toBeTruthy();   
        expect(response.body.length == response2.body.length).toBeTruthy();
      } 
      
      iteration ++;
    }    
  });
});
