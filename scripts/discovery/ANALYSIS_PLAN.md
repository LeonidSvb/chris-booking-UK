# План анализа базы данных BookingBrain
## Максимизация доходов клиента

**Дата:** 30 октября 2025
**Бюджет:** Discovery phase - $300
**Размер базы:** 3 GB MySQL (78 таблиц)
**Период данных:** 2016-2025 (9+ лет)

---

## 📊 Бизнес-модель (выводы из структуры БД)

### Основной бизнес
**Платформа бронирования недвижимости** (vacation rentals) - аналог Airbnb/Booking.com для UK региона

### Источники дохода
1. **Комиссии с бронирований**
   - Модели: `owner` (100% с владельца), `split` (делится с клиентом)
   - Обрабатываются в `commission_refunds`, `archived_payment_summaries`

2. **Комиссии за обработку платежей**
   - `card_processing_fee` (2-3% от транзакции)
   - Интеграции: SagePay, PayPal, Bank Transfer

3. **Дополнительные сборы**
   - Security deposits
   - Extra charges (собаки, дрова, детские кроватки)

4. **Маркетинг и интеграции** (потенциальный доход)
   - Google Ads (партнерские отчисления)
   - Affiliate программа
   - Listing fees от владельцев

### Дополнительный бизнес
**Справочник ресторанов** (`eat_pages`) - потенциальная монетизация через:
- Платные листинги
- Реклама
- Партнерские программы

---

## 🎯 Стратегия анализа (поэтапная)

### ФАЗА 1: Локальная установка MySQL (КРИТИЧНО)
**Почему:** 3GB нельзя анализировать без БД, загрузка в Supabase дорогая

**Действия:**
1. Установить MySQL Community Edition или MariaDB
2. Создать локальную базу `bookingbrain_analysis`
3. Импортировать дамп: `mysql -u root bookingbrain_analysis < localhost.sql`

**Время:** 30-60 минут
**Стоимость:** Бесплатно

---

### ФАЗА 2: Анализ revenue streams (источников дохода)

#### 2.1 Комиссионные доходы
**Таблицы:** `archived_payment_summaries`, `commission_refunds`, `booking_vouchers`

**SQL запросы:**
```sql
-- Общий объем бронирований по годам
SELECT
  YEAR(created) as year,
  COUNT(*) as total_bookings,
  SUM(amount_total) as total_revenue,
  AVG(amount_total) as avg_booking_value
FROM archived_payment_summaries
GROUP BY YEAR(created)
ORDER BY year DESC;

-- Топ объектов недвижимости по доходу
SELECT
  property_title,
  COUNT(*) as bookings_count,
  SUM(amount_total) as total_revenue
FROM archived_payment_summaries
WHERE status = 'paid'
GROUP BY property_title
ORDER BY total_revenue DESC
LIMIT 20;

-- Анализ комиссий
SELECT
  commission_type,
  COUNT(*) as count,
  SUM(voucher_amount) as total_commission
FROM booking_vouchers
GROUP BY commission_type;
```

**Вопросы для ответа:**
- Какой средний чек бронирования?
- Какие объекты генерируют больше всего дохода?
- Какая модель комиссий выгоднее (owner vs split)?
- Тренд роста/падения бронирований по годам?

---

#### 2.2 Эффективность скидок и ваучеров
**Таблицы:** `discounts`, `booking_vouchers`, `early_bird_discounts`, `late_availbility_discounts`, `length_stay_discounts`

**SQL запросы:**
```sql
-- ROI скидок: сколько дали, сколько получили взамен
SELECT
  bv.discount_type,
  COUNT(DISTINCT bv.propertyrequest_id) as bookings_with_voucher,
  SUM(bv.voucher_amount) as total_discount_given,
  SUM(aps.amount_total) as total_revenue_generated,
  (SUM(aps.amount_total) - SUM(bv.voucher_amount)) as net_revenue
FROM booking_vouchers bv
JOIN archived_payment_summaries aps
  ON bv.propertyrequest_id = aps.property_request_id
GROUP BY bv.discount_type;

-- Какие скидки привели к наибольшему конверсии
SELECT
  discount_type,
  valid_for,
  COUNT(*) as times_used,
  AVG(voucher_amount) as avg_discount
FROM booking_vouchers
WHERE discount_applied = 'yes'
GROUP BY discount_type, valid_for
ORDER BY times_used DESC;
```

