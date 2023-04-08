<template>
  <div>
    <span v-for="(line, i) in lines" :key="i">
      <el-divider v-if="line.type === lineType.divider" />
      <el-row v-else :style="{ textAlign: line.textAlign || defaultAlign }">
        <el-col :span="line.width || 24">
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
        </el-col>
      </el-row>
      <br v-if="line.type === lineType.lineUp" />
    </span>
  </div>
</template>

<script>
import embeddedData from '@/renderer/utils/data';
import connector from '@/renderer/utils/connector';
import csv from '@/renderer/utils/csv-utils';

export default {
  name: 'GameMain',
  created() {
    connector.register('log', (info) => console.log(info));
    connector.register('button', (data) => {
      this.lines.push({
        accelerator: data.num,
        content: data.str,
        isButton: data.isButton,
        textAlign: this.defaultAlign,
        type: this.lineType.button,
      });
    });
    connector.register('clear', () => (this.lines = []));
    connector.register('drawLine', () => {
      this.lines.push({ type: this.lineType.divider });
    });
    connector.register('print', (data) => {
      this.lines.push({
        content: data.content,
        textAlign: this.defaultAlign,
        type: this.lineType.text,
        isParagraph: data.isParagraph,
      });
    });
    connector.register('println', () => {
      this.lines.push({ type: this.lineType.lineUp });
    });
    connector.register('setAlign', (align) => {
      this.defaultAlign = align;
    });
    connector.register('parse', (content) => {
      console.log(csv.parse(content));
    });
    connector.ready();
  },
  data() {
    return {
      lines: [],
      lineType: embeddedData.lineType,
      defaultAlign: 'left',
    };
  },
};
</script>
