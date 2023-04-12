<template>
  <div>
    <div v-for="(line, i) in lines" :key="i">
      <el-divider v-if="line.type === lineType['divider']" />
      <el-row v-else-if="line.type === lineType['multiCol']"></el-row>
      <el-row v-else>
        <el-col
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

          <span v-if="line.type === lineType.text">
            <p v-if="line.isParagraph">
              <span v-for="(content, i) in line.contents" :key="content">
                <br v-if="i !== 0" />
                {{ content }}
              </span>
            </p>
            <span v-else>
              <span v-for="(content, i) in line.contents" :key="content">
                <br v-if="i !== 0" />
                {{ content }}
              </span>
            </span>
          </span>
        </el-col>
      </el-row>
      <br v-if="line.type === lineType['lineUp']" />
    </div>
    <el-input
      v-if="input.key"
      v-model="input.val"
      ref="elInput"
      @change="returnFromInput()"
      @blur="focusInput()"
      @input="!input.any || returnFromInput()"
      autofocus
    />
    <el-row>
      <el-col style="text-align: center">
        <el-button type="primary" @click="reload()">Reload</el-button>
      </el-col>
    </el-row>
  </div>
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
      defaultSetting: {
        colOffset: 0,
        colWidth: 24,
        textAlign: 'left',
      },
      input: {
        any: false,
        disableBefore: false,
        key: '',
        rule: undefined,
        val: '',
      },
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
      this.$refs.elInput.focus();
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
      connector.reload();
    },
    returnFromButton(val) {
      connector.returnInput(this.input.key, val);
      this.input.rule = undefined;
      this.input.val = '';
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
      connector.returnInput(this.input.key, this.input.val);
      this.input.rule = undefined;
      this.input.val = '';
      this.lines.pop();
    },
    returnInput(val) {
      connector.returnInput(this.input.key, val);
      this.input.rule = undefined;
      this.input.val = '';
      if (this.input.disableBefore) {
        this.buttonValCount++;
        this.input.disableBefore = false;
      }
      this.lines.pop();
    },
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
    connector.register(
      'setAlign',
      (align) => (this.defaultSetting.textAlign = align),
    );
    connector.register('setOffset', this.setOffset);
    connector.register('setWidth', this.setWidth);
    connector.register('setTitle', (title) => (document.title = title));
    connector.ready();
  },
  name: 'GameMain',
};
</script>