**Вопросы:**
- Какие типы скидок приносят больше бронирований?
- Early bird vs late availability - что эффективнее?
- Оптимальный процент скидки для конверсии?

---

#### 2.3 Анализ источников бронирований
**Таблицы:** `archived_payment_summaries` (поле `booked_site`)

**SQL запросы:**
```sql
-- Распределение по источникам
SELECT
  booked_site,
  COUNT(*) as bookings,
  SUM(amount_total) as revenue,
  AVG(amount_total) as avg_value
FROM archived_payment_summaries
WHERE booked_site IS NOT NULL
GROUP BY booked_site
ORDER BY revenue DESC;

-- Рост каналов по месяцам
SELECT
  DATE_FORMAT(created, '%Y-%m') as month,
  booked_site,
  COUNT(*) as bookings
FROM archived_payment_summaries
GROUP BY month, booked_site
ORDER BY month DESC;
```

**Вопросы:**
- Какой канал самый прибыльный?
- Где стоит увеличить маркетинговые вложения?
- Есть ли неиспользуемые каналы?

---

#### 2.4 Интеграции с OTA (Airbnb, HomeAway, Booking.com)
**Таблицы:** `airbnb_comments`, `hosthub_mapping_properties`, `ical_urls`

**SQL запросы:**
```sql
-- Сколько объектов интегрировано с Airbnb
SELECT COUNT(DISTINCT property_id) FROM hosthub_mapping_properties;

-- Анализ импортированных цен из внешних систем
SELECT
  channel,
  COUNT(*) as price_updates,
  AVG(price) as avg_price
FROM import_prices
GROUP BY channel;
```

**Вопросы:**
- Сколько % недвижимости интегрировано?
- Можно ли автоматизировать больше?
- Есть ли потери из-за ручной работы?

---

#### 2.5 Анализ платежных методов
**Таблицы:** `archived_payment_summaries`

**SQL запросы:**
```sql
-- Распределение методов оплаты
SELECT
  payment_via,
  COUNT(*) as transactions,
  SUM(amount_paid) as total_paid,
  AVG(card_processing_fee) as avg_fee
FROM archived_payment_summaries
WHERE payment_via IS NOT NULL
GROUP BY payment_via;

-- Стоимость обработки платежей
SELECT
  SUM(card_processing_fee) as total_fees,
  SUM(amount_total) as total_revenue,
  (SUM(card_processing_fee) / SUM(amount_total) * 100) as fee_percentage
FROM archived_payment_summaries
WHERE card_processing_fee IS NOT NULL;
```

**Вопросы:**
- Какой метод оплаты дешевле?
- Можно ли снизить комиссии процессинга?
- Стоит ли добавить новые методы (Stripe, Crypto)?

---

### ФАЗА 3: Возможности монетизации ресторанов

**Таблицы:** `eat_pages`, `eat_establishments`, `eatreview_logs`

**SQL запросы:**
```sql
-- Сколько ресторанов в базе
SELECT COUNT(*) as total_restaurants FROM eat_pages;

-- Активность обновлений
SELECT
  YEAR(created) as year,
  COUNT(*) as updates
FROM eatreview_logs
GROUP BY year;
```

**Идеи монетизации:**
1. Платные premium листинги для ресторанов
2. Promoted pins на карте
3. Партнерская программа с доставкой еды
4. Рекламные баннеры
5. Интеграция бронирования столиков (комиссия)

---

### ФАЗА 4: Выявление "утечек" доходов

#### 4.1 Отмененные бронирования
**Таблица:** `archived_property_requests` (поле `cancel_booking`)

