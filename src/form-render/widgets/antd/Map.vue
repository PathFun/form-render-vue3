<template>
  <div v-if="!schema.title" class="w-100">
    <slot />
  </div>
  <div v-else-if="theme + '' === '1'" class="w-100">
    <div class="c-title">
      {{ schema.title }}
    </div>
    <div
      :style="{
        marginLeft: displayType === 'row' ? 0 : '12px',
      }"
    >
      <slot />
    </div>
  </div>
  <!-- 新增卡片视图-->
  <div v-else-if="theme + '' === '2'" class="fr-theme-card-wrap">
    <div>
      <div :id="schema.title" class="fr-theme-card-title">{{ schema.title }}</div>
      <div
        :style="{
          marginLeft: displayType === 'row' ? 0 : '12px',
        }"
      >
        <slot />
      </div>
    </div>
  </div>
  <div v-else class="w-100">
    <collapse :active-key="activeKey" @change="handleToggle">
      <Panel :key="1" class="fr-collapse-object">
        <template #header>
          <span style="font-weight: 500; font-size: 16px">{{ schema.title }}</span>
        </template>
        <slot />
      </Panel>
    </collapse>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import { Collapse } from 'ant-design-vue';
import { componentProps } from '../../FRType';
import { usePropsStore } from '../../hooks';
const { Panel } = Collapse;

type Key = string | number;

export default defineComponent({
  components: {
    Collapse,
    Panel,
  },
  inheritAttrs: false,
  props: componentProps(),
  setup(props) {
    const propsStore = usePropsStore();
    const collapsed = ref(false);

    const activeKey = ref<number[]>([1]);

    watch(props.schema.collapsed, collapsed => {
      collapsed.value = !!collapsed;
    });

    const handleToggle = function (keyList: Key | Key[]) {
      if (Array.isArray(keyList) && keyList.length > 0) {
        collapsed.value = false;
        activeKey.value = [1];
      } else {
        collapsed.value = true;
        activeKey.value = [];
      }
    };

    watch(
      () => propsStore.value.allCollapsed,
      newVal => {
        if (newVal !== undefined) collapsed.value = newVal;
      }
    );

    return {
      activeKey,
      handleToggle,
      theme: computed(() => propsStore.value.theme),
      displayType: computed(() => propsStore.value.displayType),
    };
  },
});
</script>

<style>
.c-title {
  margin-bottom: 16px;
  padding-bottom: 4px;
  font-weight: 500;
  font-size: 17px;
  border-bottom: 1px solid rgb(0 0 0 / 20%);
}
</style>
