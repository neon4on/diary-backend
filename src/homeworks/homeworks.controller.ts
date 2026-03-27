import {
  Controller,
  Get,
  Req,
  UseGuards
} from '@nestjs/common';

import { AuthGuard } from '../common/guards/auth.guard';
import { HomeworksService } from './homeworks.service';

@UseGuards(AuthGuard)
@Controller('homeworks')
export class HomeworksController {

  constructor(private homeworksService: HomeworksService) {}

  @Get('my')
  async getMyHomeworks(@Req() req: any) {
    return this.homeworksService.getMyHomeworks(req.user.id);
  }
}