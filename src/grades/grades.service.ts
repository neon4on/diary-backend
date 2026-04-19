import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { db } from '../db/knex';

@Injectable()
export class GradesService {
  async getByStudent(studentId: number) {
    const grades = await db('diary.diary_marks as m')
      .join('diary.diary_lessons as l', function () {
        this.on('l.id', '=', 'm.lesson_id').andOnNull('l.deleted_at');
      })
      .leftJoin('diary.diary_mark_types as mt', 'mt.id', 'm.mark_type_id')
      .leftJoin('diary.diary_lesson_types as lt', 'lt.id', 'l.lesson_type_id')
      .leftJoin('school_local.info_subjects as s', 's.id', 'l.subject_id')
      .where('m.student_id', studentId)
      .whereNull('m.deleted_at')
      .select([
        'm.id',
        'm.comment',
        'm.created_at',

        'l.id as lesson_id',
        'l.lesson_date',
        'l.lesson_topic',
        'l.class_id',

        'mt.code as mark',
        'mt.numeric_value',

        'lt.name as lesson_type',
        'lt.weight',

        db.raw(
          `COALESCE(s.name, CONCAT('Предмет #', l.subject_id)) as subject_name`,
        ),
      ])
      .orderBy('l.lesson_date', 'desc');

    return this.groupBySubject(grades);
  }

  private groupBySubject(grades: any[]) {
    const result: any = {};

    for (const g of grades) {
      const subject = g.subject_name;

      if (!result[subject]) {
        result[subject] = {
          subject,
          grades: [],
          average: null,
        };
      }

      result[subject].grades.push(g);
    }

    for (const subject of Object.keys(result)) {
      const gradesList = result[subject].grades;

      let sum = 0;
      let weightSum = 0;

      for (const g of gradesList) {
        if (!g.numeric_value) continue;

        const w = g.weight || 1;

        sum += g.numeric_value * w;
        weightSum += w;
      }

      result[subject].average =
        weightSum ? +(sum / weightSum).toFixed(2) : null;
    }

    return Object.values(result);
  }

