import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GradesModule } from './grades/grades.module';
import { ScheduleModule } from './schedule/schedule.module';
import { JournalModule } from './journal/journal.module';
import { HomeworksModule } from './homeworks/homeworks.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    GradesModule,
    ScheduleModule,
    JournalModule,
    HomeworksModule,
  ],
})
export class AppModule {}