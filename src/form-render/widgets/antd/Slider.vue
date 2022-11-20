<script lang="tsx">
import { defineComponent } from 'vue';
import { InputNumber, Slider } from 'ant-design-vue';
import { componentProps } from '../../FRType';
export default defineComponent({
  name: 'Slider',
  inheritAttrs: false,
  props: componentProps(),
  setup(props) {
    return () => {
      const { schema, componentProps = {}, onChange, value, ...rest } = props;
      const { max, min, step } = schema;
      let setting = {};
      if (max || max === 0) {
        setting = { max };
      }

      if (min || min === 0) {
        setting = { ...setting, min };
      }

      if (step) {
        setting = { ...setting, step };
      }

      return (
        <div class="fr-slider">
          <div style={{ flexGrow: 1, marginRight: componentProps.hideInput ? 0 : '12px' }}>
            <Slider
              {...componentProps}
              {...rest}
              {...setting}
              onChange={onChange}
              value={typeof value === 'number' ? value : Number(min) || 0}
            />
          </div>
          {componentProps.hideInput ? null : (
            <InputNumber {...setting} style={{ width: '90px' }} value={value} onChange={onChange} />
          )}
        </div>
      );
    };
  },
});
</script>
