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

import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DiaryRole } from '../common/enums/diary-role.enum';
import { HomeworksService } from './homeworks.service';

@UseGuards(AuthGuard, RolesGuard)
@Controller('homeworks')
export class HomeworksController {
  constructor(private homeworksService: HomeworksService) {}

  @Get('my')
  @Roles(DiaryRole.STUDENT)
  async getMyHomeworks(@Req() req: any) {
    return this.homeworksService.getMyHomeworks(req.user.id);
  }

  /**
   * Учитель / админ — получить домашки по уроку
   */
  @Get('lesson/:id')
  @Roles(DiaryRole.TEACHER, DiaryRole.ADMIN)
  async getLessonHomeworks(
    @Param('id', ParseIntPipe) lessonId: number,
    @Req() req: any,
  ) {
    return this.homeworksService.getLessonHomeworks(lessonId, req.user);
  }

  /**
   * Учитель / админ — создать домашку
   *
   * Для TEACHER:
   * {
   *   lessonId,
   *   description,
   *   dueDate?,
   *   resourceLink?,
   *   classId?
   *   studentIds?
   * }
   *
   * Для ADMIN:
   * {
   *   teacherId,
   *   lessonId,
   *   description,
   *   dueDate?,
   *   resourceLink?,
   *   classId?
   *   studentIds?
   * }
   */
  @Post()
  @Roles(DiaryRole.TEACHER, DiaryRole.ADMIN)
  async createHomework(@Body() body: any, @Req() req: any) {
    return this.homeworksService.createHomework({
      lessonId: body.lessonId,
      description: body.description,
      dueDate: body.dueDate,
      resourceLink: body.resourceLink,
      classId: body.classId,
      studentIds: body.studentIds,
      teacherId: body.teacherId,
      user: req.user,
    });
  }
}