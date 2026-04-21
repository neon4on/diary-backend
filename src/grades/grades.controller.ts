import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
  Post,
  Body,
} from '@nestjs/common';

import { GradesService } from './grades.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DiaryRole } from '../common/enums/diary-role.enum';

@UseGuards(AuthGuard, RolesGuard)
@Controller('grades')
export class GradesController {
  constructor(private gradesService: GradesService) {}

  /**
   * Ученик — получить свои оценки
   */
  @Get('my')
  @Roles(DiaryRole.STUDENT)
  async getMyGrades(@Req() req: any) {
    return this.gradesService.getByStudent(req.user.id);
  }

  /**
   * Учитель / админ — оценки по уроку
   */
  @Get('lesson/:id')
  @Roles(DiaryRole.TEACHER, DiaryRole.ADMIN)
  async getLessonGrades(
    @Param('id', ParseIntPipe) lessonId: number,
    @Req() req: any,
  ) {
    return this.gradesService.getLessonGrades(lessonId, req.user);
  }

  /**
   * Учитель / админ — поставить / обновить оценку
   *
   * Для TEACHER:
   * {
   *   lessonId,
   *   studentId,
   *   markTypeId,
   *   comment?
   * }
   *
   * Для ADMIN:
   * {
   *   lessonId,
   *   studentId,
   *   markTypeId,
   *   comment?,
   *   teacherId
   * }
   */
  @Post()
  @Roles(DiaryRole.TEACHER, DiaryRole.ADMIN)
  async setGrade(@Body() body: any, @Req() req: any) {
    return this.gradesService.upsertGrade({
      lessonId: body.lessonId,
      studentId: body.studentId,
      markTypeId: body.markTypeId,
      comment: body.comment,
      teacherId: body.teacherId,
      user: req.user,
    });
  }

  /**
   * Учитель / админ — массово поставить / обновить оценки
   *
   * Для TEACHER:
   * {
   *   lessonId,
   *   studentIds?,
   *   markTypeId?,
   *   grades?,
   *   comment?
   * }
   *
   * Для ADMIN:
   * {
   *   lessonId,
   *   studentIds?,
   *   markTypeId?,
   *   grades?,
   *   comment?,
   *   teacherId
   * }
   */
  @Post('bulk')
  @Roles(DiaryRole.TEACHER, DiaryRole.ADMIN)
  async bulkSetGrades(@Body() body: any, @Req() req: any) {
    return this.gradesService.bulkUpsertGrades({
      lessonId: body.lessonId,
      studentIds: body.studentIds,
      markTypeId: body.markTypeId,
      grades: body.grades,
      comment: body.comment,
      teacherId: body.teacherId,
      user: req.user,
    });
  }
}