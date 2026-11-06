import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { OperationsController } from './operations.controller';
import { OperationsService } from './operations.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [PrismaModule],
  controllers: [OperationsController, ReportsController, DataController],
  providers: [DataService, OperationsService, ReportsService],
})
export class DataModule {}
