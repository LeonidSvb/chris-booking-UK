const fs = require('fs');
const readline = require('readline');

console.log('=== АНАЛИЗ РЕАЛЬНЫХ ДАННЫХ ИЗ SQL ДАМПА ===\n');

const SQL_PATH = 'C:\\Users\\79818\\Downloads\\localhost.sql';

const metrics = {
  bookings: {
    total: 0,
    paid: 0,
    deposit: 0,
    cancelled: 0,
    totalRevenue: 0,
    years: {}
  },
  vouchers: {
    total: 0,
    totalDiscount: 0,
    types: {}
  },
  payments: {
    methods: {},
    totalFees: 0
  }
};

async function analyzeSQL() {
  const fileStream = fs.createReadStream(SQL_PATH, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let currentTable = null;
  let lineCount = 0;
  let insertBuffer = '';

  console.log('Читаем SQL дамп построчно...\n');

  for await (const line of rl) {
    lineCount++;

    if (lineCount % 100000 === 0) {
      process.stdout.write(`\rОбработано строк: ${lineCount}`);
    }

    if (line.includes('CREATE TABLE')) {
      const match = line.match(/CREATE TABLE `([^`]+)`/);
      if (match) currentTable = match[1];
      continue;
    }

    if (line.startsWith('INSERT INTO')) {
      const match = line.match(/INSERT INTO `([^`]+)`/);
      if (match) currentTable = match[1];
      insertBuffer = line;
      continue;
    }

    if (currentTable && line.includes('(')) {
      insertBuffer += ' ' + line;
    }

    if (insertBuffer && line.includes(');')) {
      await processInsert(currentTable, insertBuffer);
      insertBuffer = '';
    }
  }

  console.log(`\n\nВсего строк обработано: ${lineCount}\n`);
  printMetrics();
  saveMetrics();
}

async function processInsert(table, sql) {
  if (table === 'archived_payment_summaries') {
    const rows = extractValues(sql);
    for (const row of rows) {
      metrics.bookings.total++;

      const status = row[12];
      if (status === 'paid') metrics.bookings.paid++;
      if (status === 'deposit') metrics.bookings.deposit++;

      const amount = parseFloat(row[14]) || 0;
      metrics.bookings.totalRevenue += amount;

      const created = row[29];
      if (created) {
        const year = created.substring(0, 4);
        metrics.bookings.years[year] = (metrics.bookings.years[year] || 0) + 1;
      }

      const paymentMethod = row[24];
      if (paymentMethod) {
        metrics.payments.methods[paymentMethod] =
          (metrics.payments.methods[paymentMethod] || 0) + 1;
      }

      const fee = parseFloat(row[23]) || 0;
      metrics.payments.totalFees += fee;
    }
  }

  if (table === 'booking_vouchers') {
    const rows = extractValues(sql);
    for (const row of rows) {
      metrics.vouchers.total++;

      const discountAmount = parseFloat(row[2]) || 0;
      metrics.vouchers.totalDiscount += discountAmount;

      const type = row[5];
      if (type) {
        metrics.vouchers.types[type] =
          (metrics.vouchers.types[type] || 0) + 1;
      }
    }
  }

  if (table === 'archived_property_requests') {
    const rows = extractValues(sql);
    for (const row of rows) {
      const cancelled = row[59];
      if (cancelled === 'yes') {
        metrics.bookings.cancelled++;
      }
    }
  }
}

function extractValues(sql) {
  const valuesMatch = sql.match(/VALUES\s+(.*);$/s);
  if (!valuesMatch) return [];

  const valuesStr = valuesMatch[1];
  const rows = [];
  let current = '';
  let inString = false;
  let depth = 0;

  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i];

    if (char === "'" && valuesStr[i-1] !== '\\') {
      inString = !inString;
    }

    if (!inString) {
      if (char === '(') depth++;
      if (char === ')') depth--;

      if (depth === 0 && char === ',') {
        const row = current.trim().replace(/^\(|\)$/g, '');
        rows.push(parseRow(row));
        current = '';
        continue;
      }
    }

    current += char;
  }

  if (current.trim()) {
    const row = current.trim().replace(/^\(|\)$/g, '');
    rows.push(parseRow(row));
  }

  return rows;
}

