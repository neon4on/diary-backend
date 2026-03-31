import { Injectable } from '@nestjs/common';
import { db } from '../db/knex';

@Injectable()
export class JournalService {

  async getJournal(classId: number, subjectId: number) {

    // 1. уроки
    const lessons = await db('diary_lessons')
      .where({
        class_id: classId,
        subject_id: subjectId
      })
      .whereNull('deleted_at')
      .select([
            'id',
            'lesson_date',
            'lesson_topic'
        ])
      .orderBy('lesson_date');

    const lessonIds = lessons.map(l => l.id);

    // 2. ученики (НОРМАЛЬНЫЕ)
    const students = await db('school_local.info_kid_subject_teacher as kst')
        .leftJoin('sso.users as u', 'u.id', 'kst.kid_id')
        .where({
            'kst.class_id': classId,
            'kst.subject_id': subjectId
        })
        .distinct([
            'kst.kid_id as student_id',
            'u.name as fullName'
        ]);

    // 3. оценки
    const grades = lessonIds.length
        ? await db('diary_marks as m')
            .leftJoin('diary_mark_types as mt', 'mt.id', 'm.mark_type_id')
            .whereIn('m.lesson_id', lessonIds)
            .whereNull('m.deleted_at')
            .select([
                'm.lesson_id as lessonId',
                'm.student_id as studentId',
                'mt.code as mark',
                db.raw('CAST(mt.code AS SIGNED) as value')
            ])
            .groupBy('m.lesson_id', 'm.student_id', 'mt.code')
        : [];

    return {
      lessons,
      students,
      grades
    };
  }
}