import { Controller, Get, UseGuards } from '@nestjs/common';
import { GradesService } from './grades.service';
import { AuthGuard } from '../common/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('grades')
export class GradesController {

  constructor(private gradesService: GradesService) {}

  @Get()
  getGrades() {
    return this.gradesService.getGrades();
  }

}