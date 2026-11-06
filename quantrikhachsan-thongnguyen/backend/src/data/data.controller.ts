import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/auth.decorators';
import type { AuthenticatedUser } from '../auth/auth.dto';
import { DataService } from './data.service';

@Controller()
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get(':resource')
  findAll(
    @Param('resource') resource: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('search') search?: string,
  ) {
    return this.dataService.findAll(resource, user, limit, offset, search);
  }

  @Get(':resource/:id/:secondaryId')
  findComposite(
    @Param('resource') resource: string,
    @Param('id') id: string,
    @Param('secondaryId') secondaryId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dataService.findOne(resource, id, user, secondaryId);
  }

  @Get(':resource/:id')
  findOne(
    @Param('resource') resource: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dataService.findOne(resource, id, user);
  }

  @Post(':resource')
  create(
    @Param('resource') resource: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dataService.create(resource, body, user);
  }

  @Patch(':resource/:id/:secondaryId')
  updateComposite(
    @Param('resource') resource: string,
    @Param('id') id: string,
    @Param('secondaryId') secondaryId: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dataService.update(resource, id, body, user, secondaryId);
  }

  @Patch(':resource/:id')
  update(
    @Param('resource') resource: string,
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dataService.update(resource, id, body, user);
  }

  @Delete(':resource/:id/:secondaryId')
  removeComposite(
    @Param('resource') resource: string,
    @Param('id') id: string,
    @Param('secondaryId') secondaryId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dataService.remove(resource, id, user, secondaryId);
  }

  @Delete(':resource/:id')
  remove(
    @Param('resource') resource: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dataService.remove(resource, id, user);
  }
}
