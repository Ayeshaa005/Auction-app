import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BidsController } from './bids.controller';
import { BidsGateway } from './bids.gateway';
import { BidsService } from './bids.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'change-me-in-production'),
      }),
    }),
  ],
  controllers: [BidsController],
  providers: [BidsService, BidsGateway],
})
export class BidsModule {}
