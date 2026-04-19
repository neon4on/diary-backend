import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { db } from '../db/knex';

@Injectable()
export class JournalService {
  private async assertTeacherHasJournalAccess(
    teacherId: number,
    classId: number,
    subjectId: number,
  ) {
    const access = await db('school_local.info_kid_subject_teacher as kst')
      .where('kst.teacher_id', teacherId)
      .andWhere('kst.class_id', classId)
      .andWhere('kst.subject_id', subjectId)
      .first();

    if (!access) {
      throw new ForbiddenException('NO_ACCESS_TO_JOURNAL');
    }
  }

  private async getLessonOrFail(lessonId: number) {
    const lesson = await db('diary.diary_lessons as l')
      .select([
        'l.id',
        'l.event_id',
        'l.subject_id',
        'l.teacher_id',
        'l.class_id',
        'l.lesson_date',
        'l.lesson_topic',
        'l.lesson_type_id',
        'l.status',
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

    await this.assertTeacherHasJournalAccess(
      teacherId,
      lesson.class_id,
      lesson.subject_id,
    );

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

  async getJournal(dto: {
    classId: number;
    subjectId: number;
    teacherId: number;
  }) {
    await this.assertTeacherHasJournalAccess(
      dto.teacherId,
      dto.classId,
      dto.subjectId,
    );

    const lessons = await db('diary.diary_lessons as l')
      .leftJoin('diary.diary_lesson_types as lt', 'lt.id', 'l.lesson_type_id')
      .where('l.class_id', dto.classId)
      .andWhere('l.subject_id', dto.subjectId)
      .whereNull('l.deleted_at')
      .select([
        'l.id',
        'l.event_id',
        'l.lesson_date',
        'l.lesson_topic',
        'l.lesson_type_id',
        'lt.name as lesson_type_name',
        'lt.weight as lesson_type_weight',
        'l.status',
        'l.created_at',
        'l.updated_at',
      ])
      .orderBy('l.lesson_date', 'asc')
      .orderBy('l.id', 'asc');

    const students = await db('school_local.info_kid_subject_teacher as kst')
      .leftJoin('sso.users as u', 'u.id', 'kst.kid_id')
      .where('kst.teacher_id', dto.teacherId)
      .andWhere('kst.class_id', dto.classId)
      .andWhere('kst.subject_id', dto.subjectId)
      .distinct([
        'kst.kid_id as student_id',
        'u.name as fullName',
      ])
      .orderBy('u.name', 'asc');

    return {
      meta: {
        classId: dto.classId,
        subjectId: dto.subjectId,
        teacherId: dto.teacherId,
      },
      lessons,
      students,
    };
  }

  async createLesson(dto: {
    eventId: number;
    classId: number;
    subjectId: number;
    lessonDate: string;
    lessonTopic?: string;
    lessonTypeId?: number | null;
    status?: string | null;
    teacherId: number;
  }) {
    await this.assertTeacherHasJournalAccess(
      dto.teacherId,
      dto.classId,
      dto.subjectId,
    );

    if (!dto.eventId) {
      throw new ForbiddenException('EVENT_ID_REQUIRED');
    }

    if (!dto.lessonDate) {
      throw new ForbiddenException('LESSON_DATE_REQUIRED');
    }

    const insertPayload = {
      event_id: dto.eventId,
      subject_id: dto.subjectId,
      teacher_id: dto.teacherId,
      class_id: dto.classId,
      lesson_date: dto.lessonDate,
      lesson_topic: dto.lessonTopic?.trim() || null,
      lesson_type_id: dto.lessonTypeId ?? null,
      status: dto.status?.trim() || 'planned',
    };

    const inserted = await db('diary.diary_lessons').insert(insertPayload, ['id']);

    let lessonId: number | null = null;

    if (Array.isArray(inserted) && inserted.length && inserted[0]?.id) {
      lessonId = Number(inserted[0].id);
    }

    if (!lessonId) {
      const row = await db('diary.diary_lessons')
        .where({
          event_id: dto.eventId,
          subject_id: dto.subjectId,
          teacher_id: dto.teacherId,
          class_id: dto.classId,
          lesson_date: dto.lessonDate,
        })
        .orderBy('id', 'desc')
        .first();

      lessonId = Number(row?.id);
    }

    return {
      created: true,
      lessonId,
    };
  }

  async getLessonComments(lessonId: number, teacherId: number) {
    const lesson = await this.assertTeacherHasLessonAccess(teacherId, lessonId);

    const comments = await db('diary.diary_lesson_comments as lc')
      .leftJoin('sso.users as u', 'u.id', 'lc.teacher_id')
      .where('lc.lesson_id', lessonId)
      .select([
        'lc.id',
        'lc.lesson_id',
        'lc.teacher_id',
        'u.name as teacher_name',
        'lc.comment',
        'lc.created_at',
      ])
      .orderBy('lc.created_at', 'asc')
      .orderBy('lc.id', 'asc');

    return {
      lesson: {
        id: lesson.id,
        class_id: lesson.class_id,
        subject_id: lesson.subject_id,
        lesson_date: lesson.lesson_date,
        lesson_topic: lesson.lesson_topic,
      },
      comments,
    };
  }

  async addLessonComment(dto: {
    lessonId: number;
    comment: string;
    teacherId: number;
  }) {
    await this.assertTeacherHasLessonAccess(dto.teacherId, dto.lessonId);

    const comment = String(dto.comment ?? '').trim();

    if (!comment) {
      throw new ForbiddenException('COMMENT_REQUIRED');
    }

    await db('diary.diary_lesson_comments').insert({
      lesson_id: dto.lessonId,
      teacher_id: dto.teacherId,
      comment,
    });

    return {
      created: true,
    };
  }

  async getStudentComments(lessonId: number, teacherId: number) {
    const lesson = await this.assertTeacherHasLessonAccess(teacherId, lessonId);

    const comments = await db('diary.diary_student_comments as sc')
      .leftJoin('sso.users as su', 'su.id', 'sc.student_id')
      .leftJoin('sso.users as tu', 'tu.id', 'sc.teacher_id')
      .where('sc.lesson_id', lessonId)
      .select([
        'sc.id',
        'sc.lesson_id',
        'sc.student_id',
        'su.name as student_name',
        'sc.teacher_id',
        'tu.name as teacher_name',
        'sc.comment',
        'sc.created_at',
      ])
      .orderBy('su.name', 'asc')
      .orderBy('sc.created_at', 'asc')
      .orderBy('sc.id', 'asc');

    return {
      lesson: {
        id: lesson.id,
        class_id: lesson.class_id,
        subject_id: lesson.subject_id,
        lesson_date: lesson.lesson_date,
        lesson_topic: lesson.lesson_topic,
      },
      comments,
    };
  }

  async addStudentComment(dto: {
    lessonId: number;
    studentId: number;
    comment: string;
    teacherId: number;
  }) {
    const lesson = await this.assertTeacherHasLessonAccess(
      dto.teacherId,
      dto.lessonId,
    );

    await this.assertTeacherHasStudentAccess(
      dto.teacherId,
      lesson.class_id,
      lesson.subject_id,
      dto.studentId,
    );

    const comment = String(dto.comment ?? '').trim();

    if (!comment) {
      throw new ForbiddenException('COMMENT_REQUIRED');
    }

    await db('diary.diary_student_comments').insert({
      lesson_id: dto.lessonId,
      student_id: dto.studentId,
      teacher_id: dto.teacherId,
      comment,
    });

    return {
      created: true,
    };
  }
}