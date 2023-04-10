<template>
  <div>
    <span v-for="(line, i) in lines" :key="i">
      <el-divider v-if="line.type === lineType.divider" />
      <el-row v-else>
        <el-col
          :span="line.width || 24"
          :style="{ textAlign: line.textAlign || defaultAlign }"
        >
          <span v-if="line.type === lineType.button">
            <el-button v-if="line.isButton" @click="returnFromButton(line.num)">
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
          />
        </el-col>
      </el-row>
      <br v-if="line.type === lineType.lineUp" />
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

import embeddedData from '@/renderer/utils/data';
import connector from '@/renderer/utils/connector';

export default {
  data() {
    return {
      defaultAlign: 'left',
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
    reload() {
      connector.reload();
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
    returnFromButton(val) {
      connector.returnInput(this.input.key, val);
      this.input.rule = undefined;
      this.input.val = '';
      this.lines.pop();
    },
  },
  mounted() {
    connector.register('clear', (count) => {
      const lineCount = Number(count);
      if (isNaN(lineCount) || lineCount > this.lines.length) {
        this.lines = [];
      } else if (lineCount > 0) {
        this.lines.slice(this.lines.length - lineCount, lineCount);
      }
    });
    connector.register('drawLine', () =>
      this.lines.push({ type: this.lineType.divider }),
    );
    connector.register('error', (message) =>
      ElNotification({
        title: '脚本错误',
        message,
        duration: 0,
        type: 'error',
      }),
    );
    connector.register('input', (data) => {
      this.input.val = '';
      this.input.key = data.inputKey;
      if (data.rule) {
        this.input.rule = new RegExp(`^${data.rule}$`);
      }
      this.lines.push({ type: this.lineType.input });
    });
    connector.register('log', (info) => console.log(info));
    connector.register('print', (data) =>
      this.lines.push({
        contents: data.content.split('\n'),
        textAlign: data.config.align || this.defaultAlign,
        type: this.lineType.text,
        isParagraph: data.config['paragraph'] || data.config.p,
      }),
    );
    connector.register('printButton', (data) =>
      this.lines.push({
        num: data.num,
        content: data.str,
        isButton: data.isButton,
        textAlign: this.defaultAlign,
        type: this.lineType.button,
      }),
    );
    connector.register('println', () =>
      this.lines.push({ type: this.lineType.lineUp }),
    );
    connector.register('setAlign', (align) => (this.defaultAlign = align));
    connector.ready();
  },
  name: 'GameMain',
};
</script>
