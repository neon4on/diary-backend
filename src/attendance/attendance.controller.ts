import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AttendanceService } from './attendance.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DiaryRole } from '../common/enums/diary-role.enum';

@UseGuards(AuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  /**
   * Учитель / админ — посещаемость по уроку
   */
  @Get('lesson/:id')
  @Roles(DiaryRole.TEACHER, DiaryRole.ADMIN)
  async getLessonAttendance(
    @Param('id', ParseIntPipe) lessonId: number,
    @Req() req: any,
  ) {
    return this.attendanceService.getLessonAttendance(lessonId, req.user);
  }

  /**
   * Учитель / админ — поставить / обновить посещаемость одному ученику
   *
   * Для TEACHER:
   * {
   *   lessonId,
   *   studentId,
   *   status,
   *   lateMinutes?,
   *   comment?
   * }
   *
   * Для ADMIN:
   * {
   *   lessonId,
   *   studentId,
   *   status,
   *   lateMinutes?,
   *   comment?,
   *   teacherId
   * }
   */
  @Post()
  @Roles(DiaryRole.TEACHER, DiaryRole.ADMIN)
  async upsertAttendance(@Body() body: any, @Req() req: any) {
    return this.attendanceService.upsertAttendance({
      lessonId: body.lessonId,
      studentId: body.studentId,
      status: body.status,
      lateMinutes: body.lateMinutes,
      comment: body.comment,
      teacherId: body.teacherId,
      user: req.user,
    });
  }

  /**
   * Учитель / админ — массово поставить / обновить посещаемость
   *
   * Для TEACHER:
   * {
   *   lessonId,
   *   items: [{ studentId, status, lateMinutes?, comment? }]
   * }
   *
   * Для ADMIN:
   * {
   *   lessonId,
   *   teacherId,
   *   items: [{ studentId, status, lateMinutes?, comment? }]
   * }
   */
  @Post('bulk')
  @Roles(DiaryRole.TEACHER, DiaryRole.ADMIN)
  async bulkUpsertAttendance(@Body() body: any, @Req() req: any) {
    return this.attendanceService.bulkUpsertAttendance({
      lessonId: body.lessonId,
      items: body.items,
      teacherId: body.teacherId,
      user: req.user,
    });
  }
}