import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WalletService } from './wallet.service';

export interface WalletResponseDto {
  userId: string;
  balance: number;
  dsvRewardPoints: number;
}

export interface ClaimWalletRequestDto {
  title: string;
  merchantName: string;
  amount: number;
  points: number;
}

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getWallet(@Req() req: { user: { sub: string } }): Promise<WalletResponseDto> {
    const wallet = await this.walletService.findOrCreate(req.user.sub);
    return this.toDto(wallet);
  }

  @Post('claim')
  async claim(
    @Req() req: { user: { sub: string } },
    @Body() body: ClaimWalletRequestDto,
  ): Promise<WalletResponseDto> {
    const wallet = await this.walletService.claimOffer({ ...body, userId: req.user.sub });
    return this.toDto(wallet);
  }

  private toDto(wallet: { userId: string; balance: number; dsvRewardPoints: number }): WalletResponseDto {
    return {
      userId: wallet.userId,
      balance: wallet.balance,
      dsvRewardPoints: wallet.dsvRewardPoints,
    };
  }
}
