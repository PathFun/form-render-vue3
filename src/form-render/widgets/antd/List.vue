<script lang="ts" setup>
import { defineProps } from 'vue';
defineProps<{
  onChange: (...args: any[]) => any;
}>();
</script>
<template>
  <div class="w-100"><slot /></div>
</template>