function parseRow(rowStr) {
  const values = [];
  let current = '';
  let inString = false;

  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];

    if (char === "'" && rowStr[i-1] !== '\\') {
      inString = !inString;
      continue;
    }

    if (!inString && char === ',') {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  if (current) values.push(current.trim());

  return values;
}

function printMetrics() {
  console.log('═══════════════════════════════════════════');
  console.log('         РЕАЛЬНЫЕ ДАННЫЕ ИЗ БАЗЫ');
  console.log('═══════════════════════════════════════════\n');

  console.log('📊 БРОНИРОВАНИЯ:');
  console.log(`  Всего записей: ${metrics.bookings.total}`);
  console.log(`  Оплачено полностью: ${metrics.bookings.paid}`);
  console.log(`  Только депозит: ${metrics.bookings.deposit}`);
  console.log(`  Отменено: ${metrics.bookings.cancelled}`);
  console.log(`  Общий доход: £${metrics.bookings.totalRevenue.toFixed(2)}`);

  if (metrics.bookings.total > 0) {
    const avgBooking = metrics.bookings.totalRevenue / metrics.bookings.total;
    console.log(`  Средний чек: £${avgBooking.toFixed(2)}`);

    const cancelRate = (metrics.bookings.cancelled / metrics.bookings.total * 100).toFixed(1);
    console.log(`  % отмен: ${cancelRate}%`);
  }

  console.log('\n📅 ПО ГОДАМ:');
  const sortedYears = Object.keys(metrics.bookings.years).sort();
  for (const year of sortedYears) {
    console.log(`  ${year}: ${metrics.bookings.years[year]} бронирований`);
  }

  console.log('\n🎟️ СКИДКИ И ВАУЧЕРЫ:');
  console.log(`  Всего выдано: ${metrics.vouchers.total}`);
  console.log(`  Сумма скидок: £${metrics.vouchers.totalDiscount.toFixed(2)}`);

  if (metrics.vouchers.total > 0) {
    const avgDiscount = metrics.vouchers.totalDiscount / metrics.vouchers.total;
    console.log(`  Средняя скидка: £${avgDiscount.toFixed(2)}`);
  }

  console.log('\n  Типы скидок:');
  for (const [type, count] of Object.entries(metrics.vouchers.types)) {
    console.log(`    ${type}: ${count}`);
  }

  console.log('\n💳 МЕТОДЫ ОПЛАТЫ:');
  for (const [method, count] of Object.entries(metrics.payments.methods)) {
    const pct = (count / metrics.bookings.total * 100).toFixed(1);
    console.log(`  ${method}: ${count} (${pct}%)`);
  }

  console.log(`\n💰 Комиссии процессинга: £${metrics.payments.totalFees.toFixed(2)}`);

  if (metrics.bookings.totalRevenue > 0) {
    const feePct = (metrics.payments.totalFees / metrics.bookings.totalRevenue * 100).toFixed(2);
    console.log(`   (${feePct}% от общего дохода)`);
  }

  console.log('\n═══════════════════════════════════════════\n');
}

function saveMetrics() {
  const output = {
    timestamp: new Date().toISOString(),
    metrics: metrics,
    summary: {
      totalBookings: metrics.bookings.total,
      totalRevenue: metrics.bookings.totalRevenue,
      averageBookingValue: metrics.bookings.total > 0
        ? metrics.bookings.totalRevenue / metrics.bookings.total
        : 0,
      cancellationRate: metrics.bookings.total > 0
        ? (metrics.bookings.cancelled / metrics.bookings.total * 100)
        : 0,
      totalDiscounts: metrics.vouchers.totalDiscount,
      discountToRevenueRatio: metrics.bookings.totalRevenue > 0
        ? (metrics.vouchers.totalDiscount / metrics.bookings.totalRevenue * 100)
        : 0,
      processingFees: metrics.payments.totalFees,
      processingFeesPercentage: metrics.bookings.totalRevenue > 0
        ? (metrics.payments.totalFees / metrics.bookings.totalRevenue * 100)
        : 0
    }
  };

  fs.writeFileSync(
    'scripts/discovery/real-metrics.json',
    JSON.stringify(output, null, 2)
  );

  console.log('Метрики сохранены в: scripts/discovery/real-metrics.json\n');
}

analyzeSQL().catch(err => {
  console.error('Ошибка:', err);
  process.exit(1);
});
