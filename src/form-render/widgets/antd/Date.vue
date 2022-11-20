<script lang="tsx">
import { defineComponent, computed } from 'vue';
import dayjs, { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
dayjs.extend(weekday);
dayjs.extend(localeData);
import { DatePicker } from 'ant-design-vue';
import { getFormat } from '../utils';
import { componentProps } from '../../FRType';

export default defineComponent({
  name: 'Date',
  inheritAttrs: false,
  props: componentProps(),
  setup(props) {
    const handleChange = (value: any, string: any) => {
      props.onChange && props.onChange(string);
    };

    const valueObj = computed<Dayjs>(() => {
      const { value, schema } = props;
      const { format = 'date' } = schema;
      let _value: any = value;
      if (typeof _value === 'string') {
        if (format === 'week') {
          _value = _value ? _value.substring(0, _value.length - 1) : _value;
        }
        if (format === 'quarter') {
          _value = _value.replace('Q', '');
        }
      }
      if (_value) {
        _value = dayjs(_value, getFormat(format));
      }
      return _value;
    });

    return () => {
      const { componentProps = {}, globalProps = {}, schema, ...rest } = props;
      const { format = 'date' } = schema;
      const dateFormat = getFormat(format);

      const dateParams: Record<string, any> = {
        ...globalProps,
        ...componentProps,
        ...rest,
        value: valueObj.value,
        onChange: handleChange,
      };

      dateParams.style = dateParams.style ? { width: '100%', ...dateParams.style } : { width: '100%' };

      // TODO: format 是在 options 里自定义的情况，是否要判断一下要不要 showTime
      if (format === 'dateTime') {
        dateParams.showTime = true;
      }

      if (['week', 'month', 'quarter', 'year'].indexOf(format) > -1) {
        dateParams.picker = format;
      }

      if (dateFormat === format) {
        dateParams.format = format;
      }

      return <DatePicker {...dateParams} />;
    };
  },
});
</script>
