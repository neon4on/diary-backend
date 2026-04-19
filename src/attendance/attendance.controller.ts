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
   * Учитель — посещаемость по уроку
   */
  @Get('lesson/:id')
  @Roles(DiaryRole.TEACHER)
  async getLessonAttendance(
    @Param('id', ParseIntPipe) lessonId: number,
    @Req() req: any,
  ) {
    return this.attendanceService.getLessonAttendance(lessonId, req.user.id);
  }

  /**
   * Учитель — поставить / обновить посещаемость одному ученику
   * body:
   * {
   *   lessonId: number,
   *   studentId: number,
   *   status: string,
   *   lateMinutes?: number | null,
   *   comment?: string | null
   * }
   */
  @Post()
  @Roles(DiaryRole.TEACHER)
  async upsertAttendance(@Body() body: any, @Req() req: any) {
    return this.attendanceService.upsertAttendance({
      lessonId: body.lessonId,
      studentId: body.studentId,
      status: body.status,
      lateMinutes: body.lateMinutes,
      comment: body.comment,
      teacherId: req.user.id,
    });
  }

  /**
   * Учитель — массово поставить / обновить посещаемость
   * body:
   * {
   *   lessonId: number,
   *   items: [
   *     {
   *       studentId: number,
   *       status: string,
   *       lateMinutes?: number | null,
   *       comment?: string | null
   *     }
   *   ]
   * }
   */
  @Post('bulk')
  @Roles(DiaryRole.TEACHER)
  async bulkUpsertAttendance(@Body() body: any, @Req() req: any) {
    return this.attendanceService.bulkUpsertAttendance({
      lessonId: body.lessonId,
      items: body.items,
      teacherId: req.user.id,
    });
  }
}