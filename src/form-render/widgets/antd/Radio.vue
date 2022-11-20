<script lang="tsx">
import { computed, defineComponent } from 'vue';
import { Radio } from 'ant-design-vue';
import { getArray } from '../utils';
import { componentProps } from '../../FRType';
export default defineComponent({
  name: 'Radio',
  inheritAttrs: false,
  props: componentProps(),
  setup(props) {
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
      const { schema, componentProps = {}, globalProps = {}, ...rest } = props;
      const finalProps: Record<string, any> = {
        ...globalProps,
        ...componentProps,
        ...rest,
      };
      if (finalProps.options) delete finalProps.options;
      return (
        <Radio.Group {...finalProps}>
          {options.value.map(item => (
            <Radio value={item.value} disabled={item.disabled}>
              {typeof item.label === 'string' && item.label[0] === '<' ? (
                <span innerHTML={item.label}></span>
              ) : (
                item.label
              )}
            </Radio>
          ))}
        </Radio.Group>
      );
    };
  },
});
</script>
