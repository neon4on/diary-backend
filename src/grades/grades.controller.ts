import { Controller, Get, UseGuards } from '@nestjs/common';
import { GradesService } from './grades.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { Req } from '@nestjs/common';

@UseGuards(AuthGuard)
@Controller('grades')
export class GradesController {

    constructor(private gradesService: GradesService) {}

    @Get('my')
    getMyGrades(@Req() req: any) {
        return this.gradesService.getByStudent(req.user.id);
    }

    @Get('homeworks/my')
    getMyHomeworks(@Req() req: any) {
        const studentId = req.user.id;

        const classId = 8; // временно

        return this.gradesService.getMyHomeworks(studentId, classId);
    }
}