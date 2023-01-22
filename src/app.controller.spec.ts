import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Flight } from './flights/flights.interface';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {  
    const app: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, CacheModule.register(),],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the flights or an expected error', async () => {
      
      let response: Flight[];

      // disable cache
      appController.cacheEnabled = false;      

      // since we can get a combination of succes and error possible responses,
      // we try couple of times to get the chance to test the different cases
      for (let i: number = 0; i < 10; i ++) {        
        let timerStart: Date;
        let timerEnd: Date;

        try {
          timerStart = new Date();
          response = await appController.getFlights();
          timerEnd = new Date();
          
          // check that at least we have 5 items          
          expect(response.length).toBeGreaterThanOrEqual(5);  
          // check that the response time is the exepcted one
          let executionTime = Math.abs(timerEnd.getTime() - timerStart.getTime());    
          expect(executionTime < 1000).toBeTruthy(); 
        } 
        catch(error) {          
          timerEnd = new Date();
          
          expect(error['status']).toBe(500);
          expect(
            error['message'] === 'No flight sources available at the moment' ||
            error['message'] === 'Time limit exceeded'
          ).toBeTruthy();          

          // if it is a "TIme limit exceeded" error we check the time execution
          if (error['message'] === 'Time limit exceeded') {
            let executionTime = Math.abs(timerEnd.getTime() - timerStart.getTime());              
            expect(executionTime >= 1000).toBeTruthy();
          }
        }                        
      }
    });
  });
});
