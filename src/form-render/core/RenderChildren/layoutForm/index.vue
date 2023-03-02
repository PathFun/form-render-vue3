<script lang="tsx">
import { defineComponent } from 'vue';
import { renderListProps, DisplayType, LabelAlign } from '../../../FRType';
import Card from './Card.vue';
import Tab from './Tab.vue';
import { usePropsStore } from '../../../hooks';
import { getWidgetName } from '../../../mapping';
import Core from '../../Core.vue';
import { transformProps } from '../../../_util';
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
        ...props,
        schema: schema,
        componentProps: schema.props,
      };
      const finalProps = transformProps(widgetProps);
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
          return Widget ? (
            <Widget
              {...finalProps}
              v-slots={{
                subForm: (slotProps: {
                  id: string;
                  dataIndex?: any[];
                  displayType?: DisplayType;
                  labelAlign?: LabelAlign;
                  hideTitle?: boolean;
                }) => (
                  <Core
                    id={slotProps.id}
                    dataIndex={slotProps.dataIndex || props.dataIndex}
                    displayType={slotProps.displayType || props.displayType}
                    labelAlign={slotProps.labelAlign || props.labelAlign}
                    hideTitle={slotProps.hideTitle || props.hideTitle}
                  />
                ),
              }}
            />
          ) : (
            '未找到layout组件'
          );
      }
    };
  },
});
</script>
