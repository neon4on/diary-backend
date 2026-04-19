import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DiaryRole } from '../common/enums/diary-role.enum';

@UseGuards(AuthGuard, RolesGuard)
@Controller('schedule')
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  /**
   * Учитель — своё актуальное расписание
   */
  @Get('my')
  @Roles(DiaryRole.TEACHER)
  async getMySchedule(@Req() req: any) {
    return this.scheduleService.getTeacherSchedule(req.user.id);
  }
}