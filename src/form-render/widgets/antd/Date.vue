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
    const dateValue = ref(props.value);

    const handleChange = (value: any) => {
      props.onChange?.(value);
    };

    watch(
      () => props.value,
      (_value: any) => {
        if (_value !== dateValue.value) {
          dateValue.value = _value;
        }
      }
    );

    return () => {
      const { componentProps = {}, globalProps = {}, schema, value, onChange, ...rest } = props;
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

      return <DatePicker {...dateParams} v-model={dateValue} onChange={handleChange} />;
    };
  },
});
</script>
