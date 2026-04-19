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
   * Учитель — оценки по уроку (для журнала)
   */
  @Get('lesson/:id')
  @Roles(DiaryRole.TEACHER)
  async getLessonGrades(
    @Param('id', ParseIntPipe) lessonId: number,
    @Req() req: any,
  ) {
    return this.gradesService.getLessonGrades(lessonId, req.user.id);
  }

  /**
   * Учитель — поставить / обновить оценку
   */
  @Post()
  @Roles(DiaryRole.TEACHER)
  async setGrade(@Body() body: any, @Req() req: any) {
    return this.gradesService.upsertGrade({
      lessonId: body.lessonId,
      studentId: body.studentId,
      markTypeId: body.markTypeId,
      comment: body.comment,
      teacherId: req.user.id,
    });
  }

  /**
   * Учитель — массово поставить / обновить оценки
   */
  @Post('bulk')
  @Roles(DiaryRole.TEACHER)
  async bulkSetGrades(@Body() body: any, @Req() req: any) {
    return this.gradesService.bulkUpsertGrades({
      lessonId: body.lessonId,
      studentIds: body.studentIds,
      markTypeId: body.markTypeId,
      grades: body.grades,
      comment: body.comment,
      teacherId: req.user.id,
    });
  }
}