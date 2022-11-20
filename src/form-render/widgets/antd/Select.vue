<script lang="tsx">
import { computed, defineComponent } from 'vue';
import { Select } from 'ant-design-vue';
import { getArray } from '../utils';
import { isUndefined } from 'lodash-es';
import { componentProps } from '../../FRType';
export default defineComponent({
  name: 'Select',
  inheritAttrs: false,
  props: componentProps(),
  setup(props) {
    const handleChange = (val: any) => {
      let _val = !isUndefined(val) ? val : null;
      props.onChange && props.onChange(_val);
    };

    const options = computed(() => {
      const { schema, componentProps = {} } = props;
      if (componentProps.options && Array.isArray(componentProps.options)) {
        return componentProps.options;
      } else {
        const { enum: enums, enumNames } = schema || {};
        return getArray(enums).map((item, idx) => {
          let label = enumNames && Array.isArray(enumNames) ? enumNames[idx] : item;
          return { label, value: item };
        });
      }
    });

    return () => {
      const { value, onChange, componentProps = {}, ...rest } = props;
      const finalProps: Record<string, any> = {
        ...componentProps,
        ...rest,
        value,
        options: options.value,
        onChange: handleChange,
      };

      if (finalProps.options) delete finalProps.options;

      finalProps.style = finalProps.style ? { width: '100%', ...finalProps.style } : { width: '100%' };
      return (
        <Select {...finalProps}>
          {options.value.map(item => (
            <Select.Option value={item.value} disabled={item.disabled}>
              {typeof item.label === 'string' && item.label[0] === '<' ? (
                <span innerHTML={item.label}></span>
              ) : (
                item.label
              )}
            </Select.Option>
          ))}
        </Select>
      );
    };
  },
});
</script>
