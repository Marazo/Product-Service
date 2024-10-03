import { Body, Controller, Post } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { AuthService } from './auth.service';

class LoginDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  id: number;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}
