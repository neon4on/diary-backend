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
   * Учитель — журнал по classId + subjectId
   */
  @Get()
  @Roles(DiaryRole.TEACHER)
  async getJournal(
    @Query('classId', ParseIntPipe) classId: number,
    @Query('subjectId', ParseIntPipe) subjectId: number,
    @Req() req: any,
  ) {
    return this.journalService.getJournal({
      classId,
      subjectId,
      teacherId: req.user.id,
    });
  }

  /**
   * Учитель — создать урок
   * body:
   * {
   *   eventId: number,
   *   classId: number,
   *   subjectId: number,
   *   lessonDate: string,
   *   lessonTopic?: string,
   *   lessonTypeId?: number,
   *   status?: string
   * }
   */
  @Post('lesson')
  @Roles(DiaryRole.TEACHER)
  async createLesson(@Body() body: any, @Req() req: any) {
    return this.journalService.createLesson({
      eventId: body.eventId,
      classId: body.classId,
      subjectId: body.subjectId,
      lessonDate: body.lessonDate,
      lessonTopic: body.lessonTopic,
      lessonTypeId: body.lessonTypeId,
      status: body.status,
      teacherId: req.user.id,
    });
  }

  /**
   * Учитель — комментарии к уроку
   */
  @Get('lesson-comments/:lessonId')
  @Roles(DiaryRole.TEACHER)
  async getLessonComments(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Req() req: any,
  ) {
    return this.journalService.getLessonComments(lessonId, req.user.id);
  }

  /**
   * Учитель — добавить комментарий к уроку
   * body:
   * {
   *   lessonId: number,
   *   comment: string
   * }
   */
  @Post('lesson-comment')
  @Roles(DiaryRole.TEACHER)
  async addLessonComment(@Body() body: any, @Req() req: any) {
    return this.journalService.addLessonComment({
      lessonId: body.lessonId,
      comment: body.comment,
      teacherId: req.user.id,
    });
  }

  /**
   * Учитель — комментарии по ученикам на уроке
   */
  @Get('student-comments/:lessonId')
  @Roles(DiaryRole.TEACHER)
  async getStudentComments(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Req() req: any,
  ) {
    return this.journalService.getStudentComments(lessonId, req.user.id);
  }

  /**
   * Учитель — добавить комментарий ученику на уроке
   * body:
   * {
   *   lessonId: number,
   *   studentId: number,
   *   comment: string
   * }
   */
  @Post('student-comment')
  @Roles(DiaryRole.TEACHER)
  async addStudentComment(@Body() body: any, @Req() req: any) {
    return this.journalService.addStudentComment({
      lessonId: body.lessonId,
      studentId: body.studentId,
      comment: body.comment,
      teacherId: req.user.id,
    });
  }
}