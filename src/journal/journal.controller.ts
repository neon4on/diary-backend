import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JournalService } from './journal.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DiaryRole } from '../common/enums/diary-role.enum';

@UseGuards(AuthGuard, RolesGuard)
@Controller('journal')
export class JournalController {
  constructor(private journalService: JournalService) {}

  /**
   * Учитель / админ — журнал по classId + subjectId
   */
  @Get()
  @Roles(DiaryRole.TEACHER, DiaryRole.ADMIN)
  async getJournal(
    @Query('classId', ParseIntPipe) classId: number,
    @Query('subjectId', ParseIntPipe) subjectId: number,
    @Req() req: any,
  ) {
    return this.journalService.getJournal({
      classId,
      subjectId,
      user: req.user,
    });
  }

  /**
   * Учитель / админ — создать урок
   *
   * Для TEACHER:
   * {
   *   eventId,
   *   classId,
   *   subjectId,
   *   lessonDate,
   *   lessonTopic?,
   *   lessonTypeId?,
   *   status?
   * }
   *
   * Для ADMIN:
   * {
   *   teacherId,
   *   eventId,
   *   classId,
   *   subjectId,
   *   lessonDate,
   *   lessonTopic?,
   *   lessonTypeId?,
   *   status?
   * }
   */
  @Post('lesson')
  @Roles(DiaryRole.TEACHER, DiaryRole.ADMIN)
  async createLesson(@Body() body: any, @Req() req: any) {
    return this.journalService.createLesson({
      eventId: body.eventId,
      classId: body.classId,
      subjectId: body.subjectId,
      lessonDate: body.lessonDate,
      lessonTopic: body.lessonTopic,
      lessonTypeId: body.lessonTypeId,
      status: body.status,
      teacherId: body.teacherId,
      user: req.user,
    });
  }

  /**
   * Учитель / админ — комментарии к уроку
   */
  @Get('lesson-comments/:lessonId')
  @Roles(DiaryRole.TEACHER, DiaryRole.ADMIN)
  async getLessonComments(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Req() req: any,
  ) {
    return this.journalService.getLessonComments(lessonId, req.user);
  }

  /**
   * Учитель / админ — добавить комментарий к уроку
   *
   * Для TEACHER:
   * {
   *   lessonId,
   *   comment
   * }
   *
   * Для ADMIN:
   * {
   *   teacherId,
   *   lessonId,
   *   comment
   * }
   */
  @Post('lesson-comment')
  @Roles(DiaryRole.TEACHER, DiaryRole.ADMIN)
  async addLessonComment(@Body() body: any, @Req() req: any) {
    return this.journalService.addLessonComment({
      lessonId: body.lessonId,
      comment: body.comment,
      teacherId: body.teacherId,
      user: req.user,
    });
  }

  /**
   * Учитель / админ — комментарии по ученикам на уроке
   */
  @Get('student-comments/:lessonId')
  @Roles(DiaryRole.TEACHER, DiaryRole.ADMIN)
  async getStudentComments(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Req() req: any,
  ) {
    return this.journalService.getStudentComments(lessonId, req.user);
  }

  /**
   * Учитель / админ — добавить комментарий ученику на уроке
   *
   * Для TEACHER:
   * {
   *   lessonId,
   *   studentId,
   *   comment
   * }
   *
   * Для ADMIN:
   * {
   *   teacherId,
   *   lessonId,
   *   studentId,
   *   comment
   * }
   */
  @Post('student-comment')
  @Roles(DiaryRole.TEACHER, DiaryRole.ADMIN)
  async addStudentComment(@Body() body: any, @Req() req: any) {
    return this.journalService.addStudentComment({
      lessonId: body.lessonId,
      studentId: body.studentId,
      comment: body.comment,
      teacherId: body.teacherId,
      user: req.user,
    });
  }
}