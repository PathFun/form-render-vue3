<script lang="tsx">
import { defineComponent } from 'vue';
import { InputNumber, Slider } from 'ant-design-vue';
import { componentProps } from '../../FRType';
export default defineComponent({
  name: 'PecentSlider',
  inheritAttrs: false,
  props: componentProps(),
  setup(props) {
    const handleChange = (newNumber: [number, number] | number) => {
      if (!props.onChange || Array.isArray(newNumber)) return;
      const a = newNumber + '%';
      props.onChange(a);
    };

    return () => {
      const { schema, componentProps = {} } = props;
      const { max, min, step } = schema;
      let setting: Record<string, any> = {};
      if (max || max === 0) {
        setting = { max };
      }

      if (min || min === 0) {
        setting = { ...setting, min };
      }

      if (step) {
        setting = { ...setting, step };
      }

      let hideNumber = false;
      if (componentProps.options && componentProps.options.hideNumber) {
        hideNumber = true;
      }

      const isPercent = (string: any) => typeof string === 'string' && string.endsWith('%');

      let numberValue = 100;
      if (isPercent(props.value)) {
        try {
          numberValue = Number(props.value.split('%')[0]);
          if (Number.isNaN(numberValue)) numberValue = 100;
        } catch (error) {
          console.error(error);
        }
      }

      const renderNumber = props.readOnly ? (
        <span style="width: 80px">{props.value === '' ? '-' : props.value + '%'}</span>
      ) : (
        <InputNumber
          {...setting}
          style="width: 80px"
          value={numberValue}
          disabled={props.disabled}
          onchange={handleChange}
          formatter={value => `${value}%`}
          parser={value => value.replace('%', '')}
        />
      );

      return (
        <div class="fr-slider">
          <Slider
            range={false}
            style={{ flexGrow: 1, marginRight: hideNumber ? 0 : '12px' }}
            {...setting}
            onChange={handleChange}
            max={100}
            tipFormatter={v => v + '%'}
            value={numberValue || 100}
            disabled={props.disabled || props.readOnly}
          />
          {hideNumber ? null : renderNumber}
        </div>
      );
    };
  },
});
</script>
