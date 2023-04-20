<template>
  <el-col
    :offset="line.offset || defaultSetting.colOffset"
    :span="line.width || defaultSetting.colWidth"
    :style="{ textAlign: line.textAlign || defaultSetting.textAlign }"
  >
    <el-badge
      v-if="line.type === lineType.button"
      :hidden="!line.isButton || !line.badge"
      :is-dot="line.badge === 'dot'"
      :value="line.badge"
      type="success"
    >
      <el-button
        @click="emit('value-return', line.accelerator)"
        :disabled="line.disabled || line.valCount < buttonValCount"
        :link="!line.isButton"
        :type="line.buttonType"
      >
        <span :style="{ fontSize: '16px', textAlign: line.inTextAlign }">
          <template
            v-for="(content, index) in line.contents"
            :key="`button-${index}`"
          >
            <br v-if="index !== 0" />
            {{ content }}
          </template>
        </span>
      </el-button>
    </el-badge>
    <el-divider
      v-if="line.type === lineType['divider']"
      :border-style="line.border"
      :content-position="line.position"
    >
      {{ line.content }}
    </el-divider>
    <el-row
      v-if="line.type === lineType['progress']"
      :gutter="10"
      align="middle"
    >
      <el-col :span="line.barWidth">
        <el-progress
          :color="line.barColor"
          :percentage="line.percentage"
          :stroke-width="line.height"
          :text-inside="true"
        >
          <span :style="{ color: line.fontColor }">
            {{ line.inContent }}
          </span>
        </el-progress>
      </el-col>
      <el-col
        :span="24 - line.barWidth"
        :style="{ color: line.fontColor, textAlign: line.textAlign }"
      >
        <span>{{ line.outContent }}</span>
      </el-col>
    </el-row>
    <div
      v-if="line.type === lineType.text"
      :style="{ color: line.color, fontSize: line.fontSize }"
    >
      <p v-if="line.isParagraph">
        <span v-for="(content, i) in line.contents" :key="content">
          <br v-if="i !== 0" />
          {{ content }}
        </span>
      </p>
      <template v-else>
        <template v-for="(content, i) in line.contents" :key="content">
          <br v-if="i !== 0" />
          {{ content }}
        </template>
      </template>
    </div>
  </el-col>
</template>

<script setup>
import { toRefs } from 'vue';
import embeddedData from '@/renderer/utils/embedded.json';

const lineType = embeddedData.lineType;

// eslint-disable-next-line no-undef
const props = defineProps({
  line: Object,
  defaultSetting: Object,
  buttonValCount: String,
});
const { line, defaultSetting, buttonValCount } = toRefs(props);

// eslint-disable-next-line no-undef
const emit = defineEmits(['value-return']);
</script>
