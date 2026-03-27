import { Injectable } from '@nestjs/common';
import { db } from '../db/knex';

@Injectable()
export class GradesService {

    async getByStudent(studentId: number) {
        const grades = await db('diary_marks as m')
            .join('diary_lessons as l', function () {
            this.on('l.id', '=', 'm.lesson_id')
                .andOnNull('l.deleted_at');
            })
            .leftJoin('diary_mark_types as mt', 'mt.id', 'm.mark_type_id')
            .leftJoin('diary_lesson_types as lt', 'lt.id', 'l.lesson_type_id')
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

            db.raw(`
                COALESCE(s.name, CONCAT('Предмет #', l.subject_id)) as subject_name
            `)
            ])

            .orderBy('l.lesson_date', 'desc');

        return this.groupBySubject(grades);
    }

  async getMyHomeworks(studentId: number, classId: number) {
    return db('diary_homeworks as h')
        .join('diary_lessons as l', function () {
        this.on('l.id', '=', 'h.lesson_id')
            .andOnNull('l.deleted_at');
        })
        .join('diary_homework_targets as t', 't.homework_id', 'h.id')
        .leftJoin('school_local.info_subjects as s', 's.id', 'l.subject_id')

        .where(function () {
        this.where('t.student_id', studentId)
            .orWhere('t.class_id', classId);
        })

        .whereNull('h.deleted_at')

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

            db.raw(`
                COALESCE(s.name, CONCAT('Предмет #', l.subject_id)) as subject_name
            `)
        ])
    }

    groupBySubject(grades: any[]) {
        const result: any = {};

        for (const g of grades) {
            const subject = g.subject_name;

            if (!result[subject]) {
            result[subject] = {
                subject,
                grades: [],
                average: null
            };
            }

            result[subject].grades.push(g);
        }

        // считаем средний балл
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

    async getLessonGrades(lessonId: number) {
        // 1. получаем урок
        const lesson = await db('diary_lessons')
            .select('class_id', 'subject_id')
            .where('id', lessonId)
            .first();

        if (!lesson) {
            throw new Error('LESSON_NOT_FOUND');
        }

        const { class_id, subject_id } = lesson;

        // 2. получаем учеников + оценки
        const rows = await db('school_local.info_kid_subject_teacher as kst')
            .leftJoin('diary_marks as m', function () {
            this.on('m.student_id', '=', 'kst.kid_id')
                .andOn('m.lesson_id', '=', db.raw('?', [lessonId]));
            })
            .leftJoin('diary_mark_types as mt', 'mt.id', 'm.mark_type_id')

            .where('kst.class_id', class_id)
            .andWhere('kst.subject_id', subject_id)

            .select([
            'kst.kid_id as student_id',
            'kst.class_id',
            'kst.subject_id',
            'kst.subject_name',

            'm.id as mark_id',
            'm.comment',

            'mt.id as mark_type_id',
            'mt.code as mark',
            'mt.numeric_value'
            ])

            .groupBy('kst.kid_id');

        return {
            lesson: {
            id: lessonId,
            class_id,
            subject_id
            },
            students: rows
        };
    }

    async upsertGrade(dto: {
            lessonId: number;
            studentId: number;
            markTypeId: number;
            comment?: string;
            teacherId: number;
        }) {

        // 1. проверка lock
        const lock = await db('diary_mark_locks')
            .where({ lesson_id: dto.lessonId })
            .whereNotNull('locked_at')
            .first();

        if (lock) {
            throw new Error('MARKS_LOCKED');
        }

        // 2. проверка существующей оценки
        const existing = await db('diary_marks')
            .where({
            lesson_id: dto.lessonId,
            student_id: dto.studentId
            })
            .whereNull('deleted_at')
            .first();

        if (existing) {
            // UPDATE
            await db('diary_marks')
            .where({ id: existing.id })
            .update({
                mark_type_id: dto.markTypeId,
                comment: dto.comment
            });

            return { updated: true };
        }

        // INSERT
        await db('diary_marks').insert({
            lesson_id: dto.lessonId,
            student_id: dto.studentId,
            mark_type_id: dto.markTypeId,
            comment: dto.comment,
            teacher_id: dto.teacherId
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

  // 1. lock check
  const lock = await db('diary_mark_locks')
    .where({ lesson_id: dto.lessonId })
    .whereNotNull('locked_at')
    .first();

  if (lock) {
    throw new Error('MARKS_LOCKED');
  }

  let items: { studentId: number; markTypeId: number }[] = [];

  // режим 1 (одна оценка всем)
  if (dto.studentIds && dto.markTypeId) {
    items = dto.studentIds.map(id => ({
      studentId: id,
      markTypeId: dto.markTypeId!
    }));
  }

  // режим 2 (разные оценки)
  if (dto.grades) {
    items = dto.grades;
  }

  if (!items.length) {
    return { updated: 0 };
  }

  // 2. получаем существующие оценки
  const existing = await db('diary_marks')
    .where('lesson_id', dto.lessonId)
    .whereIn('student_id', items.map(i => i.studentId))
    .whereNull('deleted_at');

  const existingMap = new Map(
    existing.map(e => [e.student_id, e])
  );

  const toInsert: any[] = [];
  const toUpdate: any[] = [];

  for (const item of items) {
    const found = existingMap.get(item.studentId);

    if (found) {
      toUpdate.push({
        id: found.id,
        mark_type_id: item.markTypeId
      });
    } else {
      toInsert.push({
        lesson_id: dto.lessonId,
        student_id: item.studentId,
        mark_type_id: item.markTypeId,
        comment: dto.comment,
        teacher_id: dto.teacherId
      });
    }
  }

  // 3. update
  for (const u of toUpdate) {
    await db('diary_marks')
      .where({ id: u.id })
      .update({
        mark_type_id: u.mark_type_id
      });
  }

  // 4. insert
  if (toInsert.length) {
    await db('diary_marks').insert(toInsert);
  }

  return {
    updated: toUpdate.length,
    created: toInsert.length
  };
}
}