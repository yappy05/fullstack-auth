import {Body, Controller, HttpCode, HttpStatus, Post, Req, Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import {RegisterDto} from "@/auth/dto/register.dto";
import {Request, Response} from "express";
import {LoginDto} from "@/auth/dto/login.dto";
import {Recaptcha} from "@nestlab/google-recaptcha";

@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Recaptcha()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  public async register(@Req() req: Request, @Body() dto: RegisterDto) {
    return this.authService.register(req,  dto)
  }

  @Recaptcha()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(@Req() req: Request, @Body() dto: LoginDto) {
    return this.authService.login(req,  dto)
  }
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  public async logout(@Req() req: Request, @Res({passthrough: true}) res: Response) {
    return this.authService.logout(req, res)
  }
}
