<script lang="tsx">
import { defineComponent, ref } from 'vue';
import { Button, Popconfirm, Collapse } from 'ant-design-vue';
import { CloseOutlined, CopyOutlined, CaretRightOutlined } from '@ant-design/icons-vue';
import Core from '../../Core.vue';
import { listProps } from '../../../FRType';
import { usePropsStore } from '../../../hooks';
const { Panel } = Collapse;
export default defineComponent({
  name: 'CardList',
  inheritAttrs: false,
  props: listProps(),
  setup(compProps) {
    const propsStore = usePropsStore();
    const activeKey = ref<any>([]);
    return () => {
      const {
        displayList = [],
        listData,
        changeList,
        schema,
        deleteItem,
        copyItem,
        addItem,
        displayType,
        getFieldsProps,
      } = compProps;
      const { props = {}, min = 0, max = 9999 } = schema;
      const { methods = {}, widgets = {} } = propsStore.value;

      const {
        bordered = false,
        addBtnProps: _addBtnProps,
        delConfirmProps: _delConfirmProps,
        hideDelete = false,
        hideAdd = false,
        hideCopy = false,
        hideMove = false,
        panelProps = {},
        ...restProps
      } = props;

      const CustomAddBtn = widgets[schema['add-widget'] || ''];

      const AddWidget = CustomAddBtn || Button;

      let addBtnProps: Record<string, any> = {
        type: 'dashed',
      };

      let delConfirmProps = {
        title: '确定删除?',
        okText: '确定',
        cancelText: '取消',
      };

      if (_addBtnProps && typeof _addBtnProps === 'object') {
        addBtnProps = { ...addBtnProps, ..._addBtnProps };
      }

      if (_delConfirmProps && typeof _delConfirmProps === 'object') {
        delConfirmProps = { ...delConfirmProps, ..._delConfirmProps };
      }

      addBtnProps.onClick = addItem;

      return (
        <>
          <Collapse
            v-model:activeKey={activeKey.value}
            bordered={bordered}
            style="background-color: transparent;"
            {...restProps}
            v-slots={{
              expandIcon: ({ isActive }: { isActive: boolean }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />,
              default: () => {
                return displayList.map((item, idx) => {
                  const fieldsProps = getFieldsProps(idx);
                  fieldsProps.displayType = displayType;
                  return (
                    <Panel
                      key={idx}
                      style="background-color: #fafafa; border-radius: 2px;margin-bottom: 8px;border: 0;overflow: hidden"
                      class="fr-collapse-list"
                      {...panelProps}
                      v-slots={{
                        header: () => (
                          <span class="fr-label-title no-colon">
                            {schema.title}
                            {idx + 1}
                          </span>
                        ),
                        default: () => <Core {...fieldsProps} />,
                        extra: () => (
                          <>
                            {!hideDelete && displayList.length > (min as number) && (
                              <Popconfirm
                                placement="left"
                                {...delConfirmProps}
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
                              >
                                <CloseOutlined
                                  onClick={e => {
                                    let ev = e || window.event;
                                    ev.stopPropagation();
                                  }}
                                  style={{
                                    fontSize: '13px',
                                    marginLeft: '8px',
                                    marginRight: '0px',
                                    color: '#00000073',
                                  }}
                                />
                              </Popconfirm>
                            )}
                            {!props.hideAdd && displayList.length < (max as number) && !props.hideCopy && (
                              <CopyOutlined
                                style={{ fontSize: '13px', marginLeft: '8px', marginRight: '0px', color: '#00000073' }}
                                onClick={e => {
                                  let ev = e || window.event;
                                  ev.stopPropagation();
                                  copyItem(idx);
                                }}
                              />
                            )}
                          </>
                        ),
                      }}
                    />
                  );
                });
              },
            }}
          />
          <div style={{ marginTop: displayList.length > 0 ? 0 : '8px' }}>
            {!props.hideAdd && displayList.length < (max as number) && (
              <AddWidget {...addBtnProps}> 新增一条 </AddWidget>
            )}
            {Array.isArray(props.buttons)
              ? props.buttons.map((item, idx) => {
                  const { callback, text, html } = item;
                  let onClick = () => {
                    console.log({
                      value: listData,
                      onChange: changeList,
                      schema,
                    });
                  };
                  if (typeof window[callback] === 'function') {
                    onClick = () => {
                      window[callback as string]({
                        value: listData,
                        onChange: changeList,
                        schema,
                      });
                    };
                  }
                  return (
                    <Button key={idx.toString()} style={{ marginLeft: '8px' }} type="dashed" onClick={onClick}>
                      <span innerHTML={html || text} />
                    </Button>
                  );
                })
              : null}
          </div>
        </>
      );
    };
  },
});
</script>
