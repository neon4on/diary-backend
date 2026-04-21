import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { db } from '../db/knex';
import { DiaryRole } from '../common/enums/diary-role.enum';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

type RequestUser = {
  id: number;
  name?: string;
  roleId: number;
};

@Injectable()
export class AttendanceService {
  private isAdmin(user: RequestUser) {
    return user.roleId === DiaryRole.ADMIN;
  }

  private resolveActorTeacherId(user: RequestUser, teacherIdFromBody?: number) {
    if (this.isAdmin(user)) {
      const teacherId = Number(teacherIdFromBody);

      if (!teacherId) {
        throw new ForbiddenException('TEACHER_ID_REQUIRED_FOR_ADMIN');
      }

      return teacherId;
    }

    return user.id;
  }

  private normalizeStatus(status: string): AttendanceStatus {
    const value = String(status ?? '').trim().toLowerCase();

    const allowed: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];

    if (!allowed.includes(value as AttendanceStatus)) {
      throw new ForbiddenException('INVALID_ATTENDANCE_STATUS');
    }

    return value as AttendanceStatus;
  }

  private normalizeLateMinutes(
    status: AttendanceStatus,
    lateMinutes?: number | null,
  ) {
    if (status !== 'late') {
      return null;
    }

    if (lateMinutes == null) {
      return 0;
    }

    const value = Number(lateMinutes);

    if (!Number.isFinite(value) || value < 0) {
      throw new ForbiddenException('INVALID_LATE_MINUTES');
    }

    return Math.trunc(value);
  }

  private async getLessonOrFail(lessonId: number) {
    const lesson = await db('diary.diary_lessons as l')
      .select([
        'l.id',
        'l.class_id',
        'l.subject_id',
        'l.teacher_id',
        'l.lesson_date',
        'l.lesson_topic',
      ])
      .where('l.id', lessonId)
      .whereNull('l.deleted_at')
      .first();

    if (!lesson) {
      throw new NotFoundException('LESSON_NOT_FOUND');
    }

    return lesson;
  }

  private async assertTeacherHasLessonAccess(
    teacherId: number,
    lessonId: number,
  ) {
    const lesson = await this.getLessonOrFail(lessonId);

    const access = await db('school_local.info_kid_subject_teacher as kst')
      .where('kst.teacher_id', teacherId)
      .andWhere('kst.class_id', lesson.class_id)
      .andWhere('kst.subject_id', lesson.subject_id)
      .first();

    if (!access) {
      throw new ForbiddenException('NO_ACCESS_TO_LESSON');
    }

    return lesson;
  }

  private async assertTeacherHasStudentAccess(
    teacherId: number,
    classId: number,
    subjectId: number,
    studentId: number,
  ) {
    const access = await db('school_local.info_kid_subject_teacher as kst')
      .where('kst.teacher_id', teacherId)
      .andWhere('kst.class_id', classId)
      .andWhere('kst.subject_id', subjectId)
      .andWhere('kst.kid_id', studentId)
      .first();

    if (!access) {
      throw new ForbiddenException('NO_ACCESS_TO_STUDENT');
    }
  }

  async getLessonAttendance(lessonId: number, user: RequestUser) {
    const lesson = await this.getLessonOrFail(lessonId);

    if (!this.isAdmin(user)) {
      await this.assertTeacherHasLessonAccess(user.id, lessonId);
    }

    const rows = await db('school_local.info_kid_subject_teacher as kst')
      .leftJoin('sso.users as u', 'u.id', 'kst.kid_id')
      .leftJoin('diary.diary_attendance as a', function () {
        this.on('a.student_id', '=', 'kst.kid_id')
          .andOn('a.lesson_id', '=', db.raw('?', [lessonId]))
          .andOnNull('a.deleted_at');
      })
      .where('kst.class_id', lesson.class_id)
      .andWhere('kst.subject_id', lesson.subject_id)
      .modify((qb) => {
        if (!this.isAdmin(user)) {
          qb.andWhere('kst.teacher_id', user.id);
        }
      })
      .select([
        'kst.kid_id as student_id',
        'u.name as student_name',
        'kst.class_id',
        'kst.class_name',
        'kst.subject_id',
        'kst.subject_name',

        'a.id as attendance_id',
        'a.status',
        'a.late_minutes as lateMinutes',
        'a.comment',
        'a.created_at',
      ])
      .orderBy('u.name', 'asc');

    return {
      lesson: {
        id: lesson.id,
        class_id: lesson.class_id,
        subject_id: lesson.subject_id,
        lesson_date: lesson.lesson_date,
        lesson_topic: lesson.lesson_topic,
      },
      students: rows,
    };
  }

  async upsertAttendance(dto: {
    lessonId: number;
    studentId: number;
    status: string;
    lateMinutes?: number | null;
    comment?: string | null;
    teacherId?: number;
    user: RequestUser;
  }) {
    const actorTeacherId = this.resolveActorTeacherId(dto.user, dto.teacherId);
    const lesson = await this.getLessonOrFail(dto.lessonId);

    if (!this.isAdmin(dto.user)) {
      await this.assertTeacherHasLessonAccess(dto.user.id, dto.lessonId);
    } else {
      const adminTargetAccess = await db('school_local.info_kid_subject_teacher as kst')
        .where('kst.teacher_id', actorTeacherId)
        .andWhere('kst.class_id', lesson.class_id)
        .andWhere('kst.subject_id', lesson.subject_id)
        .first();

      if (!adminTargetAccess) {
        throw new ForbiddenException('INVALID_TEACHER_FOR_LESSON');
      }
    }

    await this.assertTeacherHasStudentAccess(
      actorTeacherId,
      lesson.class_id,
      lesson.subject_id,
      dto.studentId,
    );

    const status = this.normalizeStatus(dto.status);
    const lateMinutes = this.normalizeLateMinutes(status, dto.lateMinutes);

    const existing = await db('diary.diary_attendance')
      .where({
        lesson_id: dto.lessonId,
        student_id: dto.studentId,
      })
      .whereNull('deleted_at')
      .first();

    if (existing) {
      await db('diary.diary_attendance')
        .where({ id: existing.id })
        .update({
          status,
          late_minutes: lateMinutes,
          comment: dto.comment ?? null,
        });

      return { updated: true };
    }

    await db('diary.diary_attendance').insert({
      lesson_id: dto.lessonId,
      student_id: dto.studentId,
      status,
      late_minutes: lateMinutes,
      comment: dto.comment ?? null,
    });

    return { created: true };
  }

  async bulkUpsertAttendance(dto: {
    lessonId: number;
    items?: {
      studentId: number;
      status: string;
      lateMinutes?: number | null;
      comment?: string | null;
    }[];
    teacherId?: number;
    user: RequestUser;
  }) {
    const actorTeacherId = this.resolveActorTeacherId(dto.user, dto.teacherId);
    const lesson = await this.getLessonOrFail(dto.lessonId);

    if (!this.isAdmin(dto.user)) {
      await this.assertTeacherHasLessonAccess(dto.user.id, dto.lessonId);
    } else {
      const adminTargetAccess = await db('school_local.info_kid_subject_teacher as kst')
        .where('kst.teacher_id', actorTeacherId)
        .andWhere('kst.class_id', lesson.class_id)
        .andWhere('kst.subject_id', lesson.subject_id)
        .first();

      if (!adminTargetAccess) {
        throw new ForbiddenException('INVALID_TEACHER_FOR_LESSON');
      }
    }

    const items = Array.isArray(dto.items) ? dto.items : [];

    if (!items.length) {
      return {
        updated: 0,
        created: 0,
      };
    }

    const requestedIds = items.map((i) => Number(i.studentId));

    const allowedStudents = await db('school_local.info_kid_subject_teacher as kst')
      .where('kst.teacher_id', actorTeacherId)
      .andWhere('kst.class_id', lesson.class_id)
      .andWhere('kst.subject_id', lesson.subject_id)
      .whereIn('kst.kid_id', requestedIds)
      .select('kst.kid_id');

    const allowedIds = new Set(
      allowedStudents.map((row: any) => Number(row.kid_id)),
    );

    const filteredItems = items.filter((i) => allowedIds.has(Number(i.studentId)));

    if (!filteredItems.length) {
      throw new ForbiddenException('NO_ACCESS_TO_STUDENTS');
    }

    if (filteredItems.length !== items.length) {
      throw new ForbiddenException('INVALID_STUDENT_TARGETS');
    }

    const existing = await db('diary.diary_attendance')
      .where('lesson_id', dto.lessonId)
      .whereIn(
        'student_id',
        filteredItems.map((i) => Number(i.studentId)),
      )
      .whereNull('deleted_at');

    const existingMap = new Map(
      existing.map((row: any) => [Number(row.student_id), row]),
    );

    const toInsert: any[] = [];
    const toUpdate: any[] = [];

    for (const item of filteredItems) {
      const studentId = Number(item.studentId);
      const status = this.normalizeStatus(item.status);
      const lateMinutes = this.normalizeLateMinutes(status, item.lateMinutes);
      const existingRow = existingMap.get(studentId);

      if (existingRow) {
        toUpdate.push({
          id: existingRow.id,
          status,
          late_minutes: lateMinutes,
          comment: item.comment ?? null,
        });
      } else {
        toInsert.push({
          lesson_id: dto.lessonId,
          student_id: studentId,
          status,
          late_minutes: lateMinutes,
          comment: item.comment ?? null,
        });
      }
    }

    for (const row of toUpdate) {
      await db('diary.diary_attendance')
        .where({ id: row.id })
        .update({
          status: row.status,
          late_minutes: row.late_minutes,
          comment: row.comment,
        });
    }

    if (toInsert.length) {
      await db('diary.diary_attendance').insert(toInsert);
    }

    return {
      updated: toUpdate.length,
      created: toInsert.length,
    };
  }
}