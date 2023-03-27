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
    return () => {
      const { schema, value, componentProps = {}, ...rest } = props;
      const { format = 'time' } = schema;
      const timeFormat = getFormat(format);

      const timeParams: Record<string, any> = {
        ...componentProps,
        ...rest,
        format: componentProps.format || timeFormat,
        valueFormat: componentProps.valueFormat || timeFormat,
      };

      timeParams.style = timeParams.style ? { width: '100%', ...timeParams.style } : { width: '100%' };

      return <TimePicker {...timeParams} />;
    };
  },
});
</script>
