const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Создаем WebSocket сервер
const wss = new WebSocket.Server({ port: 8080 });

// Хранилище настроек для разных вкладок
const settingsStore = {
  tabs: {
    Default: {
      settings: {
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
      settingMeta: {
        rfLink: {
          rxFrequency: { type: 'text' },
          txFrequency: { type: 'text' },
          powerOutput: { type: 'range', min: 0, max: 10, unit: 'W' },
          bandwidth: { type: 'select', options: ['12.5 kHz', '25 kHz', '50 kHz'] }
        },
        loaderFilter: {
          rxFilterMode: { type: 'select', options: ['FSK', 'ASK', 'PSK'] },
          txFilterMode: { type: 'select', options: ['FSK', 'ASK', 'PSK'] }
        },
        loaderSettings: {
          enable600OhmInput: { type: 'checkbox' },
          squelchMute: { type: 'checkbox' },
          invertedPTT: { type: 'checkbox' },
          rxOnly: { type: 'checkbox' },
          invertedCD: { type: 'checkbox' },
          dynamicThreshold: { type: 'range', min: -100, max: 0, unit: 'dBm' }
        }
      }
    },
    'Link 1': {
      settings: {
        rfLink: {},
        loaderFilter: {},
        loaderSettings: {}
      },
      settingMeta: {
        rfLink: {},
        loaderFilter: {},
        loaderSettings: {}
      }
    },
    'Link 2': {
      settings: {
        rfLink: {},
        loaderFilter: {},
        loaderSettings: {}
      },
      settingMeta: {
        rfLink: {},
        loaderFilter: {},
        loaderSettings: {}
      }
    }
  }
};

// Метаданные для настроек уже включены в структуру settingsStore.tabs[tab].settingMeta

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
        if (data.tabs) {
          for (const tab in data.tabs) {
            if (!settingsStore.tabs[tab]) {
              settingsStore.tabs[tab] = { settings: {}, settingMeta: {} };
            }
            if (data.tabs[tab].settings) {
              settingsStore.tabs[tab].settings = deepMerge(settingsStore.tabs[tab].settings, data.tabs[tab].settings);
            }
            if (data.tabs[tab].settingMeta) {
              settingsStore.tabs[tab].settingMeta = deepMerge(settingsStore.tabs[tab].settingMeta, data.tabs[tab].settingMeta);
            }
          }
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
function saveSettings(tab, settings, settingMeta) {
  try {
    const fileName = `settings_${tab.toLowerCase().replace(' ', '_')}.json`;
    const filePath = path.join(__dirname, '..', 'public', 'data', fileName);
    
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Создаем объект в новом формате
    const tabData = {
      tabs: {
        [tab]: {
          settings,
          settingMeta
        }
      }
    };
    
    const dataToSave = JSON.stringify(tabData, null, 2);
    console.log(`Saving settings to: ${filePath}`);
    console.log('Data to save:', dataToSave);
    fs.writeFileSync(filePath, dataToSave);
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

function uploadFromFile(file_name){
  const filePath = path.join(__dirname, '..', 'public', 'data', 'settings', file_name);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (data.tabs) {
      // Заменяем все настройки
      settingsStore.tabs = data.tabs;
      console.log('Settings loaded from file:', file_name);
    }
  } else {
    console.error('Settings file not found:', filePath);
  }
}

// Загружаем настройки при запуске сервера
loadSettings();

wss.on('connection', function connection(ws) {
  console.log('New client connected');

  // Отправляем текущие настройки и метаданные клиенту
  Object.entries(settingsStore.tabs).forEach(([tab, tabData]) => {
    ws.send(JSON.stringify({
      type: 'settings',
      tab,
      settings: tabData.settings,
      settingMeta: tabData.settingMeta
    }));
  });

  ws.on('message', async function incoming(message) {
    try {
      
      const data = JSON.parse(message);
      if (data.action === 'updateFromFile'){
        uploadFromFile(data.fileName);
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'upload_settings',
                settingsStore: settingsStore,
              }));
            }
          });

          ws.send(JSON.stringify({
            type: 'upload_settings',
            settingsStore: settingsStore,
          }));
      }

      // Обработка создания новой вкладки
      if (data.type === 'create_tab') {
        const tabName = data.tabName;
        
        if (!settingsStore.tabs[tabName]) {
          // Создаем структуру для новой вкладки
          settingsStore.tabs[tabName] = {
            settings: {
              rfLink: {},
              loaderFilter: {},
              loaderSettings: {}
            },
            settingMeta: {
              rfLink: {},
              loaderFilter: {},
              loaderSettings: {}
            }
          };
          
          // Сохраняем настройки в файл
          saveSettings(tabName, settingsStore.tabs[tabName].settings, settingsStore.tabs[tabName].settingMeta);
          
          // Оповещаем всех клиентов о новой вкладке
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'settings',
                tab: tabName,
                settings: settingsStore.tabs[tabName].settings,
                settingMeta: settingsStore.tabs[tabName].settingMeta
              }));
            }
          });
          
          ws.send(JSON.stringify({
            type: 'command_result',
            success: true,
            message: `Вкладка '${tabName}' успешно создана`
          }));
        } else {
          ws.send(JSON.stringify({
            type: 'command_result',
            success: false,
            message: `Вкладка '${tabName}' уже существует`
          }));
        }
      }

      if (data.type === 'setting_change') {
        // Обновляем значение в хранилище
        if (!settingsStore.tabs[data.tab]) {
          settingsStore.tabs[data.tab] = { settings: {}, settingMeta: {} };
        }
        if (!settingsStore.tabs[data.tab].settings[data.category]) {
          settingsStore.tabs[data.tab].settings[data.category] = {};
        }
        settingsStore.tabs[data.tab].settings[data.category][data.key] = data.value;

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
          saveSettings(data.tab, settingsStore.tabs[data.tab].settings, settingsStore.tabs[data.tab].settingMeta);

          // Отправляем обновление всем клиентам
          wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'settings',
                tab: data.tab,
                category: data.category,
                settings: settingsStore.tabs[data.tab].settings,
                settingMeta: settingsStore.tabs[data.tab].settingMeta
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
      } else if (data.type === 'create_parameter') {
        const { tab, category, key, initialValue, meta } = data;

        if (!settingsStore.tabs[tab]) {
          settingsStore.tabs[tab] = { settings: {}, settingMeta: {} };
        }
        if (!settingsStore.tabs[tab].settings[category]) {
          settingsStore.tabs[tab].settings[category] = {};
        }
        settingsStore.tabs[tab].settings[category][key] = initialValue;

        if (!settingsStore.tabs[tab].settingMeta[category]) {
          settingsStore.tabs[tab].settingMeta[category] = {};
        }
        settingsStore.tabs[tab].settingMeta[category][key] = meta;

        try {
          const command = {
            action: 'create_parameter',
            tab, category, key, type: meta.type, initialValue, meta
          };
          const result = await sendCommandToModem(command);
          ws.send(JSON.stringify({
            type: 'command_result',
            success: result.success,
            message: result.message
          }));

          // Сохраняем и рассылаем обновленные настройки и метаданные
          saveSettings(tab, settingsStore.tabs[tab].settings, settingsStore.tabs[tab].settingMeta);
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'settings',
                tab,
                settings: settingsStore.tabs[tab].settings,
                settingMeta: settingsStore.tabs[tab].settingMeta
              }));
            }
          });
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'command_result',
            success: false,
            message: 'Ошибка при создании параметра: ' + error.message
          }));
        }

      } else if (data.type === 'get_parameter') {
        const { tab, category, key } = data;
        let value = null;

        if (settingsStore.tabs[tab] && 
            settingsStore.tabs[tab].settings[category] && 
            settingsStore.tabs[tab].settings[category][key] !== undefined) {
          value = settingsStore.tabs[tab].settings[category][key];
        }
        
        // Отправляем команду на модем, чтобы получить актуальное значение
        try {
          const command = {
            action: 'get_parameter',
            tab, category, key
          };
          const result = await sendCommandToModem(command);
          // В реальной реализации, result.value должен быть актуальным значением из модема
          value = result.value !== undefined ? result.value : value; // Приоритет значения из модема

          ws.send(JSON.stringify({
            type: 'get_parameter_result',
            success: true,
            category,
            parameter: key,
            value: value !== null ? value : 'N/A', // Если значение не найдено, отправляем N/A
            message: result.message
          }));
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'command_result',
            success: false,
            message: 'Ошибка при получении параметра: ' + error.message
          }));
        }
      } else if (data.type === 'custom_command') { // Переименовал direct_command в custom_command
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
      ws.send(JSON.stringify({
        type: 'command_result',
        success: false,
        message: 'Ошибка обработки сообщения на сервере: ' + error.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server started on port 8080'); 