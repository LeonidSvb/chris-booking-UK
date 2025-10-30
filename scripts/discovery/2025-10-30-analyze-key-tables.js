const fs = require('fs');

const content = fs.readFileSync('structure_only.sql', 'utf8');
const tableBlocks = content.split('CREATE TABLE');

const keyTables = [
  'property',
  'booking',
  'payment',
  'commission',
  'customer',
  'discount',
  'price'
];

console.log('\n=== АНАЛИЗ КЛЮЧЕВЫХ ТАБЛИЦ ===\n');

const tableInfo = {};

for (const block of tableBlocks.slice(1)) {
  const lines = block.split('\n');
  const nameMatch = lines[0].match(/`([^`]+)`/);

  if (!nameMatch) continue;

  const tableName = nameMatch[1];
  const isKeyTable = keyTables.some(key => tableName.toLowerCase().includes(key));

  if (!isKeyTable && !tableName.includes('eat_')) continue;

  const fields = [];
  for (const line of lines.slice(1)) {
    const trimmed = line.trim();
    if (trimmed.startsWith('`')) {
      const fieldMatch = trimmed.match(/`([^`]+)`\s+([^\s,]+)/);
      if (fieldMatch && !trimmed.includes('PRIMARY KEY') && !trimmed.includes('KEY `')) {
        fields.push(fieldMatch[1]);
      }
    }
  }

  if (fields.length > 0) {
    tableInfo[tableName] = fields;
  }
}

console.log('Найдено ключевых таблиц:', Object.keys(tableInfo).length, '\n');

const categories = {
  'Properties (Недвижимость)': [],
  'Bookings (Бронирования)': [],
  'Payments (Платежи)': [],
  'Pricing (Ценообразование)': [],
  'Customers (Клиенты)': [],
  'Restaurants (Рестораны)': []
};

for (const [table, fields] of Object.entries(tableInfo)) {
  const info = table + ' (' + fields.length + ' полей)';

  if (table.includes('property') || table.includes('properties')) {
    categories['Properties (Недвижимость)'].push(info);
  } else if (table.includes('booking')) {
    categories['Bookings (Бронирования)'].push(info);
  } else if (table.includes('payment') || table.includes('commission')) {
    categories['Payments (Платежи)'].push(info);
  } else if (table.includes('price') || table.includes('discount')) {
    categories['Pricing (Ценообразование)'].push(info);
  } else if (table.includes('customer')) {
    categories['Customers (Клиенты)'].push(info);
  } else if (table.includes('eat_')) {
    categories['Restaurants (Рестораны)'].push(info);
  }
}

for (const [category, tables] of Object.entries(categories)) {
  if (tables.length > 0) {
    console.log('\n' + category + ':');
    tables.forEach(t => console.log('  - ' + t));
  }
}

const criticalTables = [
  'booking_vouchers',
  'customer_vouchers',
  'custom_nightly_prices',
  'discounts',
  'commission_refunds',
  'archived_payment_summaries',
  'archived_property_requests'
];

console.log('\n\n=== КРИТИЧЕСКИЕ ТАБЛИЦЫ ДЛЯ АНАЛИЗА ДОХОДОВ ===\n');

for (const critical of criticalTables) {
  for (const [table, fields] of Object.entries(tableInfo)) {
    if (table.toLowerCase().includes(critical.toLowerCase())) {
      console.log('\n' + table.toUpperCase() + ':');
      console.log('  Полей: ' + fields.length);
      console.log('  Ключевые поля: ' + fields.slice(0, 10).join(', '));
    }
  }
}

fs.writeFileSync('scripts/discovery/key-tables-analysis.json', JSON.stringify(tableInfo, null, 2));
console.log('\n\nПолный список полей сохранен в: scripts/discovery/key-tables-analysis.json');
