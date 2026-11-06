import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../auth/auth.decorators';
import { ReportsService } from './reports.service';

@Controller('reports')
@Roles('Admin', 'Manager')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('revenue')
  revenue(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reports.revenue(from, to);
  }

  @Get('occupancy')
  occupancy() {
    return this.reports.occupancy();
  }
}
