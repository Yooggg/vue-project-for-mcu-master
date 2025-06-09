<template>
  <div class="container-fluid py-4">
    <div class="d-flex align-items-center mb-4">
      <h1 class="h2 mb-0">Link Configuration</h1>
      <div class="ms-3">
        <span class="badge" :class="{'bg-success': isConnected, 'bg-danger': !isConnected}">
          {{ isConnected ? 'Connected' : 'Disconnected' }}
        </span>
      </div>
    </div>

    <!-- Notification -->
    <div v-if="notification.show" 
         class="alert mb-4"
         :class="{
           'alert-success': notification.type === 'success',
           'alert-danger': notification.type === 'error'
         }">
      {{ notification.message }}
    </div>

    <!-- Tabs -->
    <div class="d-flex align-items-center mb-4 border-bottom">
      <div class="nav nav-tabs border-0">
        <button
            v-for="tab in tabs"
            :key="tab"
            @click="activeTab = tab"
            class="nav-link border-0"
            :class="{
            'active fw-semibold': activeTab === tab
          }"
        >
          {{ tab }}
        </button>
      </div>

      <div class="ms-auto">
        <button class="btn btn-outline-primary me-2" @click="showCommandModal = true">
          <i class="bi bi-terminal"></i> Send command
        </button>
        <button class="btn btn-outline-primary" @click="showModal = true">
          <i class="bi bi-plus-lg"></i> Add setting
        </button>
      </div>
    </div>

    <!-- Settings Panels -->
    <div v-if="activeTab">
      <div class="row g-4">
        <template v-for="(settings, category) in parameters[activeTab]" :key="category">
          <div class="col-md-6 col-lg-4">
            <SettingsCard :title="formatKey(category)">
              <div v-for="(value, key) in settings" :key="key" class="mb-4">
                <label class="form-label fw-semibold">{{ formatKey(key) }}:</label>
                
                <!-- Text/Number Input -->
                <input
                  v-if="getSettingType(activeTab, category, key) === 'text'"
                  v-model="parameters[activeTab][category][key]"
                  type="text"
                  class="form-control"
                  :placeholder="key"
                  @change="settingChanged(activeTab, category, key)"
                />

                <!-- Select Input -->
                <select
                  v-else-if="getSettingType(activeTab, category, key) === 'select'"
                  v-model="parameters[activeTab][category][key]"
                  class="form-select"
                  @change="settingChanged(activeTab, category, key)"
                >
                  <option v-for="option in getSettingOptions(activeTab, category, key)" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>

                <!-- Checkbox Input -->
                <div v-else-if="getSettingType(activeTab, category, key) === 'checkbox'" class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :id="category + key"
                    v-model="parameters[activeTab][category][key]"
                    @change="settingChanged(activeTab, category, key)"
                  />
                  <label class="form-check-label" :for="category + key">{{ formatKey(key) }}</label>
                </div>

                <!-- Range Input -->
                <div v-else-if="getSettingType(activeTab, category, key) === 'range'" class="mb-3">
                  <div class="d-flex justify-content-between mb-1">
                    <small class="text-muted">{{ getSettingRange(activeTab, category, key).min }}</small>
                    <small class="text-muted">{{ parameters[activeTab][category][key] }}{{ getSettingRange(activeTab, category, key).unit || '' }}</small>
                    <small class="text-muted">{{ getSettingRange(activeTab, category, key).max }}</small>
                  </div>
                  <input
                    type="range"
                    class="form-range"
                    v-model.number="parameters[activeTab][category][key]"
                    :min="getSettingRange(activeTab, category, key).min"
                    :max="getSettingRange(activeTab, category, key).max"
                    @change="settingChanged(activeTab, category, key)"
                  />
                </div>
              </div>
            </SettingsCard>
          </div>
        </template>
      </div>
    </div>

    <!-- Save Button -->
    <div class="mt-4 mb-5">
      <button class="btn btn-lg btn-outline-primary" @click="saveSettings">
        <i class="bi bi-save"></i> Save Settings
      </button>
    </div>

    <!-- Add Setting Modal -->
    <div class="modal fade show d-block" tabindex="-1" v-if="showModal" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow">
          <div class="modal-header">
            <h5 class="modal-title">Add New Setting</h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Category</label>
              <select class="form-select" v-model="newSetting.category">
                <option value="rfLink">RF Link</option>
                <option value="loaderFilter">Loader Filter Settings</option>
                <option value="loaderSettings">Loader Settings</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input type="text" class="form-control" v-model="newSetting.name" />
            </div>

            <div class="mb-3">
              <label class="form-label">Type</label>
              <select class="form-select" v-model="newSetting.type">
                <option value="text">Number / Text</option>
                <option value="checkbox">Checkbox</option>
                <option value="range">Range Slider</option>
                <option value="select">Dropdown</option>
              </select>
            </div>

            <div v-if="newSetting.type === 'range'" class="mb-3">
              <label class="form-label">Range</label>
              <div class="row g-2">
                <div class="col">
                  <input type="number" class="form-control" v-model.number="newSetting.min" placeholder="Min" />
                </div>
                <div class="col">
                  <input type="number" class="form-control" v-model.number="newSetting.max" placeholder="Max" />
                </div>
                <div class="col">
                  <input type="text" class="form-control" v-model="newSetting.unit" placeholder="Unit" />
                </div>
              </div>
            </div>

            <div v-if="newSetting.type === 'select'" class="mb-3">
              <label class="form-label">Options (comma separated)</label>
              <input type="text" class="form-control" v-model="newSetting.optionsRaw" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" @click="showModal = false">Cancel</button>
            <button class="btn btn-primary" @click="addSetting">
              <i class="bi bi-plus-lg"></i> Add Setting
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Command Modal -->
    <div class="modal fade show d-block" tabindex="-1" v-if="showCommandModal" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow">
          <div class="modal-header">
            <h5 class="modal-title">Send Command to Modem</h5>
            <button type="button" class="btn-close" @click="showCommandModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Action</label>
              <select class="form-select" v-model="commandData.action">
                <option value="set_parameter">Set Parameter</option>
                <!-- <option value="set_frequency">Set Frequency</option>
                <option value="set_power">Set Power</option>
                <option value="set_bandwidth">Set Bandwidth</option>
                <option value="custom">Custom Command</option> -->
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Category</label>
              <select class="form-select" v-model="commandData.category">
                <option value="rfLink">Rf Link</option>
                <option value="loaderFilter">Loader Filter</option>
                <option value="loaderSettings">Loader Settings</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Parameter</label>
              <select class="form-select" v-model="commandData.parameter">
                <option v-for="(value, key) in parameters[activeTab][commandData.category]" :key="key" :value="key">
                  {{ key }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Value</label>
              <input type="text" class="form-control" v-model="commandData.value" 
                     :placeholder="getCommandPlaceholder()" />
            </div>

            <div class="mb-3" v-if="commandData.action === 'custom'">
              <label class="form-label">Additional Parameters (JSON)</label>
              <textarea class="form-control font-monospace" v-model="commandData.extraParams" 
                        placeholder='{"param1": "value1", "param2": "value2"}'
                        rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" @click="showCommandModal = false">Cancel</button>
            <button class="btn btn-primary" @click="executeCommand(); parameters[activeTab][commandData.category][commandData.parameter] = commandData.value; /*settingChanged(activeTab, commandData.category, commandData.parameter)*/">
              <i class="bi bi-terminal"></i> Send Command
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import SettingsCard from '@/components/SettingsCard.vue';

const tabs = ['Default', 'Link 1', 'Link 2'];
const activeTab = ref('Default');
const isConnected = ref(false);
let ws = null;

// Добавляем состояние для уведомлений
const notification = reactive({
  show: false,
  message: '',
  type: 'success' // или 'error'
});

const parameters = reactive({
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
});

// Метаданные для настроек
const settingMeta = reactive({
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
});

const showModal = ref(false);
const newSetting = reactive({
  category: 'rfLink',
  name: '',
  type: 'text',
  min: 0,
  max: 100,
  unit: '',
  optionsRaw: ''
});

const showCommandModal = ref(false);
const commandData = reactive({
  action: 'set_frequency',
  category: '',
  parameter: '',
  value: '',
  extraParams: '{}'
});

// WebSocket функции
function connectWebSocket() {
  ws = new WebSocket('ws://localhost:8080');

  ws.onopen = () => {
    console.log('WebSocket connected');
    isConnected.value = true;
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
    isConnected.value = false;
    
    setTimeout(connectWebSocket, 5000);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'settings') {
        if (data.tab && data.category && data.settings) {
          if (!parameters[data.tab]) {
            parameters[data.tab] = {};
          }
          parameters[data.tab][data.category] = {
            ...parameters[data.tab][data.category],
            ...data.settings[data.category]
          };
        } else if (data.tab && data.settings) {
          parameters[data.tab] = {
            ...parameters[data.tab],
            ...data.settings
          };
        }
      } else if (data.type === 'command_result') {
        // //уведомление о результате выполнения команды
        // showNotification(
        //   data.message,
        //   data.success ? 'success' : 'error'
        // );
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    isConnected.value = false;
  };
}


function formatKey(key) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^./, (str) => str.toUpperCase());
}

