<template>
  <template v-if="isList">
    <template v-for="span in contents" :key="span.content">
      <br v-if="span['isBr']" />
      <span
        v-else
        :style="{
          color: span.color,
          fontWeight: span.fontWeight,
          opacity: span.opacity || 1,
        }"
      >
        {{ span.content }}
      </span>
    </template>
  </template>
  <template v-else>
    <template v-for="(content, i) in contents" :key="content">
      <br v-if="i" />
      {{ content }}
    </template>
  </template>
</template>

<script setup>
import { toRefs } from 'vue';

// eslint-disable-next-line no-undef
const props = defineProps({
  contents: Array,
  isList: Boolean,
});

// eslint-disable-next-line no-undef
const { contents, isList } = toRefs(props);
</script>
