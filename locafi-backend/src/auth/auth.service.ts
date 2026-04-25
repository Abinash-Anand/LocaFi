import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { WalletService } from '../wallet/wallet.service';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly walletService: WalletService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterDto): Promise<{ accessToken: string }> {
    const email = input.email.toLowerCase().trim();
    const existing = await this.walletService.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const created = await this.walletService.createFromRegistration({
      userId: randomUUID(),
      name: input.name.trim(),
      email,
      passwordHash,
    });

    const accessToken = await this.jwtService.signAsync({
      sub: created.userId,
      email: created.email,
      name: created.name,
    });
    return { accessToken };
  }

  async login(input: LoginDto): Promise<{ accessToken: string }> {
    const email = input.email.toLowerCase().trim();
    const user = await this.walletService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.userId,
      email: user.email,
      name: user.name,
    });
    return { accessToken };
  }
}
