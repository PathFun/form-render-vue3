<template>
  <ColorPicker
    ref="colorPickerRef"
    :value="color"
    :disable-alpha="false"
    :mode="mode"
    :disable-fields="disableFields"
    @change="handleChange"
  />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, PropType } from 'vue';
import ColorPicker from './ColorPicker.vue';
export default defineComponent({
  components: { ColorPicker },
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: '#FF0000',
    },
    format: {
      type: String as PropType<'rgb' | 'prgb' | 'hex' | 'hex6' | 'hex3' | 'hex4' | 'hex8' | 'name' | 'hsl' | 'hsv'>,
      default: '',
    },
    mode: {
      type: String as PropType<'hex' | 'rgba' | 'hsla'>,
      default: 'hex',
    },
    disableAlpha: {
      type: Boolean,
      default: false,
    },
    disableFields: {
      type: Boolean,
      default: false,
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
      const { format } = props;
      const _value = format ? colors.toString(format) : colors.hex;
      emit('update:value', _value);
      emit('change', _value);
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
