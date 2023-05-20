<template>
  <el-container>
    <el-main>
      <el-scrollbar
        @click="!inputParam.any || returnFromInput(inputParam.key)"
        :height="`${defaultSetting.height}px`"
        ref="mainScrollbar"
      >
        <el-row
          v-for="(line, i) in lines"
          :align="line.align"
          :gutter="line.gutter || defaultSetting.gutter"
          :justify="line.justify"
          :key="`row-${i}`"
        >
          <template v-if="line.type === lineType['multiRow']">
            <el-col
              v-for="(col, j) in line.columns"
              :key="`col-${i}-${j}`"
              :span="col.width"
              :offset="col.offset"
            >
              <el-row
                :align="col.align"
                :gutter="col.gutter || defaultSetting.gutter"
                :justify="col.justify"
              >
                <print-block
                  v-for="(suc, k) in col.columns"
                  @value-return="returnFromButton"
                  :button-val-count="buttonValCount"
                  :default-setting="defaultSetting"
                  :key="`col-${i}-${j}-${k}`"
                  :line="suc"
                />
              </el-row>
            </el-col>
          </template>
          <template v-else-if="line.type === lineType['multiCol']">
            <print-block
              v-for="(col, j) in line.columns"
              @value-return="returnFromButton"
              :button-val-count="buttonValCount"
              :default-setting="defaultSetting"
              :key="`col-${i}-${j}`"
              :line="col"
            />
          </template>
          <br v-else-if="line.type === lineType['lineUp']" />
          <el-col
            v-else-if="line.type === lineType['dynamicText']"
            :span="line.width || defaultSetting.colWidth"
            :style="styles[i]"
          >
            <span>
              <text-block :contents="line.contents" :is-list="line.isList" />
            </span>
          </el-col>
          <print-block
            v-else
            @value-return="returnFromButton"
            :button-val-count="buttonValCount"
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
            <p>
              <el-input
                v-model="inputParam.val"
                @keyup.enter="returnFromInput()"
                @input="inputParam.any && returnFromInput()"
                :disabled="!inputParam.key"
                :placeholder="`${inputParam.any ? '按任意键继续……' : ''}`"
                autofocus
                ref="mainInput"
              />
            </p>
          </el-col>
        </el-row>
        <copyright-dialog
          @copyright-close="copyrightVisible = false"
          :game-base="gameBase"
          :visible="copyrightVisible"
        />
      </el-scrollbar>
    </el-main>
  </el-container>
</template>

<script setup>
import { nextTick, ref } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';

import CopyrightDialog from '@/renderer/components/copyright-dialog.vue';
import PrintBlock from '@/renderer/components/print-block.vue';
import TextBlock from '@/renderer/components/text-block.vue';

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
const styles = ref({});
const gameBase = ref({});

const mainScrollbar = ref(null);
const mainInput = ref(null);

function clear(count) {
  const lineCount = Number(count);
  if (isNaN(lineCount) || lineCount > lines.value.length) {
    lines.value = [];
    styles.value = [];
    buttonValCount.value = 0;
  } else if (lineCount > 0) {
    for (let i = lines.value.length - lineCount; i < lines.value.length; ++i) {
      delete styles.value[i];
    }
    lines.value.splice(lines.value.length - lineCount, lines.value.length);
  }
}

function getValidOffset(offset, defVal) {
  return getValidValue(
    offset,
    0,
    23,
    defVal || defaultSetting.value['colOffset'],
  );
}

function getValidWidth(width, defVal) {
  return getValidValue(
    width,
    1,
    24,
    defVal || defaultSetting.value['colWidth'],
  );
}

