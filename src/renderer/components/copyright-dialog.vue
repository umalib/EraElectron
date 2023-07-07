<template>
  <el-dialog
    v-model="visible"
    @close="emit('copyright-close')"
    title="版权信息"
    width="80%"
  >
    <p>
      <el-descriptions size="large" title="游戏基本信息">
        <template v-if="gameBase.author">
          <el-descriptions-item label="游戏名称">
            {{ gameBase.title }} @ {{ gameBase.id }}
          </el-descriptions-item>
          <el-descriptions-item label="作者">
            {{ gameBase.author }}
          </el-descriptions-item>
          <el-descriptions-item label="版本">
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
        <el-descriptions-item label="版本">
          {{ appVersion }}
        </el-descriptions-item>
        <el-descriptions-item label="发布时间">2023 ～</el-descriptions-item>
        <el-descriptions-item label="开发">路人二号</el-descriptions-item>
        <el-descriptions-item label="例程 & 测试">
          无名路人
          <el-divider direction="vertical" />
          路人二号
        </el-descriptions-item>
      </el-descriptions>
    </p>
  </el-dialog>
</template>

<script setup>
import { toRefs } from 'vue';

// eslint-disable-next-line no-undef
const props = defineProps({
  appVersion: String,
  gameBase: Object,
  visible: Boolean,
});
const { gameBase, visible } = toRefs(props);

// eslint-disable-next-line no-undef
const emit = defineEmits(['copyright-close']);
</script>
