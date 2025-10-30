const mysql = require('mysql2/promise');

async function analyzeDatabase() {
  let connection;

  try {
    console.log('Попытка подключения к базе данных...');

    // Пробуем разные варианты хоста
    const hosts = ['bookingbrain.co.uk', 'www.bookingbrain.co.uk', 'localhost'];

    for (const host of hosts) {
      try {
        console.log(`\nПопытка подключения к хосту: ${host}`);

        connection = await mysql.createConnection({
          host: host,
          user: 'leocrmbb',
          password: 'URHGJZn2S]!3lEck',
          database: 'bookingbrain',
          port: 3306,
          connectTimeout: 10000
        });

        console.log(`✓ Успешно подключено к ${host}!\n`);
        break;
      } catch (err) {
        console.log(`✗ Не удалось подключиться к ${host}: ${err.message}`);
        if (hosts.indexOf(host) === hosts.length - 1) {
          throw err;
        }
      }
    }

    if (!connection) {
      throw new Error('Не удалось подключиться ни к одному хосту');
    }

    // Получаем список всех таблиц
    console.log('=== СПИСОК ТАБЛИЦ ===\n');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`Найдено таблиц: ${tables.length}\n`);
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`${index + 1}. ${tableName}`);
    });

    // Для каждой таблицы получаем структуру
    console.log('\n\n=== СТРУКТУРА ТАБЛИЦ ===\n');

    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\n--- Таблица: ${tableName} ---`);

      // Получаем структуру таблицы
      const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      console.log('Колонки:');
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''} ${col.Extra ? `[${col.Extra}]` : ''}`);
      });

      // Получаем количество записей
      const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`Количество записей: ${countResult[0].count}`);

      // Получаем первые 3 записи как пример
      if (countResult[0].count > 0) {
        const [sample] = await connection.query(`SELECT * FROM ${tableName} LIMIT 3`);
        console.log('Пример данных (первые 3 записи):');
        console.log(JSON.stringify(sample, null, 2));
      }
    }

    console.log('\n\n=== АНАЛИЗ ЗАВЕРШЕН ===');

  } catch (error) {
    console.error('Ошибка:', error.message);
    console.error('Детали:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nСоединение закрыто.');
    }
  }
}

analyzeDatabase();
