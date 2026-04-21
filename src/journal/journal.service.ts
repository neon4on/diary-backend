import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { db } from '../db/knex';
import { DiaryRole } from '../common/enums/diary-role.enum';

type RequestUser = {
  id: number;
  name?: string;
  roleId: number;
};

@Injectable()
export class JournalService {
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
    user: RequestUser;
  }) {
    if (!this.isAdmin(dto.user)) {
      await this.assertTeacherHasJournalAccess(
        dto.user.id,
        dto.classId,
        dto.subjectId,
      );
    }

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

    const lessonIds = lessons.map((l) => l.id);

    const students = await db('school_local.info_kid_subject_teacher as kst')
      .leftJoin('sso.users as u', 'u.id', 'kst.kid_id')
      .where('kst.class_id', dto.classId)
      .andWhere('kst.subject_id', dto.subjectId)
      .modify((qb) => {
        if (!this.isAdmin(dto.user)) {
          qb.andWhere('kst.teacher_id', dto.user.id);
        }
      })
      .distinct([
        'kst.kid_id as student_id',
        'u.name as fullName',
      ])
      .orderBy('u.name', 'asc');

    const grades = lessonIds.length
      ? await db('diary.diary_marks as m')
          .leftJoin('diary.diary_mark_types as mt', 'mt.id', 'm.mark_type_id')
          .whereIn('m.lesson_id', lessonIds)
          .whereNull('m.deleted_at')
          .select([
            'm.id',
            'm.lesson_id as lessonId',
            'm.student_id as studentId',
            'm.comment',
            'mt.id as markTypeId',
            'mt.code as mark',
            'mt.numeric_value as value',
          ])
      : [];

    const attendance = lessonIds.length
      ? await db('diary.diary_attendance as a')
          .whereIn('a.lesson_id', lessonIds)
          .whereNull('a.deleted_at')
          .select([
            'a.id',
            'a.lesson_id as lessonId',
            'a.student_id as studentId',
            'a.status',
            'a.late_minutes as lateMinutes',
            'a.comment',
          ])
      : [];

    return {
      meta: {
        classId: dto.classId,
        subjectId: dto.subjectId,
        teacherId: dto.user.id,
        isAdmin: this.isAdmin(dto.user),
      },
      lessons,
      students,
      grades,
      attendance,
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
    teacherId?: number;
    user: RequestUser;
  }) {
    const actorTeacherId = this.resolveActorTeacherId(dto.user, dto.teacherId);

    if (!this.isAdmin(dto.user)) {
      await this.assertTeacherHasJournalAccess(
        dto.user.id,
        dto.classId,
        dto.subjectId,
      );
    } else {
      await this.assertTeacherHasJournalAccess(
        actorTeacherId,
        dto.classId,
        dto.subjectId,
      );
    }

    if (!dto.eventId) {
      throw new ForbiddenException('EVENT_ID_REQUIRED');
    }

    if (!dto.lessonDate) {
      throw new ForbiddenException('LESSON_DATE_REQUIRED');
    }

    const insertPayload = {
      event_id: dto.eventId,
      subject_id: dto.subjectId,
      teacher_id: actorTeacherId,
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
          teacher_id: actorTeacherId,
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

  async getLessonComments(lessonId: number, user: RequestUser) {
    const lesson = await this.getLessonOrFail(lessonId);

    if (!this.isAdmin(user)) {
      await this.assertTeacherHasLessonAccess(user.id, lessonId);
    }

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
    teacherId?: number;
    user: RequestUser;
  }) {
    const actorTeacherId = this.resolveActorTeacherId(dto.user, dto.teacherId);
    const lesson = await this.getLessonOrFail(dto.lessonId);

    if (!this.isAdmin(dto.user)) {
      await this.assertTeacherHasLessonAccess(dto.user.id, dto.lessonId);
    } else {
      await this.assertTeacherHasJournalAccess(
        actorTeacherId,
        lesson.class_id,
        lesson.subject_id,
      );
    }

    const comment = String(dto.comment ?? '').trim();

    if (!comment) {
      throw new ForbiddenException('COMMENT_REQUIRED');
    }

    await db('diary.diary_lesson_comments').insert({
      lesson_id: dto.lessonId,
      teacher_id: actorTeacherId,
      comment,
    });

    return {
      created: true,
    };
  }

  async getStudentComments(lessonId: number, user: RequestUser) {
    const lesson = await this.getLessonOrFail(lessonId);

    if (!this.isAdmin(user)) {
      await this.assertTeacherHasLessonAccess(user.id, lessonId);
    }

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
    teacherId?: number;
    user: RequestUser;
  }) {
    const actorTeacherId = this.resolveActorTeacherId(dto.user, dto.teacherId);
    const lesson = await this.getLessonOrFail(dto.lessonId);

    if (!this.isAdmin(dto.user)) {
      await this.assertTeacherHasLessonAccess(dto.user.id, dto.lessonId);
    } else {
      await this.assertTeacherHasJournalAccess(
        actorTeacherId,
        lesson.class_id,
        lesson.subject_id,
      );
    }

    await this.assertTeacherHasStudentAccess(
      actorTeacherId,
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
      teacher_id: actorTeacherId,
      comment,
    });

    return {
      created: true,
    };
  }
}