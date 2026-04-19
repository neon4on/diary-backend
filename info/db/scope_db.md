diary diary_attendance InnoDB 3 4 2026-03-12 14:33:34 utf8mb4_general_ci
diary diary_homeworks InnoDB 0 2 2026-03-12 14:33:35 utf8mb4_general_ci
diary diary_homework_targets InnoDB 0 1 2026-03-12 14:33:35 utf8mb4_general_ci
diary diary_lessons InnoDB 0 2 2026-03-12 14:33:34 utf8mb4_general_ci
diary diary_lesson_comments InnoDB 0 1 2026-03-12 14:33:34 utf8mb4_general_ci
diary diary_lesson_types InnoDB 5 6 2026-03-12 14:33:34 utf8mb4_general_ci
diary diary_marks InnoDB 6 7 2026-03-12 14:33:34 utf8mb4_general_ci
diary diary_mark_locks InnoDB 0 1 2026-03-12 14:33:34 utf8mb4_general_ci
diary diary_mark_types InnoDB 6 7 2026-03-12 14:33:34 utf8mb4_general_ci
diary diary_student_activity InnoDB 0 1 2026-03-12 14:33:35 utf8mb4_general_ci
diary diary_student_comments InnoDB 0 1 2026-03-12 14:33:35 utf8mb4_general_ci
diary knex_migrations InnoDB 0 2 2026-02-11 22:05:07 utf8mb4_general_ci
diary knex_migrations_lock InnoDB 0 2 2026-02-11 22:05:07 utf8mb4_general_ci
school_local activity_types InnoDB 6 8 2026-03-07 00:34:36 utf8mb4_general_ci
school_local archive_weeks_schedule InnoDB 0 2025-12-18 11:22:35 utf8mb4_general_ci В целях экономии времени на загрузку расписания на актуальную неделю и прошедшие, уроки будут сохраняться в архив.
school_local curriculum_plans InnoDB 433 456 2026-03-10 10:51:16 2026-04-17 17:12:32 utf8mb4_unicode_ci
school_local info_alarms InnoDB 24 25 2026-03-10 11:42:32 utf8mb4_general_ci
school_local info_base_schedule InnoDB 9874 20971 2026-03-10 17:55:40 2026-04-15 12:01:42 utf8mb4_general_ci Расписание по неделям. Каждая неделя (week_id) - отдельная сущность
school_local info_current_week InnoDB 10161 16386 2026-03-27 14:58:21 2026-04-15 12:01:55 utf8mb4_general_ci Расписание по неделям. Каждая неделя (week_id) - отдельная сущность
school_local info_days InnoDB 5 6 2026-03-10 11:34:13 utf8mb4_general_ci
school_local info_events InnoDB 121 525 2026-03-27 12:53:29 utf8mb4_general_ci Расписание звонков на уроки и перемены в школе.
school_local info_kid_subject_teacher InnoDB 2416 5134 2025-11-07 13:47:24 utf8mb4_general_ci Привязка детей/класса к конкретному учителю. Больше актуально для прогресс-репорта.
school_local info_rooms InnoDB 29 105 2026-03-23 11:17:41 2026-04-17 14:37:37 utf8mb4_general_ci Здесь хранятся кабинеты школы и их ключи для внешнего доступа.
school_local info_subjects InnoDB 81 427 2026-03-07 00:34:36 2026-04-17 14:51:20 utf8mb4_general_ci Список всех предметов, преподаваемых в школе.
school_local info_subjects_types InnoDB 4 5 2026-03-10 12:59:35 utf8mb4_general_ci
school_local lesson_bindings InnoDB 501 3919 2026-04-17 15:39:40 2026-04-17 17:10:52 utf8mb4_general_ci Связки класс-предмет-педагог-кабинет
school_local schedule_audit_log InnoDB 418 419 2026-04-01 00:27:09 2026-04-17 18:38:17 utf8mb4_general_ci
school_local schedule_backups InnoDB 10 11 2026-04-02 23:27:36 2026-04-03 00:11:50 utf8mb4_general_ci
school_local schedule_conflicts InnoDB 5315 164556 2026-04-01 00:11:32 2026-04-17 18:38:17 utf8mb4_general_ci
school_local schedule_entries InnoDB 2742 103506 2026-04-01 00:11:32 2026-04-17 18:38:17 utf8mb4_general_ci
school_local schedule_export_jobs InnoDB 161 165 2026-04-02 00:18:48 2026-04-16 18:11:54 utf8mb4_general_ci
school_local schedule_export_job_errors InnoDB 5 6 2026-04-02 00:18:48 2026-04-02 01:20:45 utf8mb4_general_ci
school_local schedule_publications InnoDB 13 15 2026-04-01 00:11:32 2026-04-17 16:58:34 utf8mb4_general_ci
school_local schedule_student_subject_rooms InnoDB 1 3 2026-04-17 15:39:40 utf8mb4_general_ci
school_local schedule_subject_room_constraints InnoDB 2 5 2026-04-01 13:53:27 2026-04-16 18:22:53 utf8mb4_general_ci
school_local schedule_teacher_profiles InnoDB 3 2026-04-02 23:27:36 2026-04-16 18:08:21 utf8mb4_general_ci
school_local schedule_time_slots InnoDB 60 72 2026-04-01 00:11:32 2026-04-02 00:00:08 utf8mb4_general_ci
school_local schedule_weeks InnoDB 33 44 2026-04-01 00:11:32 2026-04-17 18:38:17 utf8mb4_general_ci
school_local schedule_week_snapshots InnoDB 3 4 2026-04-02 23:27:36 2026-04-03 00:09:29 utf8mb4_general_ci
school_local schedule_week_versions InnoDB 65 80 2026-04-01 00:11:32 2026-04-17 18:38:17 utf8mb4_general_ci
school_local schema_migrations InnoDB 20 2026-03-07 01:29:48 2026-04-17 15:39:40 utf8mb4_general_ci
school_local school_weeks InnoDB 1 58 2025-10-22 22:55:28 utf8mb4_general_ci Учебные недели для расчёта рабочих часов
school_local system_config InnoDB 5 2025-10-22 22:55:29 utf8mb4_general_ci Конфигурация системы
sso info_current_week InnoDB 0 1 2026-03-31 13:22:11 utf8mb4_general_ci
sso kaf_name InnoDB 30 32 2026-04-13 11:16:02 2026-04-13 11:17:18 utf8mb4_general_ci
sso logins InnoDB 292 327 2025-08-17 12:56:30 utf8mb4_general_ci
sso nickname_history InnoDB 0 2 2026-02-25 19:28:46 utf8mb4_general_ci
sso oauth_identities InnoDB 35 51 2026-03-24 14:37:37 2026-04-17 20:20:42 utf8mb4_general_ci
sso parents_kids InnoDB 105 106 2026-04-03 17:14:40 utf8mb4_general_ci Хранит в себе связи между родителями и детьми. Связь многие ко многим, так как у одного пользователя-родителя может быть несколько детей, а у некоторых детей может быть несколько родителей в системе, и каждый родитель должен быть инфомрацию о своих детях под своим аккаунтом.
sso rights InnoDB 1799 3531 2025-12-04 16:51:33 2026-04-17 20:20:42 utf8mb4_general_ci
sso role_name InnoDB 7 2025-08-17 12:45:21 2026-04-02 16:45:42 utf8mb4_general_ci
sso srvs InnoDB 10 12 2025-08-17 14:18:31 utf8mb4_general_ci
sso srvs_roles InnoDB 46 48 2025-09-01 09:43:57 2026-04-03 18:00:53 utf8mb4_general_ci
sso system_config InnoDB 0 2026-03-31 13:22:32 utf8mb4_general_ci
sso users InnoDB 316 689 2026-03-27 14:58:20 2026-04-17 20:20:48 utf8mb4_general_ci
