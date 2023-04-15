<template>
  <el-container>
    <el-main>
      <el-scrollbar @click="!inputParam.any || returnFromInput()">
        <el-row
          v-for="(line, i) in lines"
          :key="i"
          :justify="line.justify"
          :align="line.align"
        >
          <template v-if="line.type === lineType['multiCol']">
            <print-block
              v-for="(col, j) in line.columns"
              @value-return="returnFromButton($event)"
              :key="`col-${i}-${j}`"
              :button-val-count="buttonValCount.toString()"
              :default-setting="defaultSetting"
              :line="col"
            />
          </template>
          <br v-else-if="line.type === lineType['lineUp']" />
          <print-block
            v-else
            @value-return="returnFromButton($event)"
            :button-val-count="buttonValCount.toString()"
            :default-setting="defaultSetting"
            :line="line"
          />
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
      </el-scrollbar>
      <copyright-dialog :visible="copyrightVisible" :game-base="gameBase" />
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';

import CopyrightDialog from '@/renderer/components/copyright-dialog.vue';
import PrintBlock from '@/renderer/components/print-block.vue';
import connector from '@/renderer/utils/connector';
import embeddedData from '@/renderer/utils/embedded.json';
import {
  getValidValue,
  safeUndefinedCheck,
} from '@/renderer/utils/value-utils';

const lineType = embeddedData.lineType;

const buttonValCount = ref(0);
const copyrightVisible = ref(false);
const defaultSetting = ref({});
const inputParam = ref({});
const lines = ref([]);
const gameBase = ref({});

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
    badge: data.config.badge,
    buttonType: safeUndefinedCheck(
      data.config.buttonType,
      data.config.isButton ? '' : 'primary',
    ),
    contents: data.content.replace(/]\s*/, '] ').split('\n'),
    disabled: data.config.disabled,
    inTextAlign: data.config.inTextAlign || 'center',
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

function getMultiColumnObjects(data) {
  return {
    type: lineType.multiCol,
    columns: data.columns
      .map((x) => {
        if (!x.config) {
          x.config = {};
        }
        switch (lineType[x.type]) {
          case lineType.button:
            return getButtonObject(x);
          case lineType.progress:
            return getProgressObject(x);
          case lineType.text:
            return getTextObject(x);
          default:
            return undefined;
        }
      })
      .filter((x) => x),
    justify: data.config.horizontalAlign || 'start',
    align: data.config.verticalAlign || 'top',
  };
}

function getProgressObject(data) {
  const height = getValidValue(data.config.height, 6, 30, 6);
  const percentage = getValidValue(data.percentage, 0, 100, 100);
  const ratio = getValidValue(data.config.barRatio || 1, 0, 1, 1);
  return {
    barColor: data.config.color,
    barWidth: Math.floor(24 * ratio),
    fontColor: data.config.fontColor,
    height,
    inContent: data.inContent,
    offset: getValidOffset(data.config.offset),
    outContent: data.outContent,
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
  gameBase.value = {};
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
  inputParam.value.disableBefore = data.config.disableBefore;
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
const engineCommand = embeddedData.engineCommand;
connector.registerMenu((action) => {
  switch (action) {
    case engineCommand.copyright:
      copyrightVisible.value = true;
      break;
    case engineCommand.reload:
      resetData();
      connector.reload();
      break;
    case engineCommand.restart:
      resetData();
      connector.restart();
      break;
    default:
      break;
  }
});
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
connector.register('printMultiCols', (data) =>
  lines.value.push(getMultiColumnObjects(data)),
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
connector.register('setGameBase', (_gamebase) => {
  gameBase.value = _gamebase;
  if (gameBase.value['author']) {
    document.title = gameBase.value['title'];
  }
});
// connector.register('setMaxHeight', setMaxHeight);
connector.register('setOffset', setOffset);
connector.register('setWidth', setWidth);
connector.register('setTitle', (title) => (document.title = title));
connector.ready();
</script>
