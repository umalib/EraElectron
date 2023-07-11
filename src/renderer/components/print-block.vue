<template>
  <el-col
    :offset="line.offset || defaultSetting.colOffset"
    :span="line.width || defaultSetting.colWidth"
    :style="getBlockStyle()"
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
        <span :style="getButtonStyle()">
          <template
            v-for="(content, index) in line.contents"
            :key="`button-${index}`"
          >
            <br v-if="index" />
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
    <el-container
      v-if="line.type === lineType['image']"
      :style="getImageStyle()"
    >
      <img
        v-for="(img, i) in line['images']"
        :alt="`Image-${i + 1}`"
        :key="`img-${i}`"
        :src="img.src"
        :style="{
          position: 'absolute',
          height: `${img.height}px`,
          objectFit: 'none',
          objectPosition: `-${img.x}px -${img.y}px`,
          width: `${img.width}px`,
          left: `calc(50% + ${img['posX'] - line.width / 2}px)`,
          top: `${img['posY']}px`,
          zIndex: i + 1,
        }"
      />
    </el-container>
    <el-image
      v-if="line.type === lineType['image.whole']"
      :fit="line.fit"
      :src="line.src"
    >
      <template #error><div></div></template>
    </el-image>
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
      <el-col :span="24 - line.barWidth" :style="getOutStyleInProgress()">
        <span>{{ line.outContent }}</span>
      </el-col>
    </el-row>
    <div v-if="line.type === lineType.text" :style="getTextStyle()">
      <p v-if="line.isParagraph">
        <text-block :contents="line.contents" :is-list="line.isList" />
      </p>
      <text-block v-else :contents="line.contents" :is-list="line.isList" />
    </div>
  </el-col>
</template>

<script setup>
import { toRefs } from 'vue';
import TextBlock from '@/renderer/components/text-block.vue';

import { lineType } from '@/renderer/utils/embedded';

// eslint-disable-next-line no-undef
const props = defineProps({
  line: Object,
  defaultSetting: Object,
  buttonValCount: Number,
});
const { line, defaultSetting, buttonValCount } = toRefs(props);

function getBlockStyle() {
  return { textAlign: line.value.textAlign || defaultSetting.value.textAlign };
}

function getButtonStyle() {
  return { fontSize: '16px', textAlign: line.value.inTextAlign };
}

function getImageStyle() {
  return {
    textAlign: 'center',
    width: `${line.value.width}px`,
    height: `${line.value.height}px`,
  };
}

function getOutStyleInProgress() {
  return { color: line.value.fontColor, textAlign: line.value.textAlign };
}

function getTextStyle() {
  return {
    color: line.value.color,
    fontSize: line.value.fontSize,
    fontWeight: line.value.fontWeight,
  };
}

// eslint-disable-next-line no-undef
const emit = defineEmits(['value-return']);
</script>
