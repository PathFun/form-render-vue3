<template>
  <ColorPicker ref="colorPickerRef" :value="color" :disable-alpha="false" :mode="mode" @change="handleChange" />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import ColorPicker from './ColorPicker.vue';
export default defineComponent({
  components: { ColorPicker },
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: '#FF0000',
    },
    mode: {
      type: String,
      default: 'hex',
    },
  },
  emits: ['update:value', 'change'],
  setup(props, { emit }) {
    const color = ref('#FF0000');
    const colorPickerRef = ref();

    onMounted(function () {
      color.value = colorPickerRef.value.colorChange(props.value);
    });

    const handleChange = (colors: any) => {
      const { mode } = props;
      emit('update:value', colors[mode] || colors.hex);
      emit('change', colors[mode] || colors.hex);
    };

    return {
      handleChange,
      colorPickerRef,
      color,
    };
  },
});
</script>

<style scoped></style>
