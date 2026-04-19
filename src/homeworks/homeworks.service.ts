import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { db } from '../db/knex';

@Injectable()
export class HomeworksService {
  /**
   * Получить classId ученика
   */
  async getStudentClassId(studentId: number): Promise<number | null> {
    const row = await db('school_local.info_kid_subject_teacher as kst')
      .select('kst.class_id')
      .where('kst.kid_id', studentId)
      .whereNotNull('kst.class_id')
      .orderBy('kst.class_id', 'asc')
      .first();

    return row?.class_id ?? null;
  }

  /**
   * Ученик — получить свои домашки
   */
  async getMyHomeworks(studentId: number) {
    const classId = await this.getStudentClassId(studentId);

    if (!classId) {
      return [];
    }

    const rows = await db('diary.diary_homeworks as h')
      .join('diary.diary_lessons as l', function () {
        this.on('l.id', '=', 'h.lesson_id').andOnNull('l.deleted_at');
      })
      .join('diary.diary_homework_targets as t', 't.homework_id', 'h.id')
      .leftJoin('school_local.info_subjects as s', 's.id', 'l.subject_id')
      .whereNull('h.deleted_at')
      .andWhere(function () {
        this.where('t.student_id', studentId).orWhere('t.class_id', classId);
      })
      .distinct([
        'h.id',
        'h.lesson_id',
        'h.description',
        'h.due_date',
        'h.resource_link',
        'h.created_by',
        'h.created_at',

        'l.lesson_date',
        'l.lesson_topic',
        'l.class_id',
        'l.subject_id',

        db.raw(
          `COALESCE(s.name, CONCAT('Предмет #', l.subject_id)) as subject_name`,
        ),
      ])
      .orderByRaw('h.due_date IS NULL, h.due_date ASC')
      .orderBy('l.lesson_date', 'desc')
      .orderBy('h.id', 'desc');

    return rows;
  }

  /**
   * Получить урок или упасть
   */
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

  /**
   * Проверка, что teacher реально ведёт этот урок
   * через class_id + subject_id
   */
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

  /**
   * Teacher — получить домашки по уроку
   */
  async getLessonHomeworks(lessonId: number, teacherId: number) {
    const lesson = await this.assertTeacherHasLessonAccess(teacherId, lessonId);

    const rows = await db('diary.diary_homeworks as h')
      .leftJoin('diary.diary_homework_targets as t', 't.homework_id', 'h.id')
      .leftJoin('sso.users as u', 'u.id', 't.student_id')
      .where('h.lesson_id', lessonId)
      .whereNull('h.deleted_at')
      .select([
        'h.id',
        'h.lesson_id',
        'h.description',
        'h.due_date',
        'h.resource_link',
        'h.created_by',
        'h.created_at',

        't.id as target_id',
        't.student_id',
        'u.name as student_name',
        't.class_id',
      ])
      .orderBy('h.id', 'desc')
      .orderBy('t.id', 'asc');

    const grouped: Record<string, any> = {};

    for (const row of rows) {
      if (!grouped[row.id]) {
        grouped[row.id] = {
          id: row.id,
          lesson_id: row.lesson_id,
          description: row.description,
          due_date: row.due_date,
          resource_link: row.resource_link,
          created_by: row.created_by,
          created_at: row.created_at,
          targets: [],
        };
      }

      if (row.target_id) {
        grouped[row.id].targets.push({
          id: row.target_id,
          student_id: row.student_id,
          student_name: row.student_name,
          class_id: row.class_id,
        });
      }
    }

    return {
      lesson: {
        id: lesson.id,
        class_id: lesson.class_id,
        subject_id: lesson.subject_id,
        lesson_date: lesson.lesson_date,
        lesson_topic: lesson.lesson_topic,
      },
      homeworks: Object.values(grouped),
    };
  }

  /**
   * Teacher — создать домашку
   */
  async createHomework(dto: {
    lessonId: number;
    description: string;
    dueDate?: string | null;
    resourceLink?: string | null;
    classId?: number | null;
    studentIds?: number[];
    teacherId: number;
  }) {
    const lesson = await this.assertTeacherHasLessonAccess(
      dto.teacherId,
      dto.lessonId,
    );

    if (!dto.description?.trim()) {
      throw new ForbiddenException('HOMEWORK_DESCRIPTION_REQUIRED');
    }

    const hasClassTarget = !!dto.classId;
    const hasStudentTargets = Array.isArray(dto.studentIds) && dto.studentIds.length > 0;

    if (!hasClassTarget && !hasStudentTargets) {
      throw new ForbiddenException('HOMEWORK_TARGET_REQUIRED');
    }

    if (hasClassTarget && hasStudentTargets) {
      throw new ForbiddenException('ONLY_ONE_TARGET_MODE_ALLOWED');
    }

    if (hasClassTarget && dto.classId !== lesson.class_id) {
      throw new ForbiddenException('INVALID_CLASS_TARGET');
    }

    let validStudentIds: number[] = [];

    if (hasStudentTargets) {
      const students = await db('school_local.info_kid_subject_teacher as kst')
        .where('kst.teacher_id', dto.teacherId)
        .andWhere('kst.class_id', lesson.class_id)
        .andWhere('kst.subject_id', lesson.subject_id)
        .whereIn('kst.kid_id', dto.studentIds!)
        .select('kst.kid_id');

      validStudentIds = students.map((s: any) => Number(s.kid_id));

      if (!validStudentIds.length) {
        throw new ForbiddenException('NO_ACCESS_TO_STUDENTS');
      }

      if (validStudentIds.length !== dto.studentIds!.length) {
        throw new ForbiddenException('INVALID_STUDENT_TARGETS');
      }
    }

    return db.transaction(async (trx) => {
      const inserted = await trx('diary.diary_homeworks').insert(
        {
          lesson_id: dto.lessonId,
          description: dto.description.trim(),
          due_date: dto.dueDate ?? null,
          resource_link: dto.resourceLink ?? null,
          created_by: dto.teacherId,
        },
        ['id'],
      );

      let homeworkId: number;

      if (Array.isArray(inserted) && inserted.length && inserted[0]?.id) {
        homeworkId = Number(inserted[0].id);
      } else {
        const row = await trx('diary.diary_homeworks')
          .where({
            lesson_id: dto.lessonId,
            created_by: dto.teacherId,
          })
          .orderBy('id', 'desc')
          .first();

        homeworkId = Number(row.id);
      }

      if (hasClassTarget) {
        await trx('diary.diary_homework_targets').insert({
          homework_id: homeworkId,
          class_id: lesson.class_id,
          student_id: null,
        });
      }

      if (validStudentIds.length) {
        await trx('diary.diary_homework_targets').insert(
          validStudentIds.map((studentId) => ({
            homework_id: homeworkId,
            student_id: studentId,
            class_id: null,
          })),
        );
      }

      return {
        created: true,
        homeworkId,
      };
    });
  }
}