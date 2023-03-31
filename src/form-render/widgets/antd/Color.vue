<script lang="tsx">
import { defineComponent } from 'vue';
import ColorPicker from './color/index.vue';
import { Input, Popover } from 'ant-design-vue';
import { componentProps } from '../../FRType';

export default defineComponent({
  name: 'Color',
  inheritAttrs: false,
  props: componentProps(),
  emits: ['change'],
  setup(props, { emit }) {
    const onPickerChange = (value: any) => {
      const { disabled, readOnly } = props;
      if (disabled || readOnly) return;
      emit('change', value);
    };
    const onInputChange = (e: any) => {
      emit('change', e.target.value);
    };

    return () => {
      const { readOnly, disabled, value = '#FFFFFF', globalProps = {}, componentProps = {}, schema } = props;
      let { format = '' } = schema;
      return (
        <div class="fr-color-picker">
          <Popover
            trigger="click"
            v-slots={{
              default: () => <div class="rc-color-picker-trigger" style={{ backgroundColor: value }}></div>,
              content: () => (
                <ColorPicker
                  format={format === 'color' ? 'hex8' : (format as any)}
                  {...globalProps}
                  {...componentProps}
                  value={value}
                  onChange={onPickerChange}
                />
              ),
            }}
          />
          {readOnly ? (
            <span>{value}</span>
          ) : (
            <Input placeholder="{value}" disabled={disabled} value={value} onChange={onInputChange} />
          )}
        </div>
      );
    };
  },
});
</script>
