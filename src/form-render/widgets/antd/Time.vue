<script lang="tsx">
import { defineComponent } from 'vue';
import dayjs from 'dayjs';
import { TimePicker } from 'ant-design-vue';
import { getFormat } from '../utils';
import { componentProps } from '../../FRType';
export default defineComponent({
  name: 'Time',
  inheritAttrs: false,
  props: componentProps(),
  setup(props) {
    const handleChange = (value: any, string: any) => {
      props.onChange && props.onChange(string);
    };

    return () => {
      const { onChange, schema, value, componentProps = {}, ...rest } = props;
      const { format = 'time' } = schema;
      const timeFormat = getFormat(format);
      const _value = value ? dayjs(value, timeFormat) : undefined;

      const timeParams: Record<string, any> = {
        ...componentProps,
        ...rest,
        value: _value,
        onChange: handleChange,
        format: timeFormat,
      };
      timeParams.style = timeParams.style ? { width: '100%', ...timeParams.style } : { width: '100%' };

      return <TimePicker {...timeParams} />;
    };
  },
});
</script>
