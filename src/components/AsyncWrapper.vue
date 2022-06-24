<script setup lang="ts">
  import AsyncComp from './AsyncComp.vue';
  defineProps<{ promise: Promise<void> }>();
</script>

<template>
  <Suspense>
    <AsyncComp :promise="promise" />
    <template #fallback><div>fallback</div></template>
  </Suspense>
</template>
