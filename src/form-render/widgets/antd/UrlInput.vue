<script lang="tsx">
import { defineComponent } from 'vue';
import { isUrl } from '../utils';
import { Input } from 'ant-design-vue';
import { componentProps } from '../../FRType';
const UrlNode = defineComponent({
  inheritAttrs: false,
  props: {
    value: {
      type: String,
    },
    addonText: {
      type: String,
    },
  },
  setup(props) {
    return () => {
      const { value = '', addonText = '测试链接' } = props;
      return isUrl(value) ? (
        <a target="_blank" href={value}>
          {addonText}
        </a>
      ) : (
        <div>{addonText}</div>
      );
    };
  },
});

export default defineComponent({
  props: componentProps(),
  emits: ['change'],
  setup(props, { emit }) {
    const handleChange = (event: Event) => {
      const { componentProps = {} } = props;
      const { prefix, suffix } = componentProps;
      let _value = (event.target as HTMLInputElement).value;
      if (!_value) {
        emit('change', _value);
        return;
      }
      if (prefix) {
        _value = prefix + _value;
      }
      if (suffix) {
        _value = _value + suffix;
      }
      emit('change', _value);
    };

    return () => {
      const { componentProps = {}, value, onChange, ...rest } = props;
      const { prefix, suffix, addonText } = componentProps;
      let _value = value || '';
      if (prefix) _value = _value.replace(prefix, '');
      if (suffix) _value = _value.replace(suffix, '');

      return (
        <Input
          value={_value}
          prefix={prefix}
          suffix={suffix}
          v-slots={{
            addonAfter: () => <UrlNode value={value} addonText={addonText} />,
          }}
          {...rest}
          onChange={handleChange}
        />
      );
    };
  },
});
</script>