function getSettingType(tab, category, key) {
  return settingMeta[category]?.[key]?.type || 'text';
}

function getSettingOptions(tab, category, key) {
  return settingMeta[category]?.[key]?.options || [];
}

function getSettingRange(tab, category, key) {
  const meta = settingMeta[category]?.[key] || {};
  return {
    min: meta.min || 0,
    max: meta.max || 100,
    unit: meta.unit || ''
  };
}

function settingChanged(tab, category, key) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'setting_change',
      tab,
      category,
      key,
      value: parameters[tab][category][key]
    }));
  }
}

function saveSettings() {
  // Создаем JSON файл с текущими настройками
  const settingsData = {
    tab: activeTab.value,
    settings: parameters[activeTab.value]
  };
  
  // Создаем Blob и скачиваем файл
  const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `settings_${activeTab.value.toLowerCase().replace(' ', '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

function addSetting() {
  const category = newSetting.category;
  const key = newSetting.name.replace(/\s+/g, '');
  
  //метаданные для новой настройки
  const meta = {
    type: newSetting.type
  };

  if (newSetting.type === 'range') {
    meta.min = newSetting.min;
    meta.max = newSetting.max;
    meta.unit = newSetting.unit;
    parameters[activeTab.value][category][key] = newSetting.min;
  } else if (newSetting.type === 'select') {
    meta.options = newSetting.optionsRaw.split(',').map(opt => opt.trim());
    parameters[activeTab.value][category][key] = meta.options[0];
  } else if (newSetting.type === 'checkbox') {
    parameters[activeTab.value][category][key] = false;
  } else {
    parameters[activeTab.value][category][key] = '';
  }

  settingMeta[category][key] = meta;
  showModal.value = false;

  // Сбрасываем форму
  Object.assign(newSetting, {
    category: 'rfLink',
    name: '',
    type: 'text',
    min: 0,
    max: 100,
    unit: '',
    optionsRaw: ''
  });
}

//показ уведомления
function showNotification(message, type = 'success') {
  notification.message = message;
  notification.type = type;
  notification.show = true;
  setTimeout(() => {
    notification.show = false;
  }, 3000);
}

//отправка прямых команд
function sendCommand(command) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'direct_command',
      command
    }));
  } else {
    showNotification('Нет подключения к серверу', 'error');
  }
}

function getCommandPlaceholder() {
  switch (commandData.action) {
    case 'set_frequency':
      return 'Например: 156.4';
    case 'set_power':
      return 'Значение мощности (Вт)';
    case 'set_bandwidth':
      return 'Например: 12.5 kHz';
    default:
      return 'Введите значение';
  }
}

function executeCommand() {
  try {
    const command = {
      action: commandData.action,
      category: commandData.category,
      parameter: commandData.parameter,
      value: commandData.value
    };

    if (commandData.action === 'custom') {
      try {
        const extraParams = JSON.parse(commandData.extraParams);
        Object.assign(command, extraParams);
      } catch (e) {
        showNotification('Ошибка в формате дополнительных параметров', 'error');
        return;
      }
    }

    sendCommand(command);
    showCommandModal.value = false;
    
    // Очищаем форму
    commandData.value = '';
    commandData.extraParams = '{}';
  } catch (error) {
    showNotification('Ошибка при отправке команды: ' + error.message, 'error');
  }
}

// Lifecycle hooks
onMounted(() => {
  connectWebSocket();
});

onUnmounted(() => {
  if (ws) {
    ws.close();
  }
});
</script>
