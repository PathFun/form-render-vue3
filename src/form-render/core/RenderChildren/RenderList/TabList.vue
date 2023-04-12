<script lang="tsx">
import { defineComponent, ref } from 'vue';
import { Tabs, Popconfirm } from 'ant-design-vue';
import Core from '../../Core.vue';
import { CloseOutlined, CopyOutlined } from '@ant-design/icons-vue';
import { listProps } from '../../../FRType';
import { usePropsStore } from '../../../hooks';
const { TabPane } = Tabs;

const TabList = defineComponent({
  name: 'TabList',
  inheritAttrs: false,
  props: listProps(),
  setup(compProps) {
    const activeKey = ref<string | number>(0);
    const propsStore = usePropsStore();
    const setActiveKey = (targetKey: string | number) => {
      activeKey.value = targetKey;
    };
    const onEdit = (targetKey: string | number | KeyboardEvent | MouseEvent, action: 'add' | 'remove') => {
      if (action === 'add') {
        const currentKey = compProps.addItem();
        setActiveKey(currentKey);
      }
    };

    const getCurrentTabPaneName = (idx: number) => {
      const { props = {} } = compProps.schema;
      const { tabName } = props;
      return tabName instanceof Array ? tabName[idx] || idx + 1 : `${tabName || compProps.schema.title} ${idx + 1}`;
    };

    let delConfirmProps = {
      title: '确定删除?',
      okText: '确定',
      cancelText: '取消',
    };

    return () => {
      const { schema, displayList, getFieldsProps, displayType, deleteItem, copyItem } = compProps;
      const { props = {}, min = 0, max = 999 } = schema;
      const { tabName, type, draggable = false, hideDelete = false, ...restProps } = props;
      const { methods = {} } = propsStore.value;
      if (props.delConfirmProps && typeof props.delConfirmProps === 'object') {
        delConfirmProps = { ...delConfirmProps, ...props.delConfirmProps };
      }
      return (
        <Tabs
          type={type || 'editable-card'}
          onChange={setActiveKey}
          activeKey={activeKey.value}
          onEdit={onEdit}
          hideAdd={displayList.length >= (schema.max as number)}
          {...restProps}
        >
          {displayList.map((item, idx) => {
            const fieldsProps = getFieldsProps(idx);
            fieldsProps.displayType = displayType;
            return (
              <TabPane
                key={idx}
                closable={false}
                v-slots={{
                  tab: () => (
                    <span>
                      {getCurrentTabPaneName(idx)}
                      {!hideDelete && displayList.length > (min as number) && (
                        <Popconfirm
                          placement="left"
                          onConfirm={() => {
                            if (props.onConfirm && typeof props.onConfirm === 'string') {
                              const cb = methods[props.onConfirm];
                              if (typeof cb === 'function') {
                                const result = cb(item, idx);
                                if (!result) {
                                  return;
                                }
                              }
                            }
                            deleteItem(idx);
                            activeKey.value = idx - 1 > -1 ? idx - 1 : 0;
                          }}
                          {...delConfirmProps}
                        >
                          <CloseOutlined
                            style={{ fontSize: '13px', marginLeft: '8px', marginRight: '0px', color: '#00000073' }}
                          />
                        </Popconfirm>
                      )}
                      {!props.hideAdd && !props.hideCopy && displayList.length < (max as number) && (
                        <CopyOutlined
                          style={{ fontSize: '13px', marginLeft: '8px', marginRight: '0px', color: '#00000073' }}
                          onClick={() => copyItem(idx)}
                        />
                      )}
                    </span>
                  ),
                }}
              >
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
