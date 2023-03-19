import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { RoleGuard } from './role.guard';
import { Role } from './user.entity';

@Controller('users')
@ApiTags('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RoleGuard(Role.ADMIN))
  public findAll() {
    return this.usersService.findAll();
  }
}
