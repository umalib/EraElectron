<template>
  <el-col
    :offset="line.offset || defaultSetting.colOffset"
    :span="line.width || defaultSetting.colWidth"
    :style="{ textAlign: line.textAlign || defaultSetting.textAlign }"
  >
    <el-button
      v-if="line.type === lineType.button"
      @click="emit('value-return', line.accelerator)"
      :disabled="line.disabled || line.valCount < buttonValCount"
      :type="line.buttonType"
      :link="!line.isButton"
    >
      <span :style="{ textAlign: line.inTextAlign }">
        <template
          v-for="(content, index) in line.contents"
          :key="`button-${index}`"
        >
          <br v-if="index !== 0" />
          {{ content }}
        </template>
      </span>
    </el-button>
    <el-divider v-if="line.type === lineType['divider']" />
    <el-row v-if="line.type === lineType['progress']">
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
      <el-col :span="24 - line.barWidth">
        <span>{{ line.outContent }}</span>
      </el-col>
    </el-row>
    <template v-if="line.type === lineType.text">
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
    </template>
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