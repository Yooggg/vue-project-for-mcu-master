<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Link Configuration</h1>

    <!-- Tabs -->
    <div class="d-flex mb-1 border-b flex-row gap-1">
      <button
          v-for="tab in tabs"
          :key="tab"
          @click="activeTab = tab"
          class="pb-2"
          :class="{
          'border-b-2 border-blue-600 font-semibold text-blue-600': activeTab === tab
        }"
      >
        {{ tab }}
      </button>

      <div class="ms-auto">
        <button class="btn btn-success" @click="showModal = true">
          Add setting
        </button>
      </div>

    </div>

    <!-- Settings Panels -->
    <div v-if="activeTab">
      <div class="d-flex flex-row gap-3" >
        <!-- RF Link -->
        <SettingsCard title="RF Link">
        <div v-for="(value, key) in parameters.rfLink" :key="key" class="mb-4">
          <label class="block text-sm font-medium mb-1">{{ formatKey(key) }}:</label>
          <input
              v-model="parameters.rfLink[key]"
              type="text"
              class="w-full border rounded px-2 py-1"
              :placeholder="key"
          />
        </div>
        </SettingsCard>



        <!-- Loader Filter Settings -->
        <SettingsCard title="Loader Filter Settings">
          <div v-for="(value, key) in parameters.loaderFilter" :key="key" class="mb-4">
            <label class="block text-sm font-medium mb-1">{{ formatKey(key) }}:</label>
            <select
                v-model="parameters.loaderFilter[key]"
                class="w-full border rounded px-2 py-1"
            >
              <option value="FSK">FSK</option>
              <option value="ASK">ASK</option>
              <option value="PSK">PSK</option>
            </select>
          </div>
        </SettingsCard>



        <!-- Loader Settings -->
        <SettingsCard title="Loader Settings">
          <div v-for="(value, key) in parameters.loaderSettings" :key="key" class="mb-4">
            <label class="flex justify-between items-center text-sm font-medium">
              {{ formatKey(key) }}
              <template v-if="typeof value === 'boolean'">
                <input type="checkbox" v-model="parameters.loaderSettings[key]" />
              </template>
              <template v-else>
                <input
                    type="range"
                    min="-100"
                    max="0"
                    v-model.number="parameters.loaderSettings[key]"
                    class="w-1/2 ml-2"
                />
              </template>
            </label>
            <div v-if="typeof value !== 'boolean'" class="text-xs text-right text-gray-500">
              {{ parameters.loaderSettings[key] }} dBm
            </div>
          </div>
        </SettingsCard>
      </div>
    </div>
    <!-- Save Button -->
    <div class="mt-5">
      <button
          class="border-b-2 border-blue-600 font-semibold text-blue-600"
          @click="logParameters"
      >
        Save Changes
      </button>
    </div>

    <!-- Модальное окно -->
    <div class="modal fade show d-block" tabindex="-1" v-if="showModal" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Добавить настройку</h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Категория</label>
              <select class="form-select" v-model="newSetting.category">
                <option value="rfLink">RF Link</option>
                <option value="loaderFilter">Loader Filter Settings</option>
                <option value="loaderSettings">Loader Settings</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Название</label>
              <input type="text" class="form-control" v-model="newSetting.name" />
            </div>

            <div class="mb-3">
              <label class="form-label">Тип</label>
              <select class="form-select" v-model="newSetting.type">
                <option value="text">Число / текст</option>
                <option value="checkbox">Флажок</option>
                <option value="range">Ползунок</option>
                <option value="select">Выпадающий список</option>
              </select>
            </div>

            <div v-if="newSetting.type === 'range'" class="mb-3">
              <label class="form-label">Диапазон</label>
              <div class="d-flex gap-2">
                <input type="number" class="form-control" v-model.number="newSetting.min" placeholder="Мин" />
                <input type="number" class="form-control" v-model.number="newSetting.max" placeholder="Макс" />
              </div>
            </div>

            <div v-if="newSetting.type === 'select'" class="mb-3">
              <label class="form-label">Опции (через запятую)</label>
              <input type="text" class="form-control" v-model="newSetting.optionsRaw" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showModal = false">Отмена</button>
            <button class="btn btn-primary" @click="addSetting">Добавить</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import SettingsCard from '@/components/SettingsCard.vue';

const tabs = ['Default', 'Link 1', 'Link 2'];
const activeTab = ref('Default');

const parameters = reactive({
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
});

function formatKey(key) {
  return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/^./, (str) => str.toUpperCase());
}

function logParameters() {
  console.log('Saved parameters:', JSON.stringify(parameters, null, 2));
  alert('Parameters saved (see console)');
}

const showModal = ref(false);

const settingMeta = reactive({
  rfLink: {},
  loaderFilter: {},
  loaderSettings: {}
});

const newSetting = reactive({
  name: '',
  type: 'text',
  category: 'rfLink', // значение по умолчанию
  min: 0,
  max: 100,
  optionsRaw: ''
});

function addSetting() {
  const key = newSetting.name.trim();
  if (!key) {
    alert('Введите название настройки');
    return;
  }

  let value;
  switch (newSetting.type) {
    case 'text':
      value = '';
      break;
    case 'checkbox':
      value = false;
      break;
    case 'range':
      value = newSetting.min;
      break;
    case 'select':
      value = '';
      break;
  }

  if (!parameters[newSetting.category]) {
    parameters[newSetting.category] = {};
  }
  parameters[newSetting.category][key] = (() => {
    switch (newSetting.type) {
      case 'text':
        return '';
      case 'checkbox':
        return false;
      case 'range':
        return newSetting.min;
      case 'select':
        return '';
    }
  })();

  // Сохраняем мета-информацию
  settingMeta[newSetting.category][key] = {
    type: newSetting.type,
    ...(newSetting.type === 'range' && {
      min: newSetting.min,
      max: newSetting.max
    }),
    ...(newSetting.type === 'select' && {
      options: newSetting.optionsRaw.split(',').map(opt => opt.trim())
    })
  };
}
</script>
