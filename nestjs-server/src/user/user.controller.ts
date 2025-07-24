import {Controller, Get, HttpCode, HttpStatus} from '@nestjs/common';
import { UserService } from './user.service';
import {Authorized} from "@/auth/decorators/authorized.decorator";
import {Authorization} from "@/auth/decorators/auth.decorator";
import {$Enums} from "@prisma/__generated__";
import UserRole = $Enums.UserRole;

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Authorization(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get('profile')
  public async findProfile(@Authorized('id') userId: string) {
    return this.userService.findById(userId)
  }

  @Authorization(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get('by-id/:id')
  public async findById(@Authorized('id') userId: string) {
    return this.userService.findById(userId)
  }
}