function getButtonObject(data) {
  if (!data.config.disabled) {
    inputParam.value['rule'].push(data.accelerator);
  }
  return {
    accelerator: data.accelerator,
    badge: data.config.badge,
    buttonType: safeUndefinedCheck(
      data.config.buttonType,
      data.config.isButton ? '' : 'warning',
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

function getDividerObject(data) {
  return {
    border: data.config.isSolid ? 'solid' : 'dashed',
    content: data.config.content || '',
    position: safeUndefinedCheck(data.config.position, 'center'),
    type: lineType.divider,
    width: getValidWidth(data.config.width),
    offset: getValidOffset(data.config.offset),
  };
}

function getImageObject(data) {
  const height = Math.max(...data.images.map((x) => x.height + x.posY));
  const width = Math.max(...data.images.map((x) => x.width + x.posX));
  return {
    height: height < 0 ? 0 : height,
    images: data.images,
    type: lineType.image,
    width: width < 0 ? 0 : width,
  };
}

function getMultiColumnObjects(data) {
  return {
    align: data.config.verticalAlign || 'top',
    columns: data.columns
      .map((x) => {
        if (!x.config) {
          x.config = {};
        }
        switch (lineType[x.type]) {
          case lineType.button:
            return getButtonObject(x);
          case lineType.divider:
            return getDividerObject(x);
          case lineType.image:
            return getImageObject(x);
          case lineType['image.whole']:
            return getWholeImageObject(x);
          case lineType.progress:
            return getProgressObject(x);
          case lineType.text:
            return getTextObject(x);
          default:
            return undefined;
        }
      })
      .filter((x) => x),
    gutter: safeUndefinedCheck(
      data.config.gutter,
      defaultSetting.value['gutter'],
    ),
    justify: data.config.horizontalAlign || 'start',
    type: lineType.multiCol,
    width: data.config.width || 24,
  };
}

function getMultiRowObjects(data) {
  return {
    align: 'top',
    columns: data.columns.map(getMultiColumnObjects),
    gutter: defaultSetting.value['gutter'],
    justify: 'start',
    type: lineType.multiRow,
  };
}

function getProgressObject(data) {
  const percentage = getValidValue(data.percentage, 0, 100, 100);
  const height = getValidValue(data.config.height, 6, 30, 24);
  const ratio = getValidValue(data.config.barRatio, 0, 1, 0.96);
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
    color: data.config.color,
    contents: data.config.isList
      ? data.content
      : data.content.toString().split('\n'),
    isList: data.config.isList,
    isParagraph: data.config.isParagraph,
    offset: getValidOffset(data.config.offset),
    fontSize: safeUndefinedCheck(data.config.fontSize, '16px'),
    textAlign: safeUndefinedCheck(
      data.config.align,
      defaultSetting.value['textAlign'],
    ),
    type: lineType.text,
    width: getValidWidth(data.config.width),
  };
}

function getWholeImageObject(data) {
  return {
    src: data.src,
    type: lineType['image.whole'],
    fit: safeUndefinedCheck(data.config.fit, 'contain'),
    textAlign: safeUndefinedCheck(
      data.config.align,
      defaultSetting.value['textAlign'],
    ),
    offset: getValidOffset(data.config.offset),
    width: getValidWidth(data.config.width),
  };
}

function handlePush(obj) {
  lines.value.push(obj);
  nextTick(() => {
    mainScrollbar.value &&
      mainScrollbar.value.setScrollTop(
        mainScrollbar.value.wrapRef.scrollHeight -
          defaultSetting.value['height'],
      );
    mainInput.value && mainInput.value.focus();
  });
}

function resetData() {
  buttonValCount.value = 0;
  defaultSetting.value = {
    colOffset: 0,
    colWidth: 24,
    height: 800,
    textAlign: 'left',
    gutter: 0,
  };
  inputParam.value = {
    any: false,
    disableBefore: true,
    key: '',
    rule: [],
    useRule: true,
    val: '',
  };
  gameBase.value = {};
  clear();
}

function returnFromButton(val) {
  if (inputParam.value['useRule']) {
    if (inputParam.value['rule'].length === undefined) {
      if (!inputParam.value['rule'].test(val.toString())) {
        ElMessage.error(
          `输入不合法！输入规范：${inputParam.value['rule'].source.substring(
            1,
            inputParam.value['rule'].source.length - 1,
          )}`,
        );
        return;
      }
    } else if (inputParam.value['rule'].length > 0) {
      if (inputParam.value['rule'].indexOf(Number(val)) === -1) {
        ElMessage.error(
          `输入不合法！请输入以下值之一：${inputParam.value['rule'].join(
            ', ',
          )}`,
        );
        return;
      }
    }
  }
  inputParam.value.any = false;
  inputParam.value.rule = [];
  inputParam.value.useRule = true;
  inputParam.value.val = '';
  if (inputParam.value['disableBefore']) {
    buttonValCount.value++;
  } else {
    inputParam.value.disableBefore = true;
  }
  connector.returnInput(inputParam.value['key'], val);
}

function returnFromInput() {
  if (!inputParam.value['any'] && !inputParam.value['val']) {
    return;
  }
  returnFromButton(inputParam.value['val']);
}

function setDynamicStyle(data) {
  Object.entries(data.style).forEach(
    (e) => (styles.value[data.lineNumber][e[0]] = e[1]),
  );
}

function setOffset(offset) {
  defaultSetting.value.colOffset = getValidOffset(offset);
}

function setWidth(width) {
  defaultSetting.value.colWidth = getValidWidth(width);
}

function showDynamicText(data) {
  styles.value[lines.value.length] = {};
  Object.entries(data.style).forEach(
    (e) => (styles.value[lines.value.length][e[0]] = e[1]),
  );
  const object = getTextObject(data);
  object.type = lineType.dynamicText;
  handlePush(object);
}

function showInput(data) {
  inputParam.value.val = '';
  inputParam.value.key = data.inputKey;
  inputParam.value.disableBefore = safeUndefinedCheck(
    data.config.disableBefore,
    true,
  );
  if (data.config.rule) {
    inputParam.value.rule = new RegExp(`^${data.config.rule}$`);
  }
  inputParam.value.useRule = safeUndefinedCheck(data.config.useRule, true);
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
connector.registerMenu((command) => {
  switch (command.action) {
    case engineCommand.copyright:
      copyrightVisible.value = true;
      break;
    case engineCommand.resize:
      defaultSetting.value.height = command.arg - 20 * 2 - 8 * 2;
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
connector.register('drawLine', (data) => handlePush(getDividerObject(data)));
connector.register('error', throwError);
connector.register('input', showInput);
connector.register('log', (data) => {
  if (data.stack) {
    console.log(`${data.info}\n${data.stack}`);
  } else {
    console.log(data.info);
  }
});
connector.register('print', (data) => handlePush(getTextObject(data)));
connector.register('printButton', (data) => handlePush(getButtonObject(data)));
connector.register('printDynamicText', showDynamicText);
connector.register('printImage', (data) => handlePush(getImageObject(data)));
connector.register('printMultiCols', (data) =>
  handlePush(getMultiColumnObjects(data)),
);
connector.register('printMultiRows', (data) =>
  handlePush(getMultiRowObjects(data)),
);
connector.register('println', () => handlePush({ type: lineType['lineUp'] }));
connector.register('printProgress', (data) =>
  handlePush(getProgressObject(data)),
);
connector.register('printWholeImage', (data) =>
  handlePush(getWholeImageObject(data)),
);
connector.register(
  'setAlign',
  (align) => (defaultSetting.value.textAlign = align),
);
connector.register('setDynamicStyle', setDynamicStyle);
connector.register('setGameBase', (_gamebase) => {
  gameBase.value = _gamebase;
  if (gameBase.value['author']) {
    document.title = gameBase.value['title'];
  }
});
connector.register('setOffset', setOffset);
connector.register('setWidth', setWidth);
connector.register('setTitle', (title) => (document.title = title));
connector.ready();
</script>