  private async getLessonOrFail(lessonId: number) {
    const lesson = await db('diary.diary_lessons as l')
      .select([
        'l.id',
        'l.class_id',
        'l.subject_id',
        'l.teacher_id',
        'l.lesson_date',
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

  async getLessonGrades(lessonId: number, teacherId: number) {
    const lesson = await this.assertTeacherHasLessonAccess(teacherId, lessonId);

    const rows = await db('school_local.info_kid_subject_teacher as kst')
      .leftJoin('sso.users as u', 'u.id', 'kst.kid_id')
      .leftJoin('diary.diary_marks as m', function () {
        this.on('m.student_id', '=', 'kst.kid_id')
          .andOn('m.lesson_id', '=', db.raw('?', [lessonId]))
          .andOnNull('m.deleted_at');
      })
      .leftJoin('diary.diary_mark_types as mt', 'mt.id', 'm.mark_type_id')
      .where('kst.teacher_id', teacherId)
      .andWhere('kst.class_id', lesson.class_id)
      .andWhere('kst.subject_id', lesson.subject_id)
      .select([
        'kst.kid_id as student_id',
        'u.name as student_name',
        'kst.class_id',
        'kst.class_name',
        'kst.subject_id',
        'kst.subject_name',

        'm.id as mark_id',
        'm.comment',

        'mt.id as mark_type_id',
        'mt.code as mark',
        'mt.numeric_value',
      ])
      .orderBy('u.name', 'asc');

    return {
      lesson: {
        id: lesson.id,
        class_id: lesson.class_id,
        subject_id: lesson.subject_id,
        lesson_date: lesson.lesson_date,
      },
      students: rows,
    };
  }

  async upsertGrade(dto: {
    lessonId: number;
    studentId: number;
    markTypeId: number;
    comment?: string;
    teacherId: number;
  }) {
    const lesson = await this.assertTeacherHasLessonAccess(
      dto.teacherId,
      dto.lessonId,
    );

    const studentAccess = await db('school_local.info_kid_subject_teacher as kst')
      .where('kst.teacher_id', dto.teacherId)
      .andWhere('kst.class_id', lesson.class_id)
      .andWhere('kst.subject_id', lesson.subject_id)
      .andWhere('kst.kid_id', dto.studentId)
      .first();

    if (!studentAccess) {
      throw new ForbiddenException('NO_ACCESS_TO_STUDENT');
    }

    const lock = await db('diary.diary_mark_locks')
      .where({ lesson_id: dto.lessonId })
      .whereNotNull('locked_at')
      .first();

    if (lock) {
      throw new ForbiddenException('MARKS_LOCKED');
    }

    const existing = await db('diary.diary_marks')
      .where({
        lesson_id: dto.lessonId,
        student_id: dto.studentId,
      })
      .whereNull('deleted_at')
      .first();

    if (existing) {
      await db('diary.diary_marks')
        .where({ id: existing.id })
        .update({
          mark_type_id: dto.markTypeId,
          comment: dto.comment ?? null,
        });

      return { updated: true };
    }

    await db('diary.diary_marks').insert({
      lesson_id: dto.lessonId,
      student_id: dto.studentId,
      mark_type_id: dto.markTypeId,
      comment: dto.comment ?? null,
      teacher_id: dto.teacherId,
    });

    return { created: true };
  }

  async bulkUpsertGrades(dto: {
    lessonId: number;
    studentIds?: number[];
    markTypeId?: number;
    grades?: { studentId: number; markTypeId: number }[];
    comment?: string;
    teacherId: number;
  }) {
    const lesson = await this.assertTeacherHasLessonAccess(
      dto.teacherId,
      dto.lessonId,
    );

    const lock = await db('diary.diary_mark_locks')
      .where({ lesson_id: dto.lessonId })
      .whereNotNull('locked_at')
      .first();

    if (lock) {
      throw new ForbiddenException('MARKS_LOCKED');
    }

    let items: { studentId: number; markTypeId: number }[] = [];

    // режим: одна и та же оценка пачке учеников
    if (dto.studentIds?.length && dto.markTypeId) {
      items = dto.studentIds.map((studentId) => ({
        studentId,
        markTypeId: dto.markTypeId!,
      }));
    }

    // режим: разные оценки разным ученикам
    if (dto.grades?.length) {
      items = dto.grades;
    }

    if (!items.length) {
      return {
        updated: 0,
        created: 0,
      };
    }

    const allowedStudents = await db('school_local.info_kid_subject_teacher as kst')
      .where('kst.teacher_id', dto.teacherId)
      .andWhere('kst.class_id', lesson.class_id)
      .andWhere('kst.subject_id', lesson.subject_id)
      .whereIn(
        'kst.kid_id',
        items.map((i) => i.studentId),
      )
      .select('kst.kid_id');

    const allowedIds = new Set(
      allowedStudents.map((row: any) => Number(row.kid_id)),
    );

    const filteredItems = items.filter((i) => allowedIds.has(i.studentId));

    if (!filteredItems.length) {
      throw new ForbiddenException('NO_ACCESS_TO_STUDENTS');
    }

    const existing = await db('diary.diary_marks')
      .where('lesson_id', dto.lessonId)
      .whereIn(
        'student_id',
        filteredItems.map((i) => i.studentId),
      )
      .whereNull('deleted_at');

    const existingMap = new Map(
      existing.map((row: any) => [Number(row.student_id), row]),
    );

    const toInsert: any[] = [];
    const toUpdate: any[] = [];

    for (const item of filteredItems) {
      const found = existingMap.get(item.studentId);

      if (found) {
        toUpdate.push({
          id: found.id,
          mark_type_id: item.markTypeId,
          comment: dto.comment ?? null,
        });
      } else {
        toInsert.push({
          lesson_id: dto.lessonId,
          student_id: item.studentId,
          mark_type_id: item.markTypeId,
          comment: dto.comment ?? null,
          teacher_id: dto.teacherId,
        });
      }
    }

    for (const u of toUpdate) {
      await db('diary.diary_marks')
        .where({ id: u.id })
        .update({
          mark_type_id: u.mark_type_id,
          comment: u.comment,
        });
    }

    if (toInsert.length) {
      await db('diary.diary_marks').insert(toInsert);
    }

    return {
      updated: toUpdate.length,
      created: toInsert.length,
    };
  }
}