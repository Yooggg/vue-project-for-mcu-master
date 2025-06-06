const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Создаем WebSocket сервер
const wss = new WebSocket.Server({ port: 8080 });

// Хранилище настроек для разных вкладок
const settingsStore = {
  Default: {
    rfLink: {
      rxFrequency: '15236.4',
      txFrequency: '156.4',
      powerOutput: '1',
      bandwidth: '12.5 kHz'
    },
    loaderFilter: {
      rxFilterMode: 'FSK',
      txFilterMode: 'FSK'
    },
    loaderSettings: {
      enable600OhmInput: false,
      squelchMute: false,
      invertedPTT: false,
      rxOnly: false,
      invertedCD: false,
      dynamicThreshold: -50
    }
  },
  'Link 1': {
    rfLink: {},
    loaderFilter: {},
    loaderSettings: {}
  },
  'Link 2': {
    rfLink: {},
    loaderFilter: {},
    loaderSettings: {}
  }
};

// Функция для отправки команды на модем
function sendCommandToModem(command) {
  // Здесь будет реализация отправки команды на модем
  // Это пример, который нужно заменить реальной логикой работы с модемом
  console.log('Отправка команды на модем:', command);
  return new Promise((resolve, reject) => {
    // Имитация отправки команды
    setTimeout(() => {
      resolve({ success: true, message: 'Команда успешно отправлена' });
    }, 500);
  });
}

// Загружаем сохраненные настройки при запуске
function loadSettings() {
  try {
    const files = ['default', 'link_1', 'link_2'].map(name => `settings_${name}.json`);
    files.forEach(file => {
      const filePath = path.join(__dirname, '..', 'public', 'data', file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (data.tab && data.settings) {
          settingsStore[data.tab] = deepMerge(settingsStore[data.tab], data.settings);
        }
      }
    });
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Функция для глубокого объединения объектов
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

// Сохраняем настройки в файл
function saveSettings(tab, settings) {
  try {
    const fileName = `settings_${tab.toLowerCase().replace(' ', '_')}.json`;
    const filePath = path.join(__dirname, '..', 'public', 'data', fileName);
    
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify({ tab, settings }, null, 2));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Загружаем настройки при запуске сервера
loadSettings();

wss.on('connection', function connection(ws) {
  console.log('New client connected');

  // Отправляем текущие настройки клиенту
  Object.entries(settingsStore).forEach(([tab, settings]) => {
    ws.send(JSON.stringify({
      type: 'settings',
      tab,
      settings
    }));
  });

  ws.on('message', async function incoming(message) {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'setting_change') {
        // Обновляем значение в хранилище
        if (!settingsStore[data.tab]) {
          settingsStore[data.tab] = {};
        }
        if (!settingsStore[data.tab][data.category]) {
          settingsStore[data.tab][data.category] = {};
        }
        settingsStore[data.tab][data.category][data.key] = data.value;

        // Отправляем команду на модем
        try {
          const command = {
            action: 'set_parameter',
            category: data.category,
            parameter: data.key,
            value: data.value
          };
          
          const result = await sendCommandToModem(command);
          
          // Отправляем результат клиенту
          ws.send(JSON.stringify({
            type: 'command_result',
            success: result.success,
            message: result.message
          }));

          // Сохраняем изменения в файл
          saveSettings(data.tab, settingsStore[data.tab]);

          // Отправляем обновление всем клиентам
          wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'settings',
                tab: data.tab,
                category: data.category,
                settings: settingsStore[data.tab]
              }));
            }
          });
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'command_result',
            success: false,
            message: 'Ошибка при отправке команды: ' + error.message
          }));
        }
      } else if (data.type === 'direct_command') {
        // Обработка прямых команд модему
        try {
          const result = await sendCommandToModem(data.command);
          ws.send(JSON.stringify({
            type: 'command_result',
            success: result.success,
            message: result.message
          }));
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'command_result',
            success: false,
            message: 'Ошибка при выполнении команды: ' + error.message
          }));
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server started on port 8080'); 