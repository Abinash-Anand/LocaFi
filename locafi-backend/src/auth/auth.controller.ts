import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginDto, RegisterDto } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  /** Alias for {@link register}; preferred public name for clients. */
  @Post('signup')
  signup(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  /** Stateless JWT: acknowledge logout for client flow; no server session to clear. */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    return { ok: true as const };
  }
}
