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
      const { panes = [], ...rest } = attrs;
      rest.title = rest.title ? rest.title : props.schema.title;
      const childrenMap: Record<string, string> = {};
      props.children.forEach(child => {
        const childDeepKeyList = child.split('.');
        let lastKey = childDeepKeyList[childDeepKeyList.length - 1];
        if (lastKey.endsWith('[]')) {
          lastKey = lastKey.slice(0, -2);
        }
        childrenMap[lastKey] = child;
      });
      return (
        <Tabs {...rest}>
          {{
            leftExtra: () =>
              typeof rest.title === 'string' && rest.title.startsWith('<') ? (
                <span innerHTML={rest.title} />
              ) : (
                rest.title
              ),
            default: () =>
              panes.map((item: Record<string, any>, index: number) => {
                const { widgets = [], ...paneRest } = item;
                return (
                  <TabPane {...paneRest}>
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
          {/* {panes.map((item: Record<string, any>, index: number) => {
            const { widgets = [], ...paneRest } = item;
            return (
              <TabPane {...paneRest}>
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
          })} */}
        </Tabs>
      );
    };
  },
});
</script>
