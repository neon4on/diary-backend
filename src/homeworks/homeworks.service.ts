import { Injectable } from '@nestjs/common';
import { db } from '../db/knex';

@Injectable()
export class HomeworksService {

  /**
   * Получить classId ученика
   */
  async getStudentClassId(studentId: number) {
    const row = await db('school_local.info_kid_subject_teacher')
      .select('class_id')
      .where('kid_id', studentId)
      .first();

    return row?.class_id;
  }

  /**
   * Получить домашку
   */
  async getMyHomeworks(studentId: number) {

    const classId = await this.getStudentClassId(studentId);

    if (!classId) {
      return [];
    }

    return db('diary_homeworks as h')
      .join('diary_lessons as l', function () {
        this.on('l.id', '=', 'h.lesson_id')
          .andOnNull('l.deleted_at');
      })
      .join('diary_homework_targets as t', 't.homework_id', 'h.id')

      .where(function () {
        this.where('t.student_id', studentId)
            .orWhere('t.class_id', classId);
      })

      .whereNull('h.deleted_at')

      .select([
        'h.id',
        'h.description',
        'h.due_date',
        'h.resource_link',

        'l.lesson_date',
        'l.lesson_topic',
        'l.subject_id'
      ])

      .orderBy('h.due_date', 'asc');
  }
}