**SQL запросы:**
```sql
-- Анализ отмен
SELECT
  YEAR(cancel_date) as year,
  COUNT(*) as cancelled_bookings,
  SUM(total_price) as lost_revenue,
  AVG(return_amount) as avg_refund
FROM archived_property_requests
WHERE cancel_booking = 'yes'
GROUP BY year;

-- Причины отмен (через notes)
SELECT
  notes,
  COUNT(*) as count
FROM archived_property_requests
WHERE cancel_booking = 'yes' AND notes IS NOT NULL
GROUP BY notes
LIMIT 20;
```

**Вопросы:**
- Почему клиенты отменяют?
- Можно ли ужесточить политику отмены?
- Предложить страховку отмены?

---

#### 4.2 Неполные платежи (deposit vs full payment)
**SQL запросы:**
```sql
-- Сколько бронирований застряли на депозите
SELECT
  paid_status,
  COUNT(*) as count,
  SUM(amount_due) as outstanding_amount
FROM archived_property_requests
GROUP BY paid_status;
```

**Вопросы:**
- Есть ли просроченные платежи?
- Нужны ли автоматические напоминания?

---

### ФАЗА 5: Конкурентный анализ и ценообразование

#### 5.1 Динамическое ценообразование
**Таблицы:** `custom_nightly_prices`, `import_prices`

**SQL запросы:**
```sql
-- Анализ сезонности цен
SELECT
  MONTH(start_date) as month,
  AVG(price) as avg_price,
  COUNT(*) as custom_prices_set
FROM custom_nightly_prices
GROUP BY month
ORDER BY month;
```

**Вопросы:**
- Используется ли динамическое ценообразование?
- Можно ли внедрить ML для оптимизации цен?

---

## 💡 Рекомендации по инструментам

### Для анализа данных:
1. **MySQL Workbench** - визуальные запросы
2. **DBeaver** - универсальный клиент БД
3. **Metabase** - BI дашборды (open source)
4. **Python + pandas** - для сложной аналитики

### Для визуализации:
1. **Google Data Studio** (бесплатно)
2. **Tableau Public** (бесплатно)
3. **Apache Superset** (open source)

---

## 📈 Ожидаемые результаты анализа

### Быстрые wins (quick wins):
1. **Оптимизация скидок** - убрать неэффективные
2. **Снижение комиссий процессинга** - переход на выгодные провайдеры
3. **Автоматизация напоминаний** - снизить % неполных платежей
4. **Ужесточение политики отмен** - снизить потери

### Средняя перспектива:
1. **Монетизация ресторанов** - новый источник дохода
2. **Улучшение маркетинга** - фокус на прибыльные каналы
3. **Динамическое ценообразование** - AI/ML оптимизация

### Долгая перспектива:
1. **Масштабирование платформы** - новые регионы
2. **Партнерства** - туристические агентства
3. **Дополнительные услуги** - страхование, трансферы

---

## 🚀 Следующие шаги

### Немедленно:
1. ✅ Установить MySQL локально
2. ✅ Импортировать базу
3. ✅ Запустить SQL запросы из ФАЗЫ 2

### На этой неделе:
1. Создать дашборд ключевых метрик
2. Провести анализ топ-20 объектов
3. Выявить главные "утечки" доходов

### В следующем месяце:
1. Протестировать новые стратегии скидок
2. Внедрить автоматизацию
3. Запустить пилот монетизации ресторанов

---

## 💰 ROI прогноз

**Инвестиция в анализ:** $300
**Ожидаемый результат:**
- Оптимизация скидок: +5-10% доходов
- Снижение отмен: +3-5% доходов
- Монетизация ресторанов: +10-20% новых доходов

**Потенциальный ROI:** 500-1000%+ за год

---

## Контакты и документы

**Структура БД:** `scripts/discovery/key-tables-analysis.json`
**Извлеченная схема:** `structure_only.sql`
**Список таблиц:** `table_list.txt`
