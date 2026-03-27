import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe
} from '@nestjs/common';

import { JournalService } from './journal.service';
import { AuthGuard } from '../common/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('journal')
export class JournalController {

  constructor(private journalService: JournalService) {}

  @Get()
  async getJournal(
    @Query('classId', ParseIntPipe) classId: number,
    @Query('subjectId', ParseIntPipe) subjectId: number
  ) {
    return this.journalService.getJournal(classId, subjectId);
  }
}