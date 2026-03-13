# diary_lesson_types

Типы уроков.

Используются для определения веса оценки.

## Поля

| Поле       | Тип       | Описание           |
| ---------- | --------- | ------------------ |
| id         | INT       | ID типа урока      |
| name       | VARCHAR   | название           |
| weight     | DECIMAL   | коэффициент оценки |
| created_at | TIMESTAMP | дата создания      |

## Пример данных

Обычный урок  
Контрольная  
Экзамен

# diary_mark_types

Типы оценок.

## Поля

| Поле          | Тип      | Описание          |
| ------------- | -------- | ----------------- |
| id            | INT      | ID оценки         |
| code          | VARCHAR  | символ оценки     |
| numeric_value | SMALLINT | числовое значение |
| description   | TEXT     | описание          |

## Пример

5  
4  
3  
2  
Н  
Б

# diary_lessons

Журнал уроков.

Каждая запись представляет проведённый урок.

Связан с календарным событием.

## Поля

| Поле           | Тип     | Описание             |
| -------------- | ------- | -------------------- |
| id             | INT     | ID урока             |
| event_id       | INT     | ID события календаря |
| subject_id     | INT     | предмет              |
| teacher_id     | INT     | учитель              |
| class_id       | INT     | класс                |
| lesson_date    | DATE    | дата                 |
| lesson_topic   | TEXT    | тема урока           |
| lesson_type_id | INT     | тип урока            |
| status         | VARCHAR | статус               |

# diary_marks

Оценки учеников.

## Поля

| Поле         | Тип       | Описание     |
| ------------ | --------- | ------------ |
| id           | INT       | ID           |
| lesson_id    | INT       | урок         |
| student_id   | INT       | ученик       |
| mark_type_id | INT       | тип оценки   |
| comment      | TEXT      | комментарий  |
| teacher_id   | INT       | кто поставил |
| created_at   | TIMESTAMP | дата         |

# diary_attendance

Посещаемость учеников.

## Статусы

present  
absent  
late  
excused

# diary_homeworks

Домашние задания.

## Поля

| Поле          | Тип  |
| ------------- | ---- |
| id            | INT  |
| lesson_id     | INT  |
| description   | TEXT |
| due_date      | DATE |
| resource_link | TEXT |

# diary_homework_targets

Назначение домашнего задания.

Домашка может быть:

- всему классу
- конкретному ученику

# diary_mark_locks

Блокировка редактирования оценок.

Если locked_at заполнено — оценки редактировать нельзя.

# diary_student_activity

Система геймификации.

Хранит активность ученика.

Примеры:

ответ на уроке  
домашняя работа  
участие
