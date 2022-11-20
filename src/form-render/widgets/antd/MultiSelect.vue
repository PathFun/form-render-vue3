<script lang="tsx">
import { computed, defineComponent } from 'vue';
import { Select, SelectOption } from 'ant-design-vue';
import { getArray } from '../utils';
import { isUndefined } from 'lodash-es';
import { componentProps } from '../../FRType';

export default defineComponent({
  name: 'MultiSelect',
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
      const { value, onChange, componentProps = {}, globalProps = {}, ...rest } = props;
      const _value = Array.isArray(value) ? value : undefined;
      const finalProps: Record<string, any> = {
        ...globalProps,
        ...componentProps,
        ...rest,
        value: _value,
        onChange: handleChange,
      };
      finalProps.style = finalProps.style ? { width: '100%', ...finalProps.style } : { width: '100%' };

      if (finalProps.options) delete finalProps.options;

      return (
        <Select {...finalProps} mode="multiple">
          {options.value.map(d => (
            <SelectOption value={d.value} disabled={d.disabled}>
              {d.label === 'string' && d.label[0] === '<' ? <span innerHTML={d.label}></span> : d.label}
            </SelectOption>
          ))}
        </Select>
      );
    };
  },
});
</script>
