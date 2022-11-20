<script lang="tsx">
import { defineComponent } from 'vue';
import { componentProps } from '../../FRType';
export default defineComponent({
  name: 'Html',
  inheritAttrs: false,
  props: componentProps(),
  setup(props) {
    return () => {
      const { schema, value } = props;
      let __html = '-';
      if (schema.type === 'boolean') {
        __html = value === true ? '✔' : '✘';
      } else if (Array.isArray(schema.enum) && Array.isArray(schema.enumNames)) {
        if (['string', 'number'].indexOf(typeof value) > -1) {
          const idx = schema.enum.indexOf(value);
          __html = (schema.enumNames[idx] as string) || '-';
        } else if (Array.isArray(value)) {
          let idxStr = '-';
          for (let i = 0; i < value.length; i++) {
            const idx = schema.enum.indexOf(value[i]);
            const name = schema.enumNames[idx];
            if (name) {
              idxStr += ',' + name;
            }
          }
          __html = idxStr.replace('-,', '');
        }
      } else if (typeof value === 'number') {
        __html = String(value);
      } else if (typeof value === 'string') {
        __html = value;
      } else if (schema.type === 'range' && Array.isArray(value) && value[0] && value[1]) {
        __html = `${value[0]} - ${value[1]}`;
      } else if (value && ['number', 'string'].indexOf(typeof value) === -1) {
        __html = JSON.stringify(value);
      }

      return <div innerHTML={__html}></div>;
    };
  },
});
</script>
