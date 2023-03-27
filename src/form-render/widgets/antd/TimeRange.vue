<script lang="tsx">
import { defineComponent } from 'vue';
import { TimePicker } from 'ant-design-vue';
const { TimeRangePicker } = TimePicker;
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
declare type EventValue<DateType> = DateType | null;
declare type RangeValue<DateType> = [EventValue<DateType>, EventValue<DateType>] | null;
import { getFormat } from '../utils';
import { componentProps } from '../../FRType';
export default defineComponent({
  name: 'TimeRange',
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

      return <TimeRangePicker {...timeParams} />;
    };
  },
});
</script>
