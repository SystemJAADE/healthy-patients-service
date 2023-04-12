import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TriagesService } from './triages.service';
import { TriagesRepository } from './triages.repository';
import { TriagesController } from './triages.controller';

@Module({
  imports: [PrismaModule],
  providers: [TriagesService, TriagesRepository],
  exports: [TriagesService, TriagesRepository],
  controllers: [TriagesController],
})
export class TriagesModule {}
