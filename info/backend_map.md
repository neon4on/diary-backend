Auth
POST /auth/pin — логин по PIN
GET /auth/me — текущий пользователь
POST /auth/logout — логаут
Grades
GET /grades/my — ученик смотрит свои оценки
GET /grades/lesson/:id — teacher смотрит оценки по уроку
POST /grades — teacher ставит/обновляет оценку одному ученику
POST /grades/bulk — teacher массово ставит/обновляет оценки
Homeworks
GET /homeworks/my — ученик смотрит свои домашки
GET /homeworks/lesson/:id — teacher смотрит домашки по уроку
POST /homeworks — teacher создаёт домашку на класс или адресно ученикам
Attendance
GET /attendance/lesson/:id — teacher смотрит посещаемость по уроку
POST /attendance — teacher ставит/обновляет attendance одному ученику
POST /attendance/bulk — teacher массово ставит/обновляет attendance
Journal
GET /journal?classId=...&subjectId=... — teacher открывает журнал по классу и предмету
POST /journal/lesson — teacher создаёт урок
GET /journal/lesson-comments/:lessonId — комментарии к уроку
POST /journal/lesson-comment — добавить комментарий к уроку
GET /journal/student-comments/:lessonId — комментарии по ученикам
POST /journal/student-comment — добавить комментарий по ученику
