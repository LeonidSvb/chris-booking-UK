const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

class DatabaseAPI {
  constructor(apiUrl, apiSecret) {
    this.apiUrl = apiUrl;
    this.apiSecret = apiSecret;
  }

  async request(action, data = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.apiUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const postData = JSON.stringify({ action, ...data });

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'X-API-Secret': this.apiSecret
        }
      };

      const req = client.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.write(postData);
      req.end();
    });
  }

  async listTables() {
    return this.request('list_tables');
  }

  async describeTable(table) {
    return this.request('describe_table', { table });
  }

  async query(sql) {
    return this.request('query', { sql });
  }

  async getSample(table, limit = 10) {
    return this.request('get_sample', { table, limit });
  }

  async getStats() {
    return this.request('get_stats');
  }
}

async function analyzeDatabase() {
  // НАСТРОЙКИ - ЗАМЕНИТЕ НА РЕАЛЬНЫЕ ПОСЛЕ УСТАНОВКИ API
  const API_URL = 'https://bookingbrain.co.uk/db-api.php';
  const API_SECRET = 'change_this_secret_key_12345'; // Клиент должен сообщить реальный ключ

  console.log('🔍 Начинаем анализ базы данных через API...\n');

  const db = new DatabaseAPI(API_URL, API_SECRET);
  const reportData = {
    timestamp: new Date().toISOString(),
    database: 'bookingbrain',
    analysis: {}
  };

  try {
    // 1. Получаем общую статистику
    console.log('📊 Получение общей статистики...');
    const stats = await db.getStats();
    reportData.stats = stats.stats;

    console.log(`\n✓ Найдено таблиц: ${stats.stats.total_tables}`);
    console.log('\nТаблицы и количество записей:');
    for (const [table, info] of Object.entries(stats.stats.tables)) {
      console.log(`  - ${table}: ${info.row_count} записей`);
    }

    // 2. Получаем детальную информацию по каждой таблице
    console.log('\n\n📋 Анализ структуры таблиц...\n');
    const tables = stats.stats.tables;
    reportData.tables = {};

    for (const tableName of Object.keys(tables)) {
      console.log(`\n--- Таблица: ${tableName} ---`);

      // Структура таблицы
      const structure = await db.describeTable(tableName);
      reportData.tables[tableName] = {
        row_count: structure.row_count,
        columns: structure.columns
      };

      console.log(`Колонки (${structure.columns.length}):`);
      structure.columns.forEach(col => {
        const key = col.Key ? `[${col.Key}]` : '';
        const extra = col.Extra ? `[${col.Extra}]` : '';
        console.log(`  ${col.Field}: ${col.Type} ${key} ${extra}`);
      });

      // Образец данных
      if (structure.row_count > 0) {
        console.log(`\nПолучение образца данных (первые 3 записи)...`);
        const sample = await db.getSample(tableName, 3);
        reportData.tables[tableName].sample = sample.data;

        if (sample.data.length > 0) {
          console.log('Пример данных:');
          console.log(JSON.stringify(sample.data, null, 2));
        }
      }

      // Небольшая задержка между запросами
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 3. Сохраняем отчет
    const reportPath = path.join(__dirname, 'database-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n\n✓ Отчет сохранен: ${reportPath}`);

    // 4. Краткая сводка
    console.log('\n\n📈 КРАТКАЯ СВОДКА:\n');
    console.log(`Всего таблиц: ${stats.stats.total_tables}`);

    let totalRows = 0;
    for (const info of Object.values(stats.stats.tables)) {
      totalRows += info.row_count;
    }
    console.log(`Общее количество записей: ${totalRows}`);

    // Самые большие таблицы
    const sortedTables = Object.entries(stats.stats.tables)
      .sort((a, b) => b[1].row_count - a[1].row_count)
      .slice(0, 5);

    console.log('\nТоп-5 самых больших таблиц:');
    sortedTables.forEach(([name, info], index) => {
      console.log(`  ${index + 1}. ${name}: ${info.row_count} записей`);
    });

    console.log('\n\n✅ Анализ завершен!');
    console.log('Теперь можно провести AI-анализ паттернов и бизнес-возможностей.');

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);

    if (error.message.includes('Unauthorized')) {
      console.error('\n💡 Возможные причины:');
      console.error('  1. API файл не загружен на сервер');
      console.error('  2. Неверный секретный ключ');
      console.error('  3. Неверный URL API');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Не удается подключиться к серверу');
      console.error('  Проверьте URL API');
    }
  }
}

// Запуск анализа
analyzeDatabase();
