<template>
  <el-scrollbar @click="!input.any || returnFromInput()">
    <el-row v-for="(line, i) in lines" :key="i">
      <div v-if="line.type === lineType['multiCol']"></div>
      <br v-else-if="line.type === lineType['lineUp']" />
      <el-col
        v-else
        :offset="line.offset || defaultSetting.colOffset"
        :span="line.width || defaultSetting.colWidth"
        :style="{ textAlign: line.textAlign || defaultSetting.textAlign }"
      >
        <el-button
          v-if="line.type === lineType.button"
          @click="returnFromButton(line.num)"
          :disabled="line.valCount < buttonValCount"
          :type="line.buttonType"
          :link="!line.isButton"
        >
          {{ line.content }}
        </el-button>
        <el-divider v-if="line.type === lineType['divider']" />
        <div v-if="line.type === lineType['progress']">
          <el-progress
            :color="line.color"
            :stroke-width="line.height"
            :text-inside="true"
          >
            <span>{{ line.inContent }}</span>
          </el-progress>
          <span>{{ line.outContent }}</span>
        </div>
        <div v-if="line.type === lineType.text">
          <p v-if="line.isParagraph">
            <span v-for="(content, i) in line.contents" :key="content">
              <br v-if="i !== 0" />
              {{ content }}
            </span>
          </p>
          <div v-else>
            <span v-for="(content, i) in line.contents" :key="content">
              <br v-if="i !== 0" />
              {{ content }}
            </span>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row v-if="input.key">
      <el-col
        :offset="defaultSetting.colOffset"
        :span="defaultSetting.colWidth"
        :style="{ textAlign: defaultSetting.textAlign }"
      >
        <el-input
          v-model="input.val"
          @change="returnFromInput()"
          @blur="focusInput()"
          @input="!input.any || returnFromInput()"
          :placeholder="`${input.any ? '按任意键继续……' : ''}`"
          autofocus
          ref="elInput"
        />
      </el-col>
    </el-row>
    <el-row>
      <el-col style="text-align: center">
        <el-button type="primary" @click="reload()">Reload</el-button>
      </el-col>
    </el-row>
  </el-scrollbar>
</template>

<script>
import { ElMessage, ElNotification } from 'element-plus';

import connector from '@/renderer/utils/connector';
import embeddedData from '@/renderer/utils/embedded.json';
import { safeUndefinedCheck } from '@/renderer/utils/value-utils';

export default {
  data() {
    return {
      buttonValCount: 0,
      defaultSetting: {},
      input: {},
      lineType: embeddedData.lineType,
      lines: [],
    };
  },
  methods: {
    clear(count) {
      const lineCount = Number(count);
      if (isNaN(lineCount) || lineCount > this.lines.length) {
        this.lines = [];
        this.buttonValCount = 0;
      } else if (lineCount > 0) {
        this.lines.slice(this.lines.length - lineCount, lineCount);
      }
    },
    focusInput() {
      if (this.$refs.elInput) {
        this.$refs.elInput.focus();
      }
    },
    getButtonObject(data) {
      return {
        buttonType: safeUndefinedCheck(data.config.type, 'primary'),
        content: data.str,
        isButton: data.config.isButton,
        num: data.num,
        offset: safeUndefinedCheck(
          data.config.offset,
          this.defaultSetting.colOffset,
        ),
        textAlign: safeUndefinedCheck(
          data.config.align,
          this.defaultSetting.textAlign,
        ),
        type: this.lineType.button,
        valCount: this.buttonValCount,
        width: safeUndefinedCheck(
          data.config.width,
          this.defaultSetting.colWidth,
        ),
      };
    },
    getProgressObject(data) {
      return {
        type: this.lineType.progress,
        inContent: data['in'],
        outContent: data['out'],
        color: data.color,
        height: data.config.height || 24,
        width: Math.floor(24 * data.config.width),
      };
    },
    getTextObject(data) {
      return {
        contents: data.content.split('\n'),
        isParagraph: data.config.isParagraph || data.config.p,
        offset: safeUndefinedCheck(
          data.config.offset,
          this.defaultSetting.colOffset,
        ),
        textAlign: safeUndefinedCheck(
          data.config.align,
          this.defaultSetting.textAlign,
        ),
        type: this.lineType.text,
        width: safeUndefinedCheck(
          data.config.width,
          this.defaultSetting.colWidth,
        ),
      };
    },
    reload() {
      this.resetData();
      this.clear();
      connector.reload();
    },
    resetData() {
      this.buttonValCount = 0;
      this.defaultSetting = {
        colOffset: 0,
        colWidth: 24,
        // maxHeight: 880,
        textAlign: 'left',
      };
      this.input = {
        any: false,
        disableBefore: false,
        key: '',
        rule: undefined,
        val: '',
      };
    },
    returnFromButton(val) {
      connector.returnInput(this.input.key, val);
      this.input.any = false;
      this.input.rule = undefined;
      this.input.val = '';
      if (this.input.disableBefore) {
        this.buttonValCount++;
        this.input.disableBefore = false;
      }
      this.lines.pop();
    },
    returnFromInput() {
      if (this.input.rule && !this.input.rule.test(this.input.val.toString())) {
        ElMessage.error(
          `输入不合法！输入规范：${this.input.rule.source.substring(
            1,
            this.input.rule.source.length - 1,
          )}`,
        );
        return;
      }
      this.returnFromButton(this.input.val);
    },
    // setMaxHeight(height) {
    //   const _height = Number(height);
    //   if (!isNaN(_height) && _height > 0) {
    //     this.defaultSetting.maxHeight = height;
    //   }
    // },
    setOffset(offset) {
      const _offset = Number(offset);
      if (!isNaN(_offset) && _offset >= 0 && _offset <= 23) {
        this.defaultSetting.colOffset = _offset;
      }
    },
    setWidth(width) {
      const _width = Number(width);
      if (!isNaN(_width) && _width >= 1 && _width <= 24) {
        this.defaultSetting.colWidth = _width;
      }
    },
    showInput(data) {
      this.input.val = '';
      this.input.key = data.inputKey;
      this.input.disableBefore = data.disableBefore;
      if (data.config.rule) {
        this.input.rule = new RegExp(`^${data.config.rule}$`);
      }
      this.input.any = data.config.any;
    },
    throwError(message) {
      ElNotification({
        title: '脚本错误',
        message,
        duration: 0,
        type: 'error',
      });
    },
  },
  mounted() {
    connector.register('clear', this.clear);
    connector.register('drawLine', () =>
      this.lines.push({ type: this.lineType['divider'] }),
    );
    connector.register('error', this.throwError);
    connector.register('input', this.showInput);
    connector.register('log', console.log);
    connector.register('print', (data) =>
      this.lines.push(this.getTextObject(data)),
    );
    connector.register('printButton', (data) =>
      this.lines.push(this.getButtonObject(data)),
    );
    connector.register('println', () =>
      this.lines.push({ type: this.lineType['lineUp'] }),
    );
    connector.register('printProgress', (data) =>
      this.lines.push(this.getProgressObject(data)),
    );
    connector.register(
      'setAlign',
      (align) => (this.defaultSetting.textAlign = align),
    );
    // connector.register('setMaxHeight', this.setMaxHeight);
    connector.register('setOffset', this.setOffset);
    connector.register('setWidth', this.setWidth);
    connector.register('setTitle', (title) => (document.title = title));
    connector.ready();
  },
  name: 'GameMain',
};
</script>
