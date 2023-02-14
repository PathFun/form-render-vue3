<script lang="tsx">
import { defineComponent } from 'vue';
import { renderListProps } from '../../../FRType';
import Card from './Card.vue';
import Tab from './Tab.vue';
import { usePropsStore } from '../../../hooks';
import { getWidgetName } from '../../../mapping';
export default defineComponent({
  props: renderListProps(),
  setup(props) {
    const propStore = usePropsStore();
    return () => {
      const { schema } = props;
      const customName = schema.widget;
      const { widgets = {}, mapping = {} } = propStore.value;
      let Widget;
      let widgetProps: Record<string, any> = {
        schema: schema,
        componentProps: schema.props,
      };
      switch (customName) {
        case 'card':
          return <Card {...props} />;
        case 'tab':
          return <Tab {...props} />;
        default:
          if (customName && widgets[customName]) {
            Widget = widgets[customName];
          } else {
            Widget = widgets[getWidgetName(schema, mapping)];
          }
          return Widget ? <Widget {...widgetProps} /> : '未找到layout组件';
      }
    };
  },
});
</script>
