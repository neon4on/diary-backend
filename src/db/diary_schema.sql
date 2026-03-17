SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =========================
-- LESSON TYPES
-- =========================

CREATE TABLE diary_lesson_types (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    weight DECIMAL(4,2) DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- MARK TYPES
-- =========================

CREATE TABLE diary_mark_types (
    id INT AUTO_INCREMENT PRIMARY KEY,

    code VARCHAR(10) NOT NULL,

    numeric_value SMALLINT,

    description TEXT

) ENGINE=InnoDB;

-- =========================
-- LESSONS
-- =========================

CREATE TABLE diary_lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,

    event_id INT NOT NULL,

    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    class_id INT NOT NULL,

    lesson_date DATE NOT NULL,

    lesson_topic TEXT,

    lesson_type_id INT,

    status VARCHAR(20) DEFAULT 'planned',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    deleted_at TIMESTAMP NULL,

    INDEX idx_lessons_teacher (teacher_id),
    INDEX idx_lessons_class (class_id),
    INDEX idx_lessons_event (event_id),

    CONSTRAINT fk_lesson_type
        FOREIGN KEY (lesson_type_id)
        REFERENCES diary_lesson_types(id)

) ENGINE=InnoDB;

-- =========================
-- MARKS
-- =========================

CREATE TABLE diary_marks (
    id INT AUTO_INCREMENT PRIMARY KEY,

    lesson_id INT NOT NULL,

    student_id INT NOT NULL,

    mark_type_id INT,

    comment TEXT,

    teacher_id INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    deleted_at TIMESTAMP NULL,

    INDEX idx_marks_student (student_id),
    INDEX idx_marks_lesson (lesson_id),

    CONSTRAINT fk_marks_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES diary_lessons(id),

    CONSTRAINT fk_marks_type
        FOREIGN KEY (mark_type_id)
        REFERENCES diary_mark_types(id)

) ENGINE=InnoDB;

-- =========================
-- MARK LOCKS
-- =========================

CREATE TABLE diary_mark_locks (
    id INT AUTO_INCREMENT PRIMARY KEY,

    lesson_id INT NOT NULL,

    locked_at TIMESTAMP,

    locked_by INT,

    CONSTRAINT fk_mark_lock_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES diary_lessons(id)

) ENGINE=InnoDB;

-- =========================
-- ATTENDANCE
-- =========================

CREATE TABLE diary_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,

    lesson_id INT NOT NULL,

    student_id INT NOT NULL,

    status VARCHAR(20) NOT NULL,

    late_minutes SMALLINT,

    comment TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    deleted_at TIMESTAMP NULL,

    INDEX idx_attendance_student (student_id),
    INDEX idx_attendance_lesson (lesson_id),

    CONSTRAINT fk_attendance_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES diary_lessons(id)

) ENGINE=InnoDB;

-- =========================
-- LESSON COMMENTS
-- =========================

CREATE TABLE diary_lesson_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    lesson_id INT NOT NULL,

    teacher_id INT NOT NULL,

    comment TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lesson_comment
        FOREIGN KEY (lesson_id)
        REFERENCES diary_lessons(id)

) ENGINE=InnoDB;

-- =========================
-- STUDENT COMMENTS
-- =========================

CREATE TABLE diary_student_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    lesson_id INT NOT NULL,

    student_id INT NOT NULL,

    teacher_id INT,

    comment TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_student_comment
        FOREIGN KEY (lesson_id)
        REFERENCES diary_lessons(id)

) ENGINE=InnoDB;

-- =========================
-- HOMEWORK
-- =========================

CREATE TABLE diary_homeworks (
    id INT AUTO_INCREMENT PRIMARY KEY,

    lesson_id INT NOT NULL,

    description TEXT NOT NULL,

    due_date DATE,

    resource_link TEXT,

    created_by INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    deleted_at TIMESTAMP NULL,

    INDEX idx_homeworks_lesson (lesson_id),

    CONSTRAINT fk_homework_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES diary_lessons(id)

) ENGINE=InnoDB;

-- =========================
-- HOMEWORK TARGETS
-- =========================

CREATE TABLE diary_homework_targets (
    id INT AUTO_INCREMENT PRIMARY KEY,

    homework_id INT NOT NULL,

    student_id INT,

    class_id INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_homework_target
        FOREIGN KEY (homework_id)
        REFERENCES diary_homeworks(id)

) ENGINE=InnoDB;

-- =========================
-- STUDENT ACTIVITY (GAMIFICATION)
-- =========================

CREATE TABLE diary_student_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,

    student_id INT NOT NULL,

    lesson_id INT,

    activity_type VARCHAR(50),

    points INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_activity_student (student_id),
    INDEX idx_activity_lesson (lesson_id),

    CONSTRAINT fk_activity_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES diary_lessons(id)

) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;