import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WalletModule } from '../wallet/wallet.module';
import { TavilyIntegrationService } from './tavily-integration.service';
import { VibeController } from './vibe.controller';
import { VibeEngineService } from './vibe-engine.service';

@Module({
  imports: [HttpModule, WalletModule],
  controllers: [VibeController],
  providers: [TavilyIntegrationService, VibeEngineService],
})
export class VibeModule {}
