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
      
      appController.cacheEnabled = false;
      let response: Flight[];

      // since we can get a combination of succes and error requests,
      // we try couple of times to get the chance to test the different cases
      for (let i: number = 0; i < 10; i ++) {        
        let timerStart: Date;
        let timerEnd: Date;

        try {
          timerStart = new Date();
          response = await appController.getFlights();
          timerEnd = new Date();
          
          expect(response.length).toBeGreaterThanOrEqual(5);          
          expect(Math.abs(timerEnd.getTime() - timerStart.getTime()) < 1000).toBeTruthy();
        } 
        catch(error) {
          // if the request response is later than 1 second we exepect an error
          timerEnd = new Date();
          expect(Math.abs(timerEnd.getTime() - timerStart.getTime()) >= 1000).toBeTruthy();
          expect(error['status']).toBe(500);
          expect(
            error['message'] === 'No flight sources available at the moment' ||
            error['message'] === 'Time limit exceeded'
          ).toBeTruthy();          
        }                        
      }
    });
  });
});
