<script lang="tsx">
import { defineComponent, ref, watch } from 'vue';
import { DatePicker } from 'ant-design-vue';
import { getFormat } from '../utils';
import { componentProps } from '../../FRType';
export default defineComponent({
  name: 'Date',
  inheritAttrs: false,
  props: componentProps(),
  setup(props) {
    const _modelValue = ref();

    watch(
      () => props.value,
      (_value: any) => {
        if (_value !== _modelValue.value) {
          _modelValue.value = _value;
        }
      },
      {
        immediate: true,
      }
    );

    return () => {
      const { componentProps = {}, globalProps = {}, schema, value, ...rest } = props;
      const { format = 'date' } = schema;
      const dateFormat = getFormat(format);

      const dateParams: Record<string, any> = {
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

      return <DatePicker {...dateParams} v-model={_modelValue.value} />;
    };
  },
});
</script>
