import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GradesModule } from './grades/grades.module';
import { ScheduleModule } from './schedule/schedule.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    GradesModule,
    ScheduleModule,
  ],
})
export class AppModule {}