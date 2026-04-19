import { Injectable } from '@nestjs/common';
import { db } from '../db/knex';

@Injectable()
export class ScheduleService {
  /**
   * Временное решение:
   * берём расписание учителя из school_local.info_current_week
   */
  async getTeacherSchedule(teacherId: number) {
    const rows = await db('school_local.info_current_week as cw')
      .leftJoin('school_local.info_subjects as s', 's.id', 'cw.subject_id')
      .leftJoin('school_local.info_rooms as r', 'r.id', 'cw.room_id')
      .leftJoin('school_local.info_events as e', 'e.id', 'cw.event_id')
      .leftJoin('sso.kaf_name as k', 'k.id', 'cw.class_id')
      .where('cw.teacher_id', teacherId)
      .select([
        'cw.id',
        'cw.week_id',
        'cw.event_id',
        'cw.class_id',
        'k.name as class_name',
        'cw.kid_id as student_id',
        'cw.subject_id',
        'cw.custom_subject_name',
        'cw.teacher_id',
        'cw.room_id',
        'r.name as room_name',
        'cw.is_paid',
        'cw.lesstypes_id as lesson_type_id',

        's.name as subject_name',

        'e.day',
        'e.lesson_number',
        'e.start_time',
        'e.end_time',
      ])
      .orderByRaw(`
        CASE
          WHEN e.day = 'Понедельник' THEN 1
          WHEN e.day = 'Вторник' THEN 2
          WHEN e.day = 'Среда' THEN 3
          WHEN e.day = 'Четверг' THEN 4
          WHEN e.day = 'Пятница' THEN 5
          WHEN e.day = 'Суббота' THEN 6
          WHEN e.day = 'Воскресенье' THEN 7
          ELSE 99
        END
      `)
      .orderBy('e.lesson_number', 'asc')
      .orderBy('cw.id', 'asc');

    const uniqueMap = new Map<string, any>();

    for (const row of rows) {
      const key = [
        row.week_id ?? 'null',
        row.event_id ?? 'null',
        row.class_id ?? 'null',
        row.subject_id ?? 'null',
        row.teacher_id ?? 'null',
        row.room_id ?? 'null',
      ].join(':');

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, {
          id: row.id,
          week_id: row.week_id,
          event_id: row.event_id,

          class_id: row.class_id,
          class_name: row.class_name ?? null,

          subject_id: row.subject_id,
          subject_name:
            row.custom_subject_name ||
            row.subject_name ||
            (row.subject_id ? `Предмет #${row.subject_id}` : null),

          teacher_id: row.teacher_id,

          room_id: row.room_id,
          room_name: row.room_name ?? null,

          is_paid: row.is_paid,
          lesson_type_id: row.lesson_type_id,

          day: row.day,
          lesson_number: row.lesson_number,
          start_time: row.start_time,
          end_time: row.end_time,
        });
      }
    }

    return Array.from(uniqueMap.values());
  }
}