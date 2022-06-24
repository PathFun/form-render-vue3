<script setup lang="ts">
  import AsyncWrapper from './AsyncWrapper.vue';
  const promiseFn: Promise<void> = new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve();
    }, 3000);
  });
</script>

<template>
  <AsyncWrapper :promise="promiseFn" />
</template>

<style scoped>
  a {
    color: #42b983;
  }

  label {
    margin: 0 0.5em;
    font-weight: bold;
  }

  code {
    background-color: #eee;
    padding: 2px 4px;
    border-radius: 4px;
    color: #304455;
  }
</style>
