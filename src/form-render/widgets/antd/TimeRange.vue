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
    const handleChange = (value: any, stringList: any) => {
      if (!props.onChange) {
        return;
      }
      const emptyList1 = stringList[0] === '' || stringList[1] === '';
      const emptyList2 = stringList[0] === undefined || stringList[1] === undefined;
      if (emptyList1 || emptyList2) {
        props.onChange(undefined);
      } else {
        props.onChange(stringList);
      }
    };
    return () => {
      const { onChange, schema, value, componentProps = {}, ...rest } = props;
      const { format = 'date' } = schema;
      const timeFormat = getFormat(format);
      let [start, end] = Array.isArray(value) ? value : [];
      const _value: RangeValue<Dayjs> | RangeValue<string> =
        start && end ? [dayjs(start, timeFormat), dayjs(end, timeFormat)] : null;

      const timeParams: Record<string, any> = {
        ...componentProps,
        ...rest,
        value: _value,
        onChange: handleChange,
      };

      timeParams.style = timeParams.style ? { width: '100%', ...timeParams.style } : { width: '100%' };

      return <TimeRangePicker {...timeParams} />;
    };
  },
});
</script>
