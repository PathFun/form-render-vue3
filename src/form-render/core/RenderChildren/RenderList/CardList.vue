<script lang="tsx">
import { defineComponent } from 'vue';
import { Button, Popconfirm } from 'ant-design-vue';
import { CloseOutlined, CopyOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue';
import Core from '../../Core.vue';
import { listProps } from '../../../FRType';
import { usePropsStore } from '../../../hooks';
export default defineComponent({
  name: 'CardList',
  inheritAttrs: false,
  props: listProps(),
  setup(compProps) {
    const propsStore = usePropsStore();
    return () => {
      const {
        displayList = [],
        listData,
        changeList,
        schema,
        deleteItem,
        copyItem,
        addItem,
        moveItemUp,
        moveItemDown,
        displayType,
        getFieldsProps,
      } = compProps;
      const { props = {}, min = 0, max = 9999 } = schema;
      const { methods = {}, widgets = {} } = propsStore.value;

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

      if (props.addBtnProps && typeof props.addBtnProps === 'object') {
        addBtnProps = { ...addBtnProps, ...props.addBtnProps };
      }

      if (props.delConfirmProps && typeof props.delConfirmProps === 'object') {
        delConfirmProps = { ...delConfirmProps, ...props.delConfirmProps };
      }

      addBtnProps.onClick = addItem;

      return (
        <>
          <div class="fr-card-list">
            {displayList.map((item, idx) => {
              const fieldsProps = getFieldsProps(idx);
              fieldsProps.displayType = displayType;
              return (
                <div class={`fr-card-item ${displayType === 'row' ? 'fr-card-item-row' : ''}`} key={idx}>
                  <div class="fr-card-index">{idx + 1}</div>
                  <Core {...fieldsProps} />
                  <div class="fr-card-toolbar">
                    {!props.hideMove && (
                      <>
                        <ArrowUpOutlined
                          style={{ fontSize: '16px', marginLeft: '4px' }}
                          onClick={() => moveItemUp(idx)}
                        />
                        <ArrowDownOutlined
                          style={{ fontSize: '16px', marginLeft: '4px' }}
                          onClick={() => moveItemDown(idx)}
                        />
                      </>
                    )}
                    {!props.hideAdd && !props.hideCopy && (
                      <CopyOutlined style={{ fontSize: '16px', marginLeft: '8px' }} onClick={() => copyItem(idx)} />
                    )}
                    {!props.hideDelete && displayList.length > min && (
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
                        }}
                        {...delConfirmProps}
                      >
                        <CloseOutlined style={{ fontSize: '16px', marginLeft: '8px' }} />
                      </Popconfirm>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: displayList.length > 0 ? 0 : '8px' }}>
            {!props.hideAdd && displayList.length < max && <AddWidget {...addBtnProps}> 新增一条 </AddWidget>}
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
