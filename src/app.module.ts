import { HttpModule } from '@nestjs/axios';
import { Module, CacheModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    HttpModule, 
    CacheModule.register({
      ttl: 10000,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
