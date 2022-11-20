<script lang="tsx">
import { defineComponent, ref } from 'vue';
import { Tabs } from 'ant-design-vue';
import Core from '../../Core.vue';
import { listProps } from '../../../FRType';
const { TabPane } = Tabs;

const TabList = defineComponent({
  name: 'TabList',
  inheritAttrs: false,
  props: listProps(),
  setup(compProps) {
    const activeKey = ref<any>('0');
    const setActiveKey = (targetKey: string | number) => {
      activeKey.value = `${targetKey}`;
    };
    const onEdit = (targetKey: string | number | KeyboardEvent | MouseEvent, action: 'add' | 'remove') => {
      if (action === 'add') {
        const currentKey = compProps.addItem();
        setActiveKey(currentKey);
      } else if (action === 'remove') {
        const keyNum = Number(targetKey);
        compProps.deleteItem(keyNum);
        setActiveKey(keyNum > 1 ? keyNum - 1 : 0);
      } else {
        return null;
      }
    };

    const getCurrentTabPaneName = (idx: number) => {
      const { props = {} } = compProps.schema;
      const { tabName } = props;
      return tabName instanceof Array ? tabName[idx] || idx + 1 : `${tabName || '项目'} ${idx + 1}`;
    };
    return () => {
      const { schema, displayList, getFieldsProps, displayType } = compProps;
      const { props = {} } = schema;
      const { tabName, type, draggable = false, ...restProps } = props;
      return (
        <Tabs type={type || 'line'} onChange={setActiveKey} activeKey={activeKey} onEdit={onEdit} {...restProps}>
          {displayList.map((item, idx) => {
            const fieldsProps = getFieldsProps(idx);
            fieldsProps.displayType = displayType;
            return (
              <TabPane tab={getCurrentTabPaneName(idx)} key={`${idx}`}>
                <Core {...fieldsProps} />
              </TabPane>
            );
          })}
        </Tabs>
      );
    };
  },
});

export default TabList;
</script>
