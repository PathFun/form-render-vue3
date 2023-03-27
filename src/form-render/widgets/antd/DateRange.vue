<script lang="tsx">
import { defineComponent, ref, watch } from 'vue';
import { RangePicker } from 'ant-design-vue';
import { getFormat } from '../utils';
import { componentProps } from '../../FRType';

export default defineComponent({
  name: 'DateRange',
  inheritAttrs: false,
  props: componentProps(),
  setup(props) {
    const _modelValue = ref();

    watch(
      () => props.value,
      (_value: any) => {
        if (Array.isArray(_value) && _value[0] !== _modelValue.value[0] && _value[1] !== _modelValue.value[1]) {
          _modelValue.value = _value;
        }
      },
      {
        immediate: true,
      }
    );

    return () => {
      const { value, componentProps = {}, globalProps = {}, schema, ...rest } = props;
      const { format = 'date' } = schema;
      const dateFormat = getFormat(format);

      let dateParams: { [key: string]: any } = {
        ...globalProps,
        ...componentProps,
        ...rest,
      };

      dateParams.style = dateParams.style ? { width: '100%', ...dateParams.style } : { width: '100%' };

      if (format === 'dateTime') {
        dateParams.showTime = true;
      }

      if (['date', 'week', 'month', 'quarter', 'year'].indexOf(format) > -1) {
        dateParams.picker = format;
      }

      if (dateFormat === format) {
        dateParams.format = format;
      }

      dateParams.valueFormat = componentProps.valueFormat || dateFormat;

      return <RangePicker {...dateParams} v-model={_modelValue.value} />;
    };
  },
});
</script>
