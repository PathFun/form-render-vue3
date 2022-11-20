<script lang="tsx">
import { defineComponent } from 'vue';
import { CheckboxGroup } from 'ant-design-vue';
import { getArray } from '../utils';
import { componentProps } from '../../FRType';
export default defineComponent({
  name: 'Checkboxes',
  inheritAttrs: false,
  props: componentProps(),
  setup(props) {
    return () => {
      const { schema, globalProps = {}, componentProps = {}, value, ...rest } = props;
      let options;
      // 如果已经有外部注入的options了，内部的schema就会被忽略
      if (componentProps.options && Array.isArray(componentProps.options)) {
        options = componentProps.options.map(d => ({
          _label: d.label,
          disabled: d.disabled,
          value: d.value,
        }));
      } else {
        const { enum: enums, enumNames } = schema || {};
        options = getArray(enums).map((item, idx) => {
          let label = enumNames && Array.isArray(enumNames) ? enumNames[idx] : item;
          return { _label: label, value: item };
        });
      }

      const checkboxesProps: Record<string, any> = {
        ...globalProps,
        ...componentProps,
        options,
        value: typeof value === 'number' ? value : undefined,
        mode: 'multiple',
        ...rest,
      };
      const slots = {
        label: (node: { _label: string; value: any }) =>
          typeof node._label === 'string' && node._label[0] === '<' ? (
            <span innerHTML={node._label}></span>
          ) : (
            node._label
          ),
      };
      return <CheckboxGroup {...checkboxesProps} v-slots={slots} />;
    };
  },
});
</script>

<style scoped></style>
