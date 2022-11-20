<script lang="tsx">
import { defineComponent } from 'vue';
import { ArrowDownOutlined, ArrowUpOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { Button, Popconfirm } from 'ant-design-vue';
import { usePropsStore } from '../../../hooks';
import Core from '../../Core.vue';
import { listProps } from '../../../FRType';

const SimpleList = defineComponent({
  name: 'SimpleList',
  inheritAttrs: false,
  props: listProps(),
  setup(compProps) {
    const propsStore = usePropsStore();
    return () => {
      const {
        schema,
        displayList = [],
        listData,
        changeList,
        deleteItem,
        addItem,
        copyItem,
        moveItemUp,
        moveItemDown,
        getFieldsProps,
      } = compProps;

      const { props = {}, min = 0, max = 99999 } = schema;
      const { widgets = {} } = propsStore.value;

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

      addBtnProps.onClick = addItem;

      if (props.delConfirmProps && typeof props.delConfirmProps === 'object') {
        delConfirmProps = { ...delConfirmProps, ...props.delConfirmProps };
      }

      return (
        <div class="fr-list-1">
          {displayList.map((item, idx) => {
            const fieldsProps = getFieldsProps(idx);
            fieldsProps.displayType = 'inline';
            if (props.hideTitle) {
              fieldsProps.hideTitle = true;
            }
            return (
              <div key={idx} style={{ display: 'flex' }}>
                <Core {...fieldsProps} />
                <div style={{ marginTop: '6px' }}>
                  {!props.hideDelete && displayList.length > min && (
                    <Popconfirm placement="left" onConfirm={() => deleteItem(idx)} {...delConfirmProps}>
                      <DeleteOutlined style={{ fontSize: '17px', marginLeft: '8px' }} />
                    </Popconfirm>
                  )}
                  {!props.hideAdd && !props.hideCopy && (
                    <CopyOutlined style={{ fontSize: '15px', marginLeft: '8px' }} onClick={() => copyItem(idx)} />
                  )}
                  {!props.hideMove && (
                    <>
                      <ArrowUpOutlined
                        style={{ fontSize: '16px', marginLeft: '8px' }}
                        onClick={() => moveItemUp(idx)}
                      />
                      <ArrowDownOutlined
                        style={{ fontSize: '16px', marginLeft: '8px' }}
                        onClick={() => moveItemDown(idx)}
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: displayList.length > 0 ? 0 : '8px' }}>
            {!props.hideAdd && displayList.length < max && <AddWidget {...addBtnProps}>新增一条</AddWidget>}
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
                  if (typeof window[callback as string] === 'function') {
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
        </div>
      );
    };
  },
});

export default SimpleList;
</script>
