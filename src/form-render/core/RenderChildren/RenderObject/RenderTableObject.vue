<template>
  <table class="table-layout" :class="customClass" :border="border">
    <tbody>
      <tr v-for="(cols, rowIdx) in rows || []" :key="rowIdx">
        <template v-for="(col, colIdx) in cols">
          <td
            v-if="!col.merged"
            :key="colIdx"
            class="table-cell"
            :colspan="col.colspan || 1"
            :rowspan="col.rowspan || 1"
          >
            <Core
              v-for="(item, idx) in col.widgets || []"
              :id="parentId === '#' ? item : `${parentId}.${item}`"
              :key="idx"
              :data-index="dataIndex"
              :display-type="displayType"
              :hide-title="hideTitle"
            />
          </td>
        </template>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import Core from '../../Core.vue';

interface Row {
  merged: boolean;
  colspan?: number;
  rowspan?: number;
  widgets: string[];
}

defineProps<{
  parentId: string;
  children: any[];
  dataIndex: number[];
  displayType: 'column' | 'row' | 'inline';
  hideTitle?: boolean;
  customClass?: string;
  border?: number;
  rows?: Array<Row[]>;
}>();
</script>
