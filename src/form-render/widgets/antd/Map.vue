<template>
  <div v-if="!schema.title" class="w-100">
    <slot />
  </div>
  <div v-else-if="theme === 'tile'" className="w-100">
    <div class="tile">
      {{ schema.title }}
      <span className="fr-desc ml2">
        {{ schema?.description ? `( ${schema.description} )` : '' }}
      </span>
    </div>
    <div :style="{ marginLeft: displayType === 'row' ? 0 : '12px' }">
      <slot />
    </div>
  </div>
  <Card v-else-if="theme === 'card'" :id="schema.title" class="fr-theme-card-wrap">
    <template #title>
      {{ schema.title }}
      <span class="fr-desc ml2">
        {{ schema?.description ? `( ${schema.description} )` : '' }}
      </span>
    </template>
    <slot />
  </Card>
  <template v-else-if="theme === 'flex'">
    <div v-bind="schema.props">
      <slot />
    </div>
  </template>
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
import { Collapse, Card } from 'ant-design-vue';
import { componentProps } from '../../FRType';
import { usePropsStore } from '../../hooks';
const { Panel } = Collapse;

type Key = string | number;

export default defineComponent({
  components: {
    Collapse,
    Panel,
    Card,
  },
  inheritAttrs: false,
  props: componentProps(),
  setup(props) {
    const propsStore = usePropsStore();

    const activeKey = ref<number[]>(props.schema.collapsed ? [1] : []);

    const handleToggle = function (keyList: Key | Key[]) {
      if (Array.isArray(keyList) && keyList.length > 0) {
        activeKey.value = [1];
      } else {
        activeKey.value = [];
      }
    };

    watch(
      () => propsStore.value.allCollapsed,
      newVal => {
        if (newVal !== undefined) activeKey.value = [1];
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
.tile {
  font-size: 17px;
  font-weight: 500;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  margin-bottom: 16px;
}
</style>
