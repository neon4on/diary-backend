import { Controller, Get, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { AuthGuard } from '../common/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('schedule')
export class ScheduleController {

  constructor(private scheduleService: ScheduleService) {}

  @Get()
  getSchedule() {
    return this.scheduleService.getSchedule();
  }

}