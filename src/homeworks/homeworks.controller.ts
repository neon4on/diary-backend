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
   * Учитель — получить домашки по уроку
   */
  @Get('lesson/:id')
  @Roles(DiaryRole.TEACHER)
  async getLessonHomeworks(
    @Param('id', ParseIntPipe) lessonId: number,
    @Req() req: any,
  ) {
    return this.homeworksService.getLessonHomeworks(lessonId, req.user.id);
  }

  /**
   * Учитель — создать домашку
   *
   * Варианты:
   * 1) на весь класс:
   * {
   *   lessonId,
   *   description,
   *   dueDate,
   *   resourceLink,
   *   classId
   * }
   *
   * 2) конкретным ученикам:
   * {
   *   lessonId,
   *   description,
   *   dueDate,
   *   resourceLink,
   *   studentIds: [1,2,3]
   * }
   */
  @Post()
  @Roles(DiaryRole.TEACHER)
  async createHomework(@Body() body: any, @Req() req: any) {
    return this.homeworksService.createHomework({
      lessonId: body.lessonId,
      description: body.description,
      dueDate: body.dueDate,
      resourceLink: body.resourceLink,
      classId: body.classId,
      studentIds: body.studentIds,
      teacherId: req.user.id,
    });
  }
}