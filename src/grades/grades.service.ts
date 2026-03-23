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
}