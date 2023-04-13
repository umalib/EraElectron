<template>
  <el-scrollbar @click="!inputParam.any || returnFromInput()">
    <el-row v-for="(line, i) in lines" :key="i">
      <template v-if="line.type === lineType['multiCol']"></template>
      <br v-else-if="line.type === lineType['lineUp']" />
      <el-col
        v-else
        :offset="line.offset || defaultSetting.colOffset"
        :span="line.width || defaultSetting.colWidth"
        :style="{ textAlign: line.textAlign || defaultSetting.textAlign }"
      >
        <el-button
          v-if="line.type === lineType.button"
          @click="returnFromButton(line.accelerator)"
          :disabled="line.valCount < buttonValCount"
          :type="line.buttonType"
          :link="!line.isButton"
        >
          {{ line.content }}
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
    </el-row>
    <el-row>
      <el-col
        :offset="defaultSetting.colOffset"
        :span="defaultSetting.colWidth"
        :style="{ textAlign: defaultSetting.textAlign }"
      >
        <el-input
          v-if="inputParam.key"
          v-model="inputParam.val"
          @blur="focusInput()"
          @change="returnFromInput()"
          @keyup.enter="!inputParam.any || returnFromInput()"
          @input="!inputParam.any || returnFromInput()"
          :placeholder="`${inputParam.any ? '按任意键继续……' : ''}`"
          autofocus
          ref="elInput"
        />
      </el-col>
    </el-row>
    <el-row>
      <el-col style="text-align: center">
        <el-button-group>
          <el-button type="warning" @click="restart()">Restart</el-button>
          <el-button type="danger" @click="reload()">Reload</el-button>
        </el-button-group>
      </el-col>
    </el-row>
  </el-scrollbar>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';

import connector from '@/renderer/utils/connector';
import embeddedData from '@/renderer/utils/embedded.json';
import {
  getValidValue,
  safeUndefinedCheck,
} from '@/renderer/utils/value-utils';

const buttonValCount = ref(0);
const defaultSetting = ref({});
const inputParam = ref({});
const lines = ref([]);
const lineType = embeddedData.lineType;

function clear(count) {
  const lineCount = Number(count);
  if (isNaN(lineCount) || lineCount > lines.value.length) {
    lines.value = [];
    buttonValCount.value = 0;
  } else if (lineCount > 0) {
    lines.value.slice(lines.value.length - lineCount, lineCount);
  }
}
function focusInput() {
  const elInput = ref();
  if (elInput.value) {
    elInput.value.focus();
  }
}
function getValidOffset(offset) {
  return getValidValue(offset, 0, 23, defaultSetting.value['colOffset']);
}
function getValidWidth(width) {
  return getValidValue(width, 1, 24, defaultSetting.value['colWidth']);
}
function getButtonObject(data) {
  return {
    accelerator: data.accelerator,
    buttonType: safeUndefinedCheck(data.config.type, 'primary'),
    content: data.content,
    isButton: data.config.isButton,
    offset: getValidOffset(data.config.offset),
    textAlign: safeUndefinedCheck(
      data.config.align,
      defaultSetting.value['textAlign'],
    ),
    type: lineType.button,
    valCount: buttonValCount.value,
    width: getValidWidth(data.config.width),
  };
}
function getProgressObject(data) {
  const ratio = getValidValue(data.config.barRatio || 1, 0, 1, 1);
  const percentage = getValidValue(data.percentage, 0, 100, 100);
  const height = getValidValue(data.config.height, 6, 30, 6);
  return {
    barColor: data.config.color,
    barWidth: Math.floor(24 * ratio),
    fontColor: data.config.fontColor,
    height,
    inContent: data['in'],
    offset: getValidOffset(data.config.offset),
    outContent: data['out'],
    percentage,
    textAlign: safeUndefinedCheck(
      data.config.align,
      defaultSetting.value['textAlign'],
    ),
    type: lineType.progress,
    width: getValidWidth(data.config.width),
  };
}
function getTextObject(data) {
  return {
    contents: data.content.split('\n'),
    isParagraph: data.config.isParagraph || data.config.p,
    offset: getValidOffset(data.config.offset),
    textAlign: safeUndefinedCheck(
      data.config.align,
      defaultSetting.value['textAlign'],
    ),
    type: lineType.text,
    width: getValidWidth(data.config.width),
  };
}

function reload() {
  resetData();
  connector.reload();
}

function restart() {
  resetData();
  connector.restart();
}

function resetData() {
  buttonValCount.value = 0;
  defaultSetting.value = {
    colOffset: 0,
    colWidth: 24,
    // maxHeight: 880,
    textAlign: 'left',
  };
  inputParam.value = {
    any: false,
    disableBefore: false,
    key: '',
    rule: undefined,
    val: '',
  };
  clear();
}

function returnFromButton(val) {
  connector.returnInput(inputParam.value['key'], val);
  inputParam.value.any = false;
  inputParam.value.rule = undefined;
  inputParam.value.val = '';
  if (inputParam.value['disableBefore']) {
    buttonValCount.value++;
    inputParam.value.disableBefore = false;
  }
  lines.value.pop();
}
function returnFromInput() {
  if (
    inputParam.value['rule'] &&
    !inputParam.value['rule'].test(inputParam.value['val'].toString())
  ) {
    ElMessage.error(
      `输入不合法！输入规范：${inputParam.value['rule'].source.substring(
        1,
        inputParam.value['rule'].source.length - 1,
      )}`,
    );
    return;
  }
  returnFromButton(inputParam.value['val']);
}
// setMaxHeight(height) {
//   const _height = Number(height);
//   if (!isNaN(_height) && _height > 0) {
//     defaultSetting.value['maxHeight'] = height;
//   }
// }
function setOffset(offset) {
  defaultSetting.value.colOffset = getValidOffset(offset);
}
function setWidth(width) {
  defaultSetting.value.colWidth = getValidWidth(width);
}
function showInput(data) {
  inputParam.value.val = '';
  inputParam.value.key = data.inputKey;
  inputParam.value.disableBefore = data.disableBefore;
  if (data.config.rule) {
    inputParam.value.rule = new RegExp(`^${data.config.rule}$`);
  }
  inputParam.value.any = data.config.any;
}
function throwError(message) {
  ElNotification({
    title: '脚本错误',
    message,
    duration: 0,
    type: 'error',
  });
}

resetData();
connector.register('clear', clear);
connector.register('drawLine', () =>
  lines.value.push({ type: lineType['divider'] }),
);
connector.register('error', throwError);
connector.register('input', showInput);
connector.register('log', console.log);
connector.register('print', (data) => lines.value.push(getTextObject(data)));
connector.register('printButton', (data) =>
  lines.value.push(getButtonObject(data)),
);
connector.register('println', () =>
  lines.value.push({ type: lineType['lineUp'] }),
);
connector.register('printProgress', (data) =>
  lines.value.push(getProgressObject(data)),
);
connector.register(
  'setAlign',
  (align) => (defaultSetting.value.textAlign = align),
);
// connector.register('setMaxHeight', setMaxHeight);
connector.register('setOffset', setOffset);
connector.register('setWidth', setWidth);
connector.register('setTitle', (title) => (document.title = title));
connector.ready();
</script>
