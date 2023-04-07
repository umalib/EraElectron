<template>
  <div>
    <span v-for="(line, i) in lines" :key="i">
      <el-divider v-if="line.type === lineType.divider" />
      <el-row v-else :style="{ textAlign: line.textAlign || defaultAlign }">
        <el-col :span="line.width || 24">
          <el-button v-if="line.type === lineType.button && line.isButton">
            {{ line.content }}
          </el-button>
          <el-link v-if="line.type === lineType.button && !line.isButton">
            {{ line.content }}
          </el-link>
          <p v-if="line.type === lineType.text">{{ line.content }}</p>
        </el-col>
      </el-row>
      <br v-if="line.type === lineType.lineUp" />
    </span>
  </div>
</template>

<script>
import connector from '@/renderer/utils/connector';
import embeddedData from '@/renderer/utils/data';

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
    connector.register('print', (str) => {
      this.lines.push({
        content: str,
        textAlign: this.defaultAlign,
        type: this.lineType.text,
      });
    });
    connector.register('println', () => {
      this.lines.push({ type: this.lineType.lineUp });
    });
    connector.register('setAlign', (align) => {
      this.defaultAlign = align;
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
