import { Controller, DefaultValuePipe, Get, ParseFloatPipe, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WalletState } from '../models/interfaces';
import { WalletService } from '../wallet/wallet.service';
import { VibeEngineService } from './vibe-engine.service';

@Controller('context')
@UseGuards(JwtAuthGuard)
export class VibeController {
  constructor(
    private readonly vibeEngine: VibeEngineService,
    private readonly walletService: WalletService,
  ) {}

  @Get()
  async getContext(
    @Req() req: { user: { sub: string } },
    @Query('lat', new DefaultValuePipe(48.7758), ParseFloatPipe) lat: number,
    @Query('lng', new DefaultValuePipe(9.176), ParseFloatPipe) lng: number,
  ) {
    const { context, offers } = await this.vibeEngine.getContextWithOffers(lat, lng);
    const walletEntity = await this.walletService.findOrCreate(req.user.sub);
    const wallet: WalletState = {
      userId: walletEntity.userId,
      balance: walletEntity.balance,
      dsvRewardPoints: walletEntity.dsvRewardPoints,
    };
    return { context, offers, wallet };
  }
}
