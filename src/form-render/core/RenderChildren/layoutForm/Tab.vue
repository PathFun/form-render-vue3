<script lang="tsx">
import { defineComponent } from 'vue';
import { renderListProps } from '../../../FRType';
import { Tabs, TabPane } from 'ant-design-vue';
import Core from '../../Core.vue';
export default defineComponent({
  props: renderListProps(),
  setup(props) {
    return () => {
      const attrs = props.schema.props || {};
      attrs.title = attrs.title ? attrs.title : props.schema.title;
      const childrenMap: Record<string, string> = {};
      props.children.forEach(child => {
        const childDeepKeyList = child.split('.');
        let lastKey = childDeepKeyList[childDeepKeyList.length - 1];
        if (lastKey.endsWith('[]')) {
          lastKey = lastKey.slice(0, -2);
        }
        childrenMap[lastKey] = child;
      });
      const items = props.schema.rows || [];
      return (
        <Tabs {...attrs}>
          {{
            leftExtra: () =>
              typeof attrs.title === 'string' && attrs.title.startsWith('<') ? (
                <span innerHTML={attrs.title} />
              ) : (
                attrs.title
              ),
            default: () =>
              items.map((item, index: number) => {
                if (Array.isArray(item)) return;
                const { widgets = [], ...paneRest } = item;
                return (
                  <TabPane {...paneRest} key={index}>
                    {widgets.map((widgetName: string, idx: number) => (
                      <Core
                        id={childrenMap[widgetName]}
                        key={`${index}-${idx}`}
                        data-index={props.dataIndex}
                        displayType={props.displayType}
                        labelAlign={props.labelAlign}
                        hideTitle={props.hideTitle}
                      />
                    ))}
                  </TabPane>
                );
              }),
          }}
        </Tabs>
      );
    };
  },
});
</script>
