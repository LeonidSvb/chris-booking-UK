const fs = require('fs');
const path = require('path');

const SQL_DUMP_PATH = 'C:\\Users\\79818\\Downloads\\localhost.sql';
const OUTPUT_PATH = 'scripts/discovery/db-structure-analysis.json';

console.log('Начинаем анализ структуры базы данных...\n');

const tableGroups = {
  properties: [],
  bookings: [],
  payments: [],
  pricing: [],
  customers: [],
  restaurants: [],
  marketing: [],
  integrations: [],
  system: [],
  other: []
};

function categorizeTable(tableName) {
  if (tableName.includes('property') || tableName.includes('properties')) return 'properties';
  if (tableName.includes('booking') || tableName.includes('voucher')) return 'bookings';
  if (tableName.includes('payment') || tableName.includes('commission') || tableName.includes('refund')) return 'payments';
  if (tableName.includes('price') || tableName.includes('discount') || tableName.includes('fee')) return 'pricing';
  if (tableName.includes('customer') || tableName.includes('guest')) return 'customers';
  if (tableName.includes('eat_') || tableName.includes('eatpage')) return 'restaurants';
  if (tableName.includes('marketing') || tableName.includes('google') || tableName.includes('mailchimp') || tableName.includes('affiliate')) return 'marketing';
  if (tableName.includes('airbnb') || tableName.includes('hosthub') || tableName.includes('ical')) return 'integrations';
  if (tableName.includes('admin') || tableName.includes('api_') || tableName.includes('import_') || tableName.includes('archived')) return 'system';
  return 'other';
}

function extractTableStructure(sqlContent) {
  const tables = {};
  const createTableRegex = /CREATE TABLE `([^`]+)` \(([\s\S]*?)\) ENGINE=/g;

  let match;
  let count = 0;

  while ((match = createTableRegex.exec(sqlContent)) !== null) {
    const tableName = match[1];
    const tableContent = match[2];

    const fields = [];
    const lines = tableContent.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('`')) {
        const fieldMatch = trimmed.match(/`([^`]+)`\s+([^\s,]+)/);
        if (fieldMatch) {
          fields.push({
            name: fieldMatch[1],
            type: fieldMatch[2]
          });
        }
      }
    }

    const category = categorizeTable(tableName);
    tableGroups[category].push(tableName);

    tables[tableName] = {
      category,
      fieldCount: fields.length,
      fields: fields.slice(0, 10)
    };

    count++;
    if (count % 10 === 0) {
      process.stdout.write(`\rОбработано таблиц: ${count}`);
    }
  }

  console.log(`\n\nВсего таблиц обработано: ${count}\n`);
  return tables;
}

console.log('Чтение SQL дампа (это может занять время для 3GB файла)...');

const startTime = Date.now();

const stream = fs.createReadStream(SQL_DUMP_PATH, { encoding: 'utf8', highWaterMark: 1024 * 1024 });
let sqlContent = '';
let readBytes = 0;

stream.on('data', (chunk) => {
  sqlContent += chunk;
  readBytes += chunk.length;

  const mb = (readBytes / 1024 / 1024).toFixed(2);
  process.stdout.write(`\rПрочитано: ${mb} MB`);
});

stream.on('end', () => {
  const readTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n\nФайл прочитан за ${readTime} секунд`);
  console.log('Парсинг структуры таблиц...\n');

  const tables = extractTableStructure(sqlContent);

  console.log('\n=== ГРУППИРОВКА ТАБЛИЦ ===\n');

  for (const [category, tableList] of Object.entries(tableGroups)) {
    if (tableList.length > 0) {
      console.log(`${category.toUpperCase()}: ${tableList.length} таблиц`);
      console.log(`  ${tableList.join(', ')}\n`);
    }
  }

  const analysis = {
    totalTables: Object.keys(tables).length,
    categories: {},
    tables: tables,
    generatedAt: new Date().toISOString()
  };

  for (const [category, tableList] of Object.entries(tableGroups)) {
    analysis.categories[category] = {
      count: tableList.length,
      tables: tableList
    };
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(analysis, null, 2));
  console.log(`\nАнализ сохранен в: ${OUTPUT_PATH}`);

  console.log('\n=== КЛЮЧЕВЫЕ НАБЛЮДЕНИЯ ===\n');
  console.log(`1. Основной бизнес: Аренда недвижимости (${tableGroups.properties.length} таблиц свойств, ${tableGroups.bookings.length} таблиц бронирований)`);
  console.log(`2. Дополнительный бизнес: Справочник ресторанов (${tableGroups.restaurants.length} таблиц)`);
  console.log(`3. Интеграции: ${tableGroups.integrations.length} таблиц (Airbnb, HostHub, iCal)`);
  console.log(`4. Система ценообразования: ${tableGroups.pricing.length} таблиц (скидки, кастомные цены)`);
  console.log(`5. Маркетинг: ${tableGroups.marketing.length} таблиц (Google Ads, партнеры)`);
});

stream.on('error', (err) => {
  console.error('Ошибка чтения файла:', err);
  process.exit(1);
});
