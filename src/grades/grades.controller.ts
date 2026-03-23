import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  ParseIntPipe
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
    const user = req.user;

    return this.gradesService.getByStudent(user.id);
  }

  /**
   * Учитель — получить оценки по уроку
   */
  @Get('lesson/:id')
  @Roles(DiaryRole.TEACHER)
  async getLessonGrades(
    @Param('id', ParseIntPipe) lessonId: number
  ) {
    return this.gradesService.getLessonGrades(lessonId);
  }

  /**
   * Ученик — домашка
   */
  @Get('homeworks/my')
  async getMyHomeworks(@Req() req: any) {
    const user = req.user;

    // ВРЕМЕННО — пока нет связки student → class
    const classId = 8;

    return this.gradesService.getMyHomeworks(user.id, classId);
  }

}