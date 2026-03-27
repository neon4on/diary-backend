import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
  Post,
  Body
} from '@nestjs/common';

import { GradesService } from './grades.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DiaryRole } from '../common/enums/diary-role.enum';

@UseGuards(AuthGuard)
@Controller('grades')
export class GradesController {

  constructor(private gradesService: GradesService) {}

  /**
   * Ученик — получить свои оценки
   */
  @Get('my')
  async getMyGrades(@Req() req: any) {
    return this.gradesService.getByStudent(req.user.id);
  }

  /**
   * Учитель — оценки по уроку (для журнала)
   */
  @Get('lesson/:id')
  @Roles(DiaryRole.TEACHER)
  async getLessonGrades(
    @Param('id', ParseIntPipe) lessonId: number
  ) {
    return this.gradesService.getLessonGrades(lessonId);
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
      teacherId: req.user.id
    });
  }

    @Post('bulk')
    @Roles(DiaryRole.TEACHER)
    async bulkSetGrades(@Body() body: any, @Req() req: any) {

    return this.gradesService.bulkUpsertGrades({
        lessonId: body.lessonId,
        studentIds: body.studentIds,
        markTypeId: body.markTypeId,
        grades: body.grades,
        comment: body.comment,
        teacherId: req.user.id
    });
    }
}