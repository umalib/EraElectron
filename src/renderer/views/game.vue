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
            <el-button v-if="line.isButton">
              {{ line.content }}
            </el-button>
            <el-link v-else>
              {{ line.content }}
            </el-link>
          </span>
          <span v-if="line.type === lineType.text">
            <p v-if="line.isParagraph">{{ line.content }}</p>
            <span v-else>{{ line.content }}</span>
          </span>
          <el-input
            v-if="line.type === lineType.input"
            v-model="input.val"
            @change="returnInput"
          />
        </el-col>
      </el-row>
      <br v-if="line.type === lineType.lineUp" />
    </span>
    <el-row>
      <el-col style="text-align: center">
        <el-button type="primary" @click="reload">Reload</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ElMessage, ElNotification } from 'element-plus';

import embeddedData from '@/renderer/utils/data';
import connector from '@/renderer/utils/connector';
import csv from '@/renderer/utils/csv-utils';

export default {
  mounted() {
    connector.register('clear', () => (this.lines = []));
    connector.register('drawLine', () =>
      this.lines.push({ type: this.lineType.divider }),
    );
    connector.register('error', (message) =>
      ElNotification({
        title: '脚本错误',
        message,
        duration: 0,
      }),
    );
    connector.register('input', (data) => {
      this.input.val = '';
      this.input.key = data.inputKey;
      if (data.rule) {
        this.input.rule = new RegExp(data.rule);
      }
      this.lines.push({ type: this.lineType.input });
    });
    connector.register('log', (info) => console.log(info));
    connector.register('print', (data) =>
      this.lines.push({
        content: data.content,
        textAlign: this.defaultAlign,
        type: this.lineType.text,
        isParagraph: data.isParagraph,
      }),
    );
    connector.register('printButton', (data) =>
      this.lines.push({
        accelerator: data.num,
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
    connector.register('parse', (content) => console.log(csv.parse(content)));
    connector.ready();
  },
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
        ElMessage.error(`输入不合法！输入规范：${this.input.rule.source}`);
        return;
      }
      connector.returnInput(this.input.key, this.input.val);
      this.input.rule = undefined;
      this.input.val = '';
      this.lines.pop();
    },
  },
  name: 'GameMain',
};
</script>
