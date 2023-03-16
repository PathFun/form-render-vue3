<script lang="ts" setup>
defineProps<{
  onChange: (...args: any[]) => any;
}>();
</script>
<template>
  <div class="w-100"><slot /></div>
</template>
