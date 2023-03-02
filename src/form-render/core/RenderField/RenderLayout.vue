<script lang="tsx">
import { defineComponent } from 'vue';
import { renderListProps } from '../../FRType';
import { usePropsStore } from '../../hooks';
import { getWidgetName } from '../../mapping';
import { transformProps } from '../../_util';
export default defineComponent({
  props: renderListProps(),
  setup(props) {
    const propStore = usePropsStore();
    return () => {
      const { schema } = props;
      const { widgets = {}, mapping = {} } = propStore.value;
      let Widget;
      const customName = schema.widget;
      if (customName && widgets[customName]) {
        Widget = widgets[customName];
      } else {
        Widget = widgets[getWidgetName(schema, mapping)];
      }
      const finalProps = transformProps(props);
      return Widget ? <Widget {...finalProps} /> : <div>未找到layout组件</div>;
    };
  },
});
</script>
