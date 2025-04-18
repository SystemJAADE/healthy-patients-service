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
import { RoleGuard, Roles } from '../helpers/role.helper';
import { TriageDto } from './dto/triage.dto';

@Controller('triages')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(RoleGuard())
@Roles('Admin', 'Doctor')
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
