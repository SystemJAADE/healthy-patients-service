import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TriagesService } from './triages.service';
import { RoleGuard } from 'src/helpers/role.helper';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TriageDto } from './dto/triage.dto';

@Controller('triages')
@ApiTags('triages')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(RoleGuard(Role.ADMIN))
export class TriagesController {
  constructor(private readonly triagesService: TriagesService) {}

  @Get()
  public findAll() {
    return this.triagesService.findAll();
  }

  @Get(':id')
  public findByID(@Param('id') id: number) {
    return this.triagesService.findByID(id);
  }

  @Post()
  public create(@Body() data: TriageDto) {
    return this.triagesService.create(data);
  }

  @Put(':id')
  public update(@Param('id') id: number, @Body() data: TriageDto) {
    return this.triagesService.update(id, data);
  }

  @Delete(':id')
  public delete(@Param('id') id: number) {
    return this.triagesService.delete(id);
  }
}
