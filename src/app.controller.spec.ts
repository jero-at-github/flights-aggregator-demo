import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Flights } from './flights/flights.interface';
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

  describe('Flights', () => {
    it('should return the flights or an expected error in less than 1 second each request', async () => {      
      const maxIterations: number = 20;
      let iteration: number = 0;

      let response: Flights;

      // disable cache to test time response
      appController.useCache(false);

      // since we can get a combination of possible succes and error responses,
      // we try couple of times to get the chance to test the different cases
      while (iteration < maxIterations) {                     
        try {
          let timerStart: number = performance.now();
          response = await appController.getFlights();
          let timerEnd: number = performance.now();
                    
          // check that the response time is not longer than 1 second
          let executionTime = timerEnd - timerStart;            
          expect(executionTime).toBeLessThanOrEqual(1000);          

          // check that at least we have 5 items          
          expect(response.flights.length).toBeGreaterThanOrEqual(5);     
          expect(response.flights.length).toBeLessThanOrEqual(8);                           
        } 
        catch(error) {
          // the only possible expected error happens when no source retrieves any data
          if (error['status'] == 500) {
            expect(error['status']).toBe(500);          
            expect(error['message'] === 'No flight sources available at the moment').toBeTruthy();                    
          } else {
            throw error;
          }
        }    
        
        iteration ++;
      }
    });
  });
});
