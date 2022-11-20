<script lang="tsx">
import { defineComponent } from 'vue';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons-vue';
import { Button, Popconfirm, Table, TableColumn } from 'ant-design-vue';
import Core from '../../Core.vue';
import { listProps } from '../../../FRType';
const FIELD_LENGTH = 170;
const TableList = defineComponent({
  name: 'TableList',
  inheritAttrs: false,
  props: listProps(),
  setup(compProps) {
    return () => {
      const {
        displayList = [],
        dataIndex,
        children,
        deleteItem,
        copyItem,
        addItem,
        moveItemUp,
        moveItemDown,
        flatten,
        schema,
        listData,
        changeList,
      } = compProps;

      const { props = {}, itemProps = {} } = schema;
      const { buttons, ...columnProps } = itemProps;
      const { pagination = {}, ...rest } = props;

      let actionColumnProps = {
        colHeaderText: '操作',
        copyText: '复制',
        delText: '删除',
      };

      let delConfirmProps = {
        title: '确定删除?',
        okText: '确定',
        cancelText: '取消',
      };

      let addBtnProps: Record<string, any> = {
        type: 'primary',
        size: 'small',
      };

      if (props.actionColumnProps && typeof props.actionColumnProps === 'object') {
        actionColumnProps = { ...actionColumnProps, ...props.actionColumnProps };
      }

      if (props.delConfirmProps && typeof props.delConfirmProps === 'object') {
        delConfirmProps = { ...delConfirmProps, ...props.delConfirmProps };
      }

      if (props.addBtnProps && typeof props.addBtnProps === 'object') {
        addBtnProps = { ...addBtnProps, ...props.addBtnProps };
      }

      const paginationConfig = pagination && {
        size: 'small',
        hideOnSinglePage: true,
        ...pagination,
      };

      const dataSource = displayList.map((item, idx) => {
        return { index: idx };
      });

      const columns = children.map(child => {
        const item = flatten[child];
        const schema = (item && item.schema) || {};
        const slots = {
          default: ({ index }: { index: number }) => {
            const childIndex = [...dataIndex, index];
            return (
              <Core hideTitle={true} displayType="inline" key={index.toString()} id={child} dataIndex={childIndex} />
            );
          },
          title: () =>
            schema.required
              ? () => (
                  <>
                    <span class="fr-label-required"> *</span>
                    <span>{schema.title}</span>
                  </>
                )
              : schema.title,
        };
        return <TableColumn dataIndex={child} width={FIELD_LENGTH} {...columnProps} v-slots={slots} />;
      });

      if (!props.hideDelete || !props.hideAdd || !props.hideCopy || !props.hideMove) {
        const actionCloumnsSlot = {
          default: ({ index }: { index: number }) => (
            <div>
              {!props.hideAdd && !props.hideCopy && <a onClick={() => copyItem(index)}>{actionColumnProps.copyText}</a>}
              {!props.hideDelete && (
                <Popconfirm placement="left" onConfirm={() => deleteItem(index)} {...delConfirmProps}>
                  <a style={{ marginLeft: '8px' }}>{actionColumnProps.delText}</a>
                </Popconfirm>
              )}
              {!props.hideMove && (
                <>
                  <ArrowUpOutlined
                    style={{ color: '#1890ff', fontSize: '16px', marginLeft: '8px' }}
                    onClick={() => moveItemUp(index)}
                  />
                  <ArrowDownOutlined
                    style={{ color: '#1890ff', fontSize: '16px', marginLeft: '8px' }}
                    onClick={() => moveItemDown(index)}
                  />
                </>
              )}
            </div>
          ),
        };

        columns.push(
          <TableColumn
            title={actionColumnProps.colHeaderText}
            width={120}
            fixed="right"
            key="$action"
            v-slots={actionCloumnsSlot}
          />
        );
      }

      return (
        <>
          <div class="w-100 mb2 tr">
            {!props.hideAdd && (
              <Button {...addBtnProps} onClick={addItem}>
                新增一条
              </Button>
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
                    <Button key={idx.toString()} style={{ marginLeft: '8px' }} size="small" onClick={onClick}>
                      <span innerHTML={html || text} />
                    </Button>
                  );
                })
              : null}
          </div>
          <Table
            scroll={{ x: 'max-content' }}
            dataSource={dataSource}
            rowKey="index"
            size="small"
            pagination={paginationConfig}
            {...rest}
          >
            {columns}
          </Table>
        </>
      );
    };
  },
});

export default TableList;
</script>
