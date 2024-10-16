import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UbigeoController } from './ubigeo.controller';
import { UbigeoRepository } from './ubigeo.repository';
import { UbigeoService } from './ubigeo.service';

@Module({
  imports: [PrismaModule],
  providers: [UbigeoService, UbigeoRepository],
  exports: [UbigeoService, UbigeoRepository],
  controllers: [UbigeoController],
})
export class UbigeoModule {}
