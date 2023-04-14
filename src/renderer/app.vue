<template>
  <el-scrollbar @click="!inputParam.any || returnFromInput()">
    <el-row
      v-for="(line, i) in lines"
      :key="i"
      :justify="line.justify"
      :align="line.align"
    >
      <template v-if="line.type === lineType['multiCol']">
        <el-col
          v-for="(col, j) in line.columns"
          :key="`col-${i}-${j}`"
          :offset="col.offset || defaultSetting.colOffset"
          :span="col.width || defaultSetting.colWidth"
          :style="{ textAlign: col.textAlign || defaultSetting.textAlign }"
        >
          <el-button
            v-if="col.type === lineType.button"
            @click="returnFromButton(col.accelerator)"
            :disabled="col.valCount < buttonValCount"
            :type="col.buttonType"
            :link="!col.isButton"
          >
            <span :style="{ textAlign: col.inTextAlign }">
              <template
                v-for="(content, index) in col.contents"
                :key="`button-${index}`"
              >
                <br v-if="index !== 0" />
                {{ content }}
              </template>
            </span>
          </el-button>
          <el-row v-if="col.type === lineType['progress']">
            <el-col :span="col.barWidth">
              <el-progress
                :color="col.barColor"
                :percentage="col.percentage"
                :stroke-width="col.height"
                :text-inside="true"
              >
                <span :style="{ color: col.fontColor }">
                  {{ col.inContent }}
                </span>
              </el-progress>
            </el-col>
            <el-col :span="24 - col.barWidth">
              <span>{{ col.outContent }}</span>
            </el-col>
          </el-row>
          <template v-if="col.type === lineType.text">
            <p v-if="col.isParagraph">
              <span v-for="(content, i) in col.contents" :key="content">
                <br v-if="i !== 0" />
                {{ content }}
              </span>
            </p>
            <template v-else>
              <template v-for="(content, i) in col.contents" :key="content">
                <br v-if="i !== 0" />
                {{ content }}
              </template>
            </template>
          </template>
        </el-col>
      </template>
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
  <el-dialog v-model="copyrightVisible" title="版权信息" width="80%">
    <p>
      <el-descriptions size="large" title="游戏基本信息">
        <template v-if="gameBase.author">
          <el-descriptions-item label="游戏名">
            {{ gameBase.title }} @ {{ gameBase.id }}
          </el-descriptions-item>
          <el-descriptions-item label="作者">
            {{ gameBase.author }}
          </el-descriptions-item>
          <el-descriptions-item label="版本号">
            {{ gameBase.version / 1000 }}
          </el-descriptions-item>
          <el-descriptions-item label="游戏发布时间">
            {{ gameBase['publishTime'] }}
          </el-descriptions-item>
          <el-descriptions-item label="最低支持版本">
            {{ gameBase['lowestVersion'] / 1000 }}
          </el-descriptions-item>
          <el-descriptions-item label="追加信息">
            {{ gameBase.info }}
          </el-descriptions-item>
        </template>
        <template v-else>
          <el-descriptions-item label="未知">
            未加载游戏，还什么都不知道哦
          </el-descriptions-item>
        </template>
      </el-descriptions>
    </p>
    <p>
      <el-descriptions size="large" title="引擎信息">
        <el-descriptions-item label="名称">ERA-Electron</el-descriptions-item>
        <el-descriptions-item label="版本">0.9.0</el-descriptions-item>
        <el-descriptions-item label="发布时间">2023 ～</el-descriptions-item>
        <el-descriptions-item label="开发">
          风之低吟
          <el-divider direction="vertical" />
          Takatoshi
        </el-descriptions-item>
        <el-descriptions-item label="例程 & 测试">
          Takatoshi
        </el-descriptions-item>
      </el-descriptions>
    </p>
  </el-dialog>
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
const copyrightVisible = ref(false);
const defaultSetting = ref({});
const inputParam = ref({});
const lines = ref([]);
const lineType = embeddedData.lineType;
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
    buttonType: safeUndefinedCheck(data.config.buttonType, 'primary'),
    contents: data.content.split('\n'),
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
    justify: data.config.justify || 'start',
    align: data.config.align || 'top',
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
