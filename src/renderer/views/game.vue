<template>
  <div>
    <span v-for="(line, i) in lines" :key="i">
      <el-divider v-if="line.type === lineType['divider']" />
      <el-row v-else-if="line.type === lineType['multiCol']"></el-row>
      <el-row v-else>
        <el-col
          :offset="line.offset || defaultOffset"
          :span="line.width || defaultColWidth"
          :style="{ textAlign: line.textAlign || defaultAlign }"
        >
          <span v-if="line.type === lineType.button">
            <el-button
              v-if="line.isButton"
              @click="returnFromButton(line.num)"
              :type="line.buttonType"
            >
              {{ line.content }}
            </el-button>
            <el-link v-else @click="returnFromButton(line.num)">
              {{ line.content }}
            </el-link>
          </span>

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

          <el-input
            v-if="line.type === lineType.input"
            v-model="input.val"
            @change="returnInput()"
            :style="{ display: line.hidden ? 'none' : '' }"
            autofocus
          />
        </el-col>
      </el-row>
      <br v-if="line.type === lineType['lineUp']" />
    </span>
    <el-row>
      <el-col style="text-align: center">
        <el-button type="primary" @click="reload()">Reload</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ElMessage, ElNotification } from 'element-plus';

import embeddedData from '@/renderer/utils/embedded.json';
import connector from '@/renderer/utils/connector';

export default {
  data() {
    return {
      defaultAlign: 'left',
      defaultColWidth: 24,
      defaultOffset: 0,
      lineType: embeddedData.lineType,
      lines: [],
      input: {
        key: '',
        rule: undefined,
        val: '',
      },
    };
  },
  methods: {
    clear(count) {
      const lineCount = Number(count);
      if (isNaN(lineCount) || lineCount > this.lines.length) {
        this.lines = [];
      } else if (lineCount > 0) {
        this.lines.slice(this.lines.length - lineCount, lineCount);
      }
    },
    getButtonObject(data) {
      const tmp = {
        num: data.num,
        content: data.str,
        type: this.lineType.button,
      };
      if (data.config) {
        tmp.buttonType = data.config.type;
        tmp.isButton = data.config.isButton;
        tmp.textAlign = data.config.align;
      }
      return tmp;
    },
    getInputObject(data) {
      const tmp = {
        type: this.lineType.input,
      };
      this.input.val = '';
      this.input.key = data.inputKey;
      if (data.config) {
        if (data.config.rule) {
          this.input.rule = new RegExp(`^${data.config.rule}$`);
        }
        tmp.hidden = data.config.hidden;
      }
      return tmp;
    },
    getLineUpObject() {
      return { type: this.lineType['lineUp'] };
    },
    getTextObject(data) {
      const tmp = {
        contents: data.content.split('\n'),
        type: this.lineType.text,
      };
      if (data.config) {
        tmp.textAlign = data.config.align;
        tmp.isParagraph = data.config.isParagraph || data.config.p;
      }
      return tmp;
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
    returnInput() {
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
    setOffset(offset) {
      const _offset = Number(offset);
      if (!isNaN(_offset) && _offset >= 0 && _offset <= 23) {
        this.defaultOffset = _offset;
      }
    },
    setWidth(width) {
      const _width = Number(width);
      if (!isNaN(_width) && _width >= 1 && _width <= 24) {
        this.defaultColWidth = _width;
      }
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
    connector.register('input', (data) =>
      this.lines.push(this.getInputObject(data)),
    );
    connector.register('log', console.log);
    connector.register('print', (data) =>
      this.lines.push(this.getTextObject(data)),
    );
    connector.register('printButton', (data) =>
      this.lines.push(this.getButtonObject(data)),
    );
    connector.register('println', () =>
      this.lines.push(this.getLineUpObject()),
    );
    connector.register('setAlign', (align) => (this.defaultAlign = align));
    connector.register('setOffset', this.setOffset);
    connector.register('setWidth', this.setWidth);
    connector.register('setTitle', (title) => (document.title = title));
    connector.ready();
  },
  name: 'GameMain',
};
</script>
