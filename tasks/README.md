# Tasks Directory

Эта папка содержит детальные задачи для реализации функций проекта Best of Exmoor, основанные на [PRD документе](../docs/PRD.md).

## Структура задач

Каждая задача - это отдельный самодостаточный файл в формате Markdown, содержащий все необходимое для реализации.

### Приоритеты

- **P0** - Критично для MVP, требует немедленной реализации
- **P1** - Важно для production-ready версии
- **P2** - Nice-to-have функции, можно отложить

## Список задач

### В процессе (In Progress) - P0-P1

1. **TASK-0001: Code Splitting and Lazy Loading** [P0]
   - Оптимизация размера бандла и загрузки
   - Цель: <200KB основной бандл, <2s загрузка
   - Статус: `planned`

2. **TASK-0002: SEO Meta Tags** [P1]
   - Open Graph, Twitter Cards для всех страниц
   - Улучшение видимости в поиске и социалках
   - Статус: `planned`

3. **TASK-0003: Error Boundary** [P1]
   - Graceful обработка ошибок
   - Предотвращение крашей приложения
   - Статус: `planned`

4. **TASK-0004: Loading States** [P1]
   - Skeleton screens, спиннеры, плавные переходы
   - Улучшение perceived performance
   - Статус: `planned`
   - Зависимость: TASK-0001

### Будущие функции (Future) - P2

5. **TASK-0005: Advanced Property Filtering** [P2]
   - Фильтры по цене, удобствам, комнатам
   - Улучшение поиска недвижимости
   - Статус: `planned`

6. **TASK-0006: Email Notifications** [P2]
   - Booking confirmations, payment receipts
   - Требует backend integration
   - Статус: `planned`

7. **TASK-0007: Analytics Dashboard** [P2]
   - Метрики для владельцев недвижимости
   - Revenue, occupancy, bookings charts
   - Статус: `planned`

## Как работать с задачами

### Шаг 1: Выбрать задачу
Выберите задачу по приоритету (P0 > P1 > P2) и проверьте зависимости.

### Шаг 2: Прочитать детали
Каждая задача содержит:
- **High-Level Objective** - что нужно сделать
- **Context Plan** - какие файлы читать/создавать
- **Low-Level Steps** - пошаговая инструкция
- **Acceptance Criteria** - когда задача завершена
- **Testing Strategy** - как тестировать

### Шаг 3: Выполнить
Следуйте шагам из секции "Low-Level Steps". Код примеры уже готовы.

### Шаг 4: Тестировать
Используйте "Testing Strategy" и "Acceptance Criteria" для проверки.

### Шаг 5: Обновить статус
После завершения обновите:
```markdown
status: "done"
```

## Порядок выполнения (рекомендуемый)

### Фаза 1: Performance & UX (P0-P1)
```
1. TASK-0001 (Code Splitting) → 2-3 дня
2. TASK-0004 (Loading States) → 1-2 дня (параллельно с #1)
3. TASK-0003 (Error Boundary) → 1 день
4. TASK-0002 (SEO) → 1-2 дня
```

**Итого: 5-8 дней**

### Фаза 2: Features (P2)
```
5. TASK-0005 (Filtering) → 3-4 дня
6. TASK-0006 (Emails) → 3-5 дней (требует backend)
7. TASK-0007 (Analytics) → 4-6 дней (требует backend)
```

**Итого: 10-15 дней**

## Зависимости между задачами

```
TASK-0001 (Code Splitting)
    ↓ (LoadingFallback component)
TASK-0004 (Loading States)

Остальные задачи независимы
```

## Что уже готово (из PRD)

✅ Migrated from CRA to Vite
✅ React 19 with TanStack Query
✅ Tailwind CSS с кастомной темой
✅ React Router v7
✅ Axios HTTP client
✅ Property pages & booking flow
✅ Payment processing
✅ Owner portal
✅ Google Maps integration
✅ Playwright E2E tests

## Советы

### Для AI ассистента
При работе с задачей:
1. Прочитайте весь файл задачи полностью
2. Добавьте в контекст файлы из "Context Plan - Beginning"
3. Следуйте "Low-Level Steps" строго по порядку
4. Используйте готовые примеры кода из задачи
5. Проверяйте "Acceptance Criteria" после каждого шага

### Для разработчика
- Начинайте с P0 задач
- Читайте "Background/Context" для понимания зачем нужна фича
- "Types & Interfaces" содержат готовые TypeScript определения
- "Notes/Links" содержат полезные ссылки на документацию

## Создание новых задач

Если нужно добавить новую задачу:
1. Используйте шаблон из `code - templates/workflows/task-template.md`
2. Присвойте следующий номер (TASK-0008, TASK-0009, etc.)
3. Заполните все секции подробно
4. Добавьте в этот README
5. Укажите зависимости если есть

## Вопросы?

- Обратитесь к [PRD](../docs/PRD.md) для общего понимания проекта
- Смотрите [ADR](../docs/ADR.md) для архитектурных решений
- Проверьте [CHANGELOG](../docs/CHANGELOG.md) для истории изменений

---

**Последнее обновление:** 2025-10-28
**Всего задач:** 7
**Статус:** All planned, ready for execution
