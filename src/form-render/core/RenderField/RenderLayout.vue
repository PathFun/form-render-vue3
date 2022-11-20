<script lang="tsx">
import { defineComponent } from 'vue';
import { renderListProps } from '../../FRType';
import { usePropsStore } from '../../hooks';
import { getWidgetName } from '../../mapping';
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
      return Widget ? <Widget {...props} /> : <div>未找到layout组件</div>;
    };
  },
});
</script>
