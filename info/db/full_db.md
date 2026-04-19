diary diary_attendance 1 id int(11) int NO auto_increment PRI 10 0
diary diary_attendance 2 lesson_id int(11) int NO MUL 10 0
diary diary_attendance 3 student_id int(11) int NO MUL 10 0
diary diary_attendance 4 status varchar(20) varchar NO 20
diary diary_attendance 5 late_minutes smallint(6) smallint YES NULL 5 0
diary diary_attendance 6 comment text text YES NULL 65535
diary diary_attendance 7 created_at timestamp timestamp YES current_timestamp()
diary diary_attendance 8 deleted_at timestamp timestamp YES NULL
diary diary_homeworks 1 id int(11) int NO auto_increment PRI 10 0
diary diary_homeworks 2 lesson_id int(11) int NO MUL 10 0
diary diary_homeworks 3 description text text NO 65535
diary diary_homeworks 4 due_date date date YES NULL
diary diary_homeworks 5 resource_link text text YES NULL 65535
diary diary_homeworks 6 created_by int(11) int YES NULL 10 0
diary diary_homeworks 7 created_at timestamp timestamp YES current_timestamp()
diary diary_homeworks 8 deleted_at timestamp timestamp YES NULL
diary diary_homework_targets 1 id int(11) int NO auto_increment PRI 10 0
diary diary_homework_targets 2 homework_id int(11) int NO MUL 10 0
diary diary_homework_targets 3 student_id int(11) int YES NULL 10 0
diary diary_homework_targets 4 class_id int(11) int YES NULL 10 0
diary diary_homework_targets 5 created_at timestamp timestamp YES current_timestamp()
diary diary_lessons 1 id int(11) int NO auto_increment PRI 10 0
diary diary_lessons 2 event_id int(11) int NO MUL 10 0
diary diary_lessons 3 subject_id int(11) int NO 10 0
diary diary_lessons 4 teacher_id int(11) int NO MUL 10 0
diary diary_lessons 5 class_id int(11) int NO MUL 10 0
diary diary_lessons 6 lesson_date date date NO
diary diary_lessons 7 lesson_topic text text YES NULL 65535
diary diary_lessons 8 lesson_type_id int(11) int YES NULL MUL 10 0
diary diary_lessons 9 status varchar(20) varchar YES 'planned' 20
diary diary_lessons 10 created_at timestamp timestamp YES current_timestamp()
diary diary_lessons 11 updated_at timestamp timestamp YES current_timestamp() on update current_timestamp()
diary diary_lessons 12 deleted_at timestamp timestamp YES NULL
diary diary_lesson_comments 1 id int(11) int NO auto_increment PRI 10 0
diary diary_lesson_comments 2 lesson_id int(11) int NO MUL 10 0
diary diary_lesson_comments 3 teacher_id int(11) int NO 10 0
diary diary_lesson_comments 4 comment text text NO 65535
diary diary_lesson_comments 5 created_at timestamp timestamp YES current_timestamp()
diary diary_lesson_types 1 id int(11) int NO auto_increment PRI 10 0
diary diary_lesson_types 2 name varchar(100) varchar NO 100
diary diary_lesson_types 3 weight decimal(4,2) decimal YES 1.00 4 2
diary diary_lesson_types 4 created_at timestamp timestamp YES current_timestamp()
diary diary_marks 1 id int(11) int NO auto_increment PRI 10 0
diary diary_marks 2 lesson_id int(11) int NO MUL 10 0
diary diary_marks 3 student_id int(11) int NO MUL 10 0
diary diary_marks 4 mark_type_id int(11) int YES NULL MUL 10 0
diary diary_marks 5 comment text text YES NULL 65535
diary diary_marks 6 teacher_id int(11) int YES NULL 10 0
diary diary_marks 7 created_at timestamp timestamp YES current_timestamp()
diary diary_marks 8 deleted_at timestamp timestamp YES NULL
diary diary_mark_locks 1 id int(11) int NO auto_increment PRI 10 0
diary diary_mark_locks 2 lesson_id int(11) int NO MUL 10 0
diary diary_mark_locks 3 locked_at timestamp timestamp YES NULL
diary diary_mark_locks 4 locked_by int(11) int YES NULL 10 0
diary diary_mark_types 1 id int(11) int NO auto_increment PRI 10 0
diary diary_mark_types 2 code varchar(10) varchar NO 10
diary diary_mark_types 3 numeric_value smallint(6) smallint YES NULL 5 0
diary diary_mark_types 4 description text text YES NULL 65535
diary diary_student_activity 1 id int(11) int NO auto_increment PRI 10 0
diary diary_student_activity 2 student_id int(11) int NO MUL 10 0
diary diary_student_activity 3 lesson_id int(11) int YES NULL MUL 10 0
diary diary_student_activity 4 activity_type varchar(50) varchar YES NULL 50
diary diary_student_activity 5 points int(11) int YES 0 10 0
diary diary_student_activity 6 created_at timestamp timestamp YES current_timestamp()
diary diary_student_comments 1 id int(11) int NO auto_increment PRI 10 0
diary diary_student_comments 2 lesson_id int(11) int NO MUL 10 0
diary diary_student_comments 3 student_id int(11) int NO 10 0
diary diary_student_comments 4 teacher_id int(11) int YES NULL 10 0
diary diary_student_comments 5 comment text text YES NULL 65535
diary diary_student_comments 6 created_at timestamp timestamp YES current_timestamp()
diary knex_migrations 1 id int(10) unsigned int NO auto_increment PRI 10 0
diary knex_migrations 2 name varchar(255) varchar YES NULL 255
diary knex_migrations 3 batch int(11) int YES NULL 10 0
diary knex_migrations 4 migration_time timestamp timestamp YES NULL
diary knex_migrations_lock 1 index int(10) unsigned int NO auto_increment PRI 10 0
diary knex_migrations_lock 2 is_locked int(11) int YES NULL 10 0
school_local activity_types 1 id int(11) int NO auto_increment PRI 10 0
school_local activity_types 2 code varchar(64) varchar NO UNI 64
school_local activity_types 3 name varchar(128) varchar NO 128
school_local activity_types 4 description varchar(255) varchar YES NULL 255
school_local activity_types 5 slot_part enum('FULL','H1','H2') enum NO 'FULL' 4
school_local activity_types 6 is_active tinyint(1) tinyint NO 1 3 0
school_local activity_types 7 sort_order int(11) int NO 100 10 0
school_local activity_types 8 created_at timestamp timestamp YES current_timestamp()
school_local activity_types 9 updated_at timestamp timestamp YES current_timestamp() on update current_timestamp()
school_local archive_weeks_schedule 1 id int(11) int YES NULL 10 0
school_local curriculum_plans 1 id bigint(20) unsigned bigint NO auto_increment PRI 20 0
school_local curriculum_plans 2 class_name varchar(50) varchar NO MUL 50
school_local curriculum_plans 3 subj_id int(11) int NO 0 10 0
school_local curriculum_plans 4 subject_name varchar(255) varchar NO MUL 255
school_local curriculum_plans 5 planned_hours_per_week decimal(4,2) decimal NO 0.00 4 2
school_local curriculum_plans 6 notes text text YES NULL 65535
school_local curriculum_plans 7 created_at timestamp timestamp YES current_timestamp()
school_local curriculum_plans 8 updated_at timestamp timestamp YES current_timestamp()
school_local info_alarms 1 id int(11) int NO auto_increment PRI 10 0
school_local info_alarms 2 is_lesson int(11) int YES NULL 10 0
school_local info_alarms 3 start_time varchar(50) varchar YES NULL 50
school_local info_alarms 4 finish_time varchar(50) varchar YES NULL 50
school_local info_base_schedule 1 id int(11) int NO auto_increment PRI 10 0
school_local info_base_schedule 2 event_id int(11) int YES NULL 10 0
school_local info_base_schedule 3 class_id int(11) int YES NULL 10 0
school_local info_base_schedule 4 kid_id int(11) int YES NULL 10 0
school_local info_base_schedule 5 subject_id int(11) int YES NULL 10 0
school_local info_base_schedule 6 teacher_id int(11) int YES NULL 10 0
school_local info_base_schedule 7 room_id int(11) int YES NULL 10 0
school_local info_base_schedule 8 is_paid tinyint(1) tinyint YES 0 3 0 Платный урок: 0 - обычный, 1 - платный
school_local info_base_schedule 9 lesstypes_id tinyint(4) tinyint YES NULL 3 0
school_local info_base_schedule 10 day_id int(11) int YES NULL 10 0
school_local info_base_schedule 11 alarms_id int(11) int YES NULL 10 0
school_local info_current_week 1 id int(11) int NO auto_increment PRI 10 0
school_local info_current_week 2 event_id int(11) int YES NULL 10 0
school_local info_current_week 3 week_id int(11) int YES NULL MUL 10 0
school_local info_current_week 4 class_id int(11) int YES NULL 10 0
school_local info_current_week 5 kid_id int(11) int YES NULL 10 0
school_local info_current_week 6 subject_id int(11) int YES NULL 10 0
school_local info_current_week 7 custom_subject_name varchar(255) varchar YES NULL 255
school_local info_current_week 8 teacher_id int(11) int YES NULL 10 0
school_local info_current_week 9 room_id int(11) int YES NULL MUL 10 0
school_local info_current_week 10 is_paid tinyint(1) tinyint YES 0 3 0 Платный урок: 0 - обычный, 1 - платный
school_local info_current_week 11 lesstypes_id tinyint(4) tinyint YES NULL 3 0
school_local info_days 1 id int(11) int NO auto_increment PRI 10 0
school_local info_days 2 name char(50) char YES NULL 50
school_local info_events 1 day varchar(50) varchar YES NULL 50
school_local info_events 2 lesson_number int(11) int YES NULL 10 0
school_local info_events 3 id int(11) int NO auto_increment PRI 10 0
school_local info_events 4 start_time varchar(50) varchar YES NULL 50
school_local info_events 5 end_time varchar(50) varchar YES NULL 50
school_local info_kid_subject_teacher 1 id int(11) int NO auto_increment PRI 10 0
school_local info_kid_subject_teacher 2 kid_id int(11) int YES 0 MUL 10 0
school_local info_kid_subject_teacher 3 class_id int(11) int YES 0 MUL 10 0
school_local info_kid_subject_teacher 4 subject_id int(11) int YES 0 MUL 10 0
school_local info_kid_subject_teacher 5 teacher_id int(11) int YES 0 MUL 10 0
school_local info_kid_subject_teacher 6 class_name varchar(50) varchar YES NULL 50
school_local info_kid_subject_teacher 7 subject_name varchar(50) varchar YES NULL 50
school_local info_rooms 1 id int(11) int NO auto_increment PRI 10 0
school_local info_rooms 2 name varchar(50) varchar YES NULL 50
school_local info_rooms 3 capacity int(11) int YES NULL 10 0
school_local info_subjects 1 id int(11) int NO auto_increment PRI 10 0
school_local info_subjects 2 name varchar(50) varchar YES NULL 50
school_local info_subjects 3 type int(11) int YES NULL MUL 10 0
school_local info_subjects 4 default_is_paid tinyint(1) tinyint NO 0 3 0
school_local info_subjects_types 1 id int(11) int NO auto_increment PRI 10 0
school_local info_subjects_types 2 name varchar(50) varchar YES NULL 50
school_local lesson_bindings 1 id int(11) int NO auto_increment PRI 10 0
school_local lesson_bindings 2 kaf int(11) int NO MUL 10 0 ID класса
school_local lesson_bindings 3 subject_id int(11) int NO MUL 10 0 Предмет
school_local lesson_bindings 4 teacher_id int(11) int NO MUL 10 0 Учитель
school_local lesson_bindings 5 room_id int(11) int NO MUL 10 0 Кабинет
school_local lesson_bindings 6 is_default tinyint(1) tinyint YES NULL 3 0 Используется по умолчанию
school_local lesson_bindings 7 notes text text YES NULL 65535 Примечания
school_local lesson_bindings 8 created_at timestamp timestamp YES current_timestamp()
school_local lesson_bindings 9 updated_at timestamp timestamp YES current_timestamp() on update current_timestamp()
school_local lesson_bindings 10 default_is_paid tinyint(1) tinyint YES NULL 3 0
school_local lesson_bindings 11 default_lesson_type_id int(11) int YES NULL 10 0
school_local schedule_audit_log 1 id bigint(20) unsigned bigint NO auto_increment PRI 20 0
school_local schedule_audit_log 2 actor varchar(100) varchar NO MUL 100
school_local schedule_audit_log 3 action varchar(80) varchar NO MUL 80
school_local schedule_audit_log 4 entity_type varchar(64) varchar NO MUL 64
school_local schedule_audit_log 5 entity_id bigint(20) unsigned bigint NO 20 0
school_local schedule_audit_log 6 payload_json longtext longtext YES NULL 4294967295
school_local schedule_audit_log 7 created_at timestamp timestamp NO current_timestamp()
school_local schedule_backups 1 id bigint(20) unsigned bigint NO auto_increment PRI 20 0
school_local schedule_backups 2 week_id bigint(20) unsigned bigint YES NULL MUL 20 0
school_local schedule_backups 3 backup_type enum('week','templates','references') enum NO MUL 10
school_local schedule_backups 4 status enum('done','failed') enum NO 'done' MUL 6
school_local schedule_backups 5 label varchar(160) varchar YES NULL 160
school_local schedule_backups 6 records_count int(10) unsigned int NO 0 10 0
school_local schedule_backups 7 result_path varchar(255) varchar YES NULL 255
school_local schedule_backups 8 checksum_sha256 char(64) char YES NULL 64
school_local schedule_backups 9 payload_json longtext longtext YES NULL 4294967295
school_local schedule_backups 10 error_text text text YES NULL 65535
school_local schedule_backups 11 created_by varchar(100) varchar YES NULL 100
school_local schedule_backups 12 created_at timestamp timestamp NO current_timestamp()
school_local schedule_backups 13 updated_at timestamp timestamp NO current_timestamp() on update current_timestamp()
school_local schedule_conflicts 1 id bigint(20) unsigned bigint NO auto_increment PRI 20 0
school_local schedule_conflicts 2 week_version_id bigint(20) unsigned bigint NO MUL 20 0
school_local schedule_conflicts 3 entry_id bigint(20) unsigned bigint YES NULL MUL 20 0
school_local schedule_conflicts 4 severity enum('blocking','warning','info') enum NO 8
school_local schedule_conflicts 5 code varchar(80) varchar NO 80
school_local schedule_conflicts 6 message varchar(255) varchar NO 255
school_local schedule_conflicts 7 details_json longtext longtext YES NULL 4294967295
school_local schedule_conflicts 8 resolved tinyint(1) tinyint NO 0 3 0
school_local schedule_conflicts 9 created_at timestamp timestamp NO current_timestamp()
school_local schedule_conflicts 10 updated_at timestamp timestamp NO current_timestamp() on update current_timestamp()
school_local schedule_entries 1 id bigint(20) unsigned bigint NO auto_increment PRI 20 0
school_local schedule_entries 2 week_version_id bigint(20) unsigned bigint NO MUL 20 0
school_local schedule_entries 3 slot_id bigint(20) unsigned bigint NO MUL 20 0
school_local schedule_entries 4 class_id int(11) int YES NULL 10 0
school_local schedule_entries 5 student_id int(11) int YES NULL 10 0
school_local schedule_entries 6 teacher_id int(11) int YES NULL 10 0
school_local schedule_entries 7 room_id int(11) int YES NULL 10 0
school_local schedule_entries 8 subject_id int(11) int YES NULL 10 0
school_local schedule_entries 9 custom_subject_name varchar(255) varchar YES NULL 255
school_local schedule_entries 10 activity_type varchar(50) varchar YES NULL 50
school_local schedule_entries 11 is_paid tinyint(1) tinyint NO 0 3 0
school_local schedule_entries 12 lesson_type_id int(11) int YES NULL 10 0
school_local schedule_entries 13 notes varchar(255) varchar YES NULL 255
school_local schedule_entries 14 created_at timestamp timestamp NO current_timestamp()
school_local schedule_entries 15 updated_at timestamp timestamp NO current_timestamp() on update current_timestamp()
school_local schedule_export_jobs 1 id bigint(20) unsigned bigint NO auto_increment PRI 20 0
school_local schedule_export_jobs 2 week_id bigint(20) unsigned bigint YES NULL MUL 20 0
school_local schedule_export_jobs 3 publication_id bigint(20) unsigned bigint YES NULL MUL 20 0
school_local schedule_export_jobs 4 export_type varchar(64) varchar NO 64
school_local schedule_export_jobs 5 status enum('queued','running','done','failed') enum NO 'queued' MUL 7
school_local schedule_export_jobs 6 payload_json longtext longtext YES NULL 4294967295
school_local schedule_export_jobs 7 result_path varchar(255) varchar YES NULL 255
school_local schedule_export_jobs 8 error_text text text YES NULL 65535
school_local schedule_export_jobs 9 attempt_count int(10) unsigned int NO 0 10 0
school_local schedule_export_jobs 10 max_attempts int(10) unsigned int NO 3 10 0
school_local schedule_export_jobs 11 next_retry_at timestamp timestamp YES NULL
school_local schedule_export_jobs 12 last_attempt_at timestamp timestamp YES NULL
school_local schedule_export_jobs 13 created_at timestamp timestamp NO current_timestamp()
school_local schedule_export_jobs 14 updated_at timestamp timestamp NO current_timestamp() on update current_timestamp()
school_local schedule_export_job_errors 1 id bigint(20) unsigned bigint NO auto_increment PRI 20 0
school_local schedule_export_job_errors 2 job_id bigint(20) unsigned bigint NO MUL 20 0
school_local schedule_export_job_errors 3 attempt_no int(10) unsigned int NO 10 0
school_local schedule_export_job_errors 4 error_text text text NO 65535
school_local schedule_export_job_errors 5 created_at timestamp timestamp NO current_timestamp()
school_local schedule_publications 1 id bigint(20) unsigned bigint NO auto_increment PRI 20 0
school_local schedule_publications 2 week_id bigint(20) unsigned bigint NO MUL 20 0
school_local schedule_publications 3 published_version_id bigint(20) unsigned bigint NO MUL 20 0
school_local schedule_publications 4 published_by varchar(100) varchar YES NULL 100
school_local schedule_publications 5 publish_summary_json longtext longtext YES NULL 4294967295
school_local schedule_publications 6 is_current tinyint(1) tinyint NO 1 3 0
school_local schedule_publications 7 published_at timestamp timestamp NO current_timestamp()
school_local schedule_student_subject_rooms 1 id bigint(20) unsigned bigint NO auto_increment PRI 20 0
school_local schedule_student_subject_rooms 2 student_id int(11) int NO MUL 10 0
school_local schedule_student_subject_rooms 3 subject_id int(11) int NO MUL 10 0
school_local schedule_student_subject_rooms 4 room_id int(11) int NO MUL 10 0
school_local schedule_student_subject_rooms 5 created_at timestamp timestamp YES current_timestamp()
school_local schedule_student_subject_rooms 6 updated_at timestamp timestamp YES current_timestamp() on update current_timestamp()
school_local schedule_subject_room_constraints 1 id bigint(20) unsigned bigint NO auto_increment PRI 20 0
school_local schedule_subject_room_constraints 2 subject_id int(11) int NO MUL 10 0
school_local schedule_subject_room_constraints 3 room_id int(11) int NO MUL 10 0
school_local schedule_subject_room_constraints 4 created_at timestamp timestamp YES current_timestamp()
school_local schedule_subject_room_constraints 5 updated_at timestamp timestamp YES current_timestamp() on update current_timestamp()
school_local schedule_teacher_profiles 1 teacher_id int(11) int NO PRI 10 0
school_local schedule_teacher_profiles 2 employment_type enum('salary','hourly','mixed') enum NO 'salary' MUL 6
school_local schedule_teacher_profiles 3 weekly_norm_hours decimal(5,2) decimal NO 0.00 5 2
school_local schedule_teacher_profiles 4 salary_weekly_rate decimal(12,2) decimal NO 0.00 12 2
school_local schedule_teacher_profiles 5 hourly_rate decimal(10,2) decimal NO 0.00 10 2
school_local schedule_teacher_profiles 6 additional_hourly_rate decimal(10,2) decimal NO 0.00 10 2
school_local schedule_teacher_profiles 7 paid_lesson_rate decimal(10,2) decimal NO 0.00 10 2
school_local schedule_teacher_profiles 8 updated_by varchar(100) varchar YES NULL 100
school_local schedule_teacher_profiles 9 updated_at timestamp timestamp NO current_timestamp() on update current_timestamp()
school_local schedule_time_slots 1 id bigint(20) unsigned bigint NO auto_increment PRI 20 0
school_local schedule_time_slots 2 day_of_week tinyint(3) unsigned tinyint NO MUL 3 0
school_local schedule_time_slots 3 slot_number tinyint(3) unsigned tinyint NO 3 0
school_local schedule_time_slots 4 start_time time time NO
school_local schedule_time_slots 5 end_time time time NO
school_local schedule_time_slots 6 label varchar(80) varchar YES NULL 80
school_local schedule_time_slots 7 is_active tinyint(1) tinyint NO 1 MUL 3 0
school_local schedule_time_slots 8 created_at timestamp timestamp NO current_timestamp()
school_local schedule_weeks 1 id bigint(20) unsigned bigint NO auto_increment PRI 20 0
school_local schedule_weeks 2 week_start date date NO MUL
school_local schedule_weeks 3 week_end date date NO
school_local schedule_weeks 4 status enum('template','draft','review','published','archived') enum NO 'draft' MUL 9
school_local schedule_weeks 5 label varchar(120) varchar YES NULL 120
school_local schedule_weeks 6 source_week_id bigint(20) unsigned bigint YES NULL MUL 20 0
school_local schedule_weeks 7 created_at timestamp timestamp NO current_timestamp()
school_local schedule_weeks 8 updated_at timestamp timestamp NO current_timestamp() on update current_timestamp()
school_local schedule_week_snapshots 1 id bigint(20) unsigned bigint NO auto_increment PRI 20 0
school_local schedule_week_snapshots 2 week_id bigint(20) unsigned bigint NO MUL 20 0
school_local schedule_week_snapshots 3 source_version_id bigint(20) unsigned bigint NO MUL 20 0
school_local schedule_week_snapshots 4 source_version_state enum('draft','published') enum NO 9
school_local schedule_week_snapshots 5 label varchar(160) varchar YES NULL 160
school_local schedule_week_snapshots 6 entries_count int(10) unsigned int NO 0 10 0
school_local schedule_week_snapshots 7 checksum_sha256 char(64) char NO 64
school_local schedule_week_snapshots 8 payload_json longtext longtext NO 4294967295
school_local schedule_week_snapshots 9 created_by varchar(100) varchar YES NULL 100
school_local schedule_week_snapshots 10 created_at timestamp timestamp NO current_timestamp()
school_local schedule_week_versions 1 id bigint(20) unsigned bigint NO auto_increment PRI 20 0
school_local schedule_week_versions 2 week_id bigint(20) unsigned bigint NO MUL 20 0
school_local schedule_week_versions 3 version_no int(11) int NO 10 0
school_local schedule_week_versions 4 state enum('draft','published') enum NO 9
school_local schedule_week_versions 5 is_active tinyint(1) tinyint NO 0 3 0
school_local schedule_week_versions 6 base_version_id bigint(20) unsigned bigint YES NULL MUL 20 0
school_local schedule_week_versions 7 created_by varchar(100) varchar YES NULL 100
school_local schedule_week_versions 8 summary_json longtext longtext YES NULL 4294967295
school_local schedule_week_versions 9 created_at timestamp timestamp NO current_timestamp()
school_local schema_migrations 1 id varchar(191) varchar NO PRI 191
school_local schema_migrations 2 description varchar(255) varchar NO 255
school_local schema_migrations 3 applied_at timestamp timestamp NO current_timestamp()
school_local school_weeks 1 id int(11) int NO auto_increment PRI 10 0
school_local school_weeks 2 week_number int(11) int NO 10 0 Номер недели в учебном году (1-40)
school_local school_weeks 3 week_start date date NO MUL Дата начала недели (понедельник)
school_local school_weeks 4 week_end date date NO Дата окончания недели (воскресенье)
school_local school_weeks 5 month int(11) int NO 10 0 Месяц (1-12)
school_local school_weeks 6 year int(11) int NO MUL 10 0 Год
school_local school_weeks 7 is_active tinyint(1) tinyint YES 1 MUL 3 0 Активная неделя для отображения
school_local school_weeks 8 status enum('current','draft','archived') enum YES 'draft' 8
school_local school_weeks 9 label varchar(100) varchar YES NULL 100 Название недели, например "1-7 сентября"
school_local school_weeks 10 created_at timestamp timestamp YES current_timestamp()
school_local school_weeks 11 updated_at timestamp timestamp YES current_timestamp() on update current_timestamp()
school_local system_config 1 config_key varchar(100) varchar NO PRI 100
school_local system_config 2 config_value text text YES NULL 65535
school_local system_config 3 description text text YES NULL 65535
school_local system_config 4 updated_at timestamp timestamp YES current_timestamp() on update current_timestamp()
sso info_current_week 1 id bigint(20) unsigned bigint NO auto_increment PRI 20 0
sso info_current_week 2 event_id bigint(20) unsigned bigint NO 20 0
sso info_current_week 3 kid_id int(11) int NO MUL 10 0
sso info_current_week 4 class_id int(11) int YES NULL 10 0
sso info_current_week 5 subject_id int(11) int YES NULL 10 0
sso info_current_week 6 custom_subject_name varchar(255) varchar YES NULL 255
sso info_current_week 7 teacher_id int(11) int YES NULL 10 0
sso info_current_week 8 room_id int(11) int YES NULL 10 0
sso info_current_week 9 week_id int(11) int NO MUL 10 0
sso info_current_week 10 is_paid tinyint(1) tinyint NO 0 3 0
sso info_current_week 11 lesstypes_id int(11) int NO 1 10 0
sso kaf_name 1 id int(11) int NO auto_increment PRI 10 0
sso kaf_name 2 type tinyint(4) tinyint YES NULL 3 0
sso kaf_name 3 name varchar(50) varchar YES NULL 50
sso kaf_name 4 order int(11) int YES NULL 10 0
sso logins 1 id int(11) int NO auto_increment PRI 10 0
sso logins 2 srvs_id tinyint(4) tinyint YES NULL MUL 3 0
sso logins 3 usr_id int(11) int YES NULL MUL 10 0
sso logins 4 login varchar(100) varchar YES NULL 100
sso logins 5 pass varchar(100) varchar YES NULL 100
sso nickname_history 1 id bigint(20) bigint NO auto_increment PRI 19 0
sso nickname_history 2 user_id int(11) int NO MUL 10 0
sso nickname_history 3 nickname varchar(32) varchar NO 32
sso nickname_history 4 nickname_normalized varchar(32) varchar NO MUL 32
sso nickname_history 5 released_at datetime datetime YES NULL
sso nickname_history 6 reserved_until datetime datetime YES NULL
sso nickname_history 7 reason varchar(32) varchar NO 'changed' 32
sso nickname_history 8 created_at datetime datetime NO current_timestamp()
sso oauth_identities 1 id bigint(20) bigint NO auto_increment PRI 19 0
sso oauth_identities 2 user_id int(11) int NO MUL 10 0
sso oauth_identities 3 provider varchar(32) varchar NO MUL 32
sso oauth_identities 4 provider_uid varchar(191) varchar NO 191
sso oauth_identities 5 provider_email varchar(255) varchar YES NULL 255
sso oauth_identities 6 provider_email_verified tinyint(1) tinyint NO 0 3 0
sso oauth_identities 7 provider_login varchar(191) varchar YES NULL 191
sso oauth_identities 8 profile_first_name varchar(100) varchar YES NULL 100
sso oauth_identities 9 profile_last_name varchar(100) varchar YES NULL 100
sso oauth_identities 10 profile_gender varchar(32) varchar YES NULL 32
sso oauth_identities 11 profile_photo_url varchar(512) varchar YES NULL 512
sso oauth_identities 12 raw_profile_json longtext longtext YES NULL 4294967295
sso oauth_identities 13 apple_refresh_token_enc text text YES NULL 65535
sso oauth_identities 14 apple_token_client_id varchar(255) varchar YES NULL 255
sso oauth_identities 15 last_provider_sync_at datetime datetime YES NULL
sso oauth_identities 16 last_login_at datetime datetime YES NULL
sso oauth_identities 17 created_at datetime datetime NO current_timestamp()
sso oauth_identities 18 updated_at datetime datetime NO current_timestamp() on update current_timestamp()
sso parents_kids 1 id int(11) int NO auto_increment PRI 10 0
sso parents_kids 2 parent_id int(11) int NO 0 MUL 10 0
sso parents_kids 3 kid_id int(11) int NO 0 MUL 10 0
sso rights 1 id int(11) int NO auto_increment PRI 10 0
sso rights 2 usr_id int(11) int NO 0 MUL 10 0
sso rights 3 srv_id tinyint(4) tinyint YES NULL MUL 3 0
sso rights 4 role_id tinyint(4) tinyint YES NULL MUL 3 0
sso role_name 1 id tinyint(4) tinyint NO 0 PRI 3 0
sso role_name 2 name varchar(50) varchar YES NULL 50
sso srvs 1 id tinyint(4) tinyint NO auto_increment PRI 3 0
sso srvs 2 types tinyint(4) tinyint NO 0 3 0
sso srvs 3 name varchar(50) varchar YES NULL 50
sso srvs_roles 1 id int(11) int NO auto_increment PRI 10 0
sso srvs_roles 2 srvs_id tinyint(4) tinyint YES NULL MUL 3 0
sso srvs_roles 3 role_id tinyint(4) tinyint YES NULL MUL 3 0
sso system_config 1 config_key varchar(191) varchar NO PRI 191
sso system_config 2 config_value varchar(1024) varchar YES NULL 1024
sso system_config 3 updated_at timestamp timestamp NO current_timestamp() on update current_timestamp()
sso users 1 id int(11) int NO auto_increment PRI 10 0
sso users 2 name varchar(200) varchar YES NULL 200
sso users 3 nickname varchar(50) varchar YES NULL 50
sso users 4 msgnickname varchar(32) varchar YES NULL 32
sso users 5 msgnickname_normalized varchar(32) varchar YES NULL UNI 32
sso users 6 kaf int(11) int YES NULL MUL 10 0
sso users 7 type tinyint(4) tinyint YES NULL MUL 3 0
sso users 8 hours_per_week int(11) int YES NULL 10 0
sso users 9 status tinyint(4) tinyint YES 0 3 0
sso users 10 lifecycle_state varchar(32) varchar NO 'active' MUL 32
sso users 11 deletion_requested_at datetime datetime YES NULL
sso users 12 deletion_started_at datetime datetime YES NULL
sso users 13 deleted_at datetime datetime YES NULL
sso users 14 allow_discovery_outside_harmony tinyint(1) tinyint NO 0 3 0
sso users 15 last_nickname_change_at datetime datetime YES NULL
sso users 16 avatar_url_custom varchar(512) varchar YES NULL 512
sso users 17 display_name_custom varchar(200) varchar YES NULL 200
sso users 18 pin varchar(10) varchar YES NULL UNI 10
sso users 19 tg_id int(11) int YES NULL MUL 10 0
