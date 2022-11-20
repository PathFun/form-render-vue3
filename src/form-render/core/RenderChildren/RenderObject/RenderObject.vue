<script lang="ts" setup>
import Core from '../../Core.vue';
defineProps<{
  children: any[];
  dataIndex: number[];
  labelAlign: 'left' | 'right';
  displayType: 'column' | 'row' | 'inline';
  hideTitle: boolean;
}>();
</script>
<template>
  <Core
    v-for="(child, index) in children"
    :id="child"
    :key="index"
    :data-index="dataIndex"
    :display-type="displayType"
    :label-align="labelAlign"
    :hide-title="hideTitle"
  />
</template>
