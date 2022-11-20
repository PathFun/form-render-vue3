<script lang="tsx">
import { defineComponent, ref } from 'vue';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons-vue';
import { Button, Drawer, Popconfirm, Table, TableColumn } from 'ant-design-vue';
import { usePropsStore } from '../../../hooks';
import { getDataPath, getDisplayValue, getKeyFromPath } from '../../../_util';
import Core from '../../Core.vue';
import ErrorMessage from '../../RenderField/ErrorMessage.vue';
import { listProps } from '../../../FRType';
const FIELD_LENGTH = 170;
const DrawerList = defineComponent({
  name: 'DrawerList',
  inheritAttrs: false,
  props: listProps(),
  setup(compProps) {
    const propsStore = usePropsStore();
    const showDrawer = ref(false);
    const currentIndex = ref(-1);
    const openDrawer = (index: number) => {
      currentIndex.value = index;
      showDrawer.value = true;
    };

    const closeDrawer = () => {
      currentIndex.value = -1;
      showDrawer.value = false;
    };

    const handleAdd = () => {
      const newIndex = compProps.addItem();
      openDrawer(newIndex);
    };

    return () => {
      const {
        displayList = [],
        dataPath,
        children,
        deleteItem,
        moveItemDown,
        moveItemUp,
        flatten,
        errorFields,
        getFieldsProps,
        schema,
        changeList,
        listData,
      } = compProps;

      const { widgets = {} } = propsStore.value;
      const { props = {}, itemProps = {} } = schema;
      const { buttons, ...columnProps } = itemProps;
      const { pagination = {}, ...rest } = props;

      let actionColumnProps = {
        colHeaderText: '操作',
        editText: '编辑',
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

      const dataSource = displayList.map((item, index) => ({
        ...item,
        _idx: index,
      }));

      const columns = children.map(child => {
        const item = flatten[child];
        const schema = (item && item.schema) || {};
        const _dataIndex = getKeyFromPath(child);
        const slots = {
          default: ({ record, index }: { record: Record<string, any>; index: number }) => {
            const childPath = getDataPath(child, [index]);
            const errorObj = errorFields.find(item => item.name == childPath);
            const value = record[_dataIndex];
            //TODO: 万一error在更深的层，这个办法是find不到的，会展示那一行没有提示。可以整一行加一个红线的方式处理
            const Widget = widgets[schema.readOnlyWidget || ''];
            return (
              <div>
                <div>{Widget ? <Widget value={value} schema={schema} /> : getDisplayValue(value, schema)}</div>
                {errorObj && errorObj.error && <ErrorMessage message={errorObj.error} schema={schema} />}
              </div>
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
        return <TableColumn dataIndex={_dataIndex} width={FIELD_LENGTH} {...columnProps} v-slots={slots} />;
      });

      const actionCloumnsSlot = {
        default: ({ index }: { index: number }) => (
          <div>
            {!props.hideEdit && <a onClick={() => openDrawer(index)}>{actionColumnProps.editText}</a>}
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

      const fieldsProps = getFieldsProps(currentIndex.value);

      return (
        <>
          <div class="w-100 mb2 tr">
            {!props.hideAdd && (
              <Button {...addBtnProps} onClick={handleAdd}>
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
                    <Button key={idx.toString()} style={{ marginLeft: '8px' }} size="small" onClick={onClick}>
                      <span innerHTML={html || text} />
                    </Button>
                  );
                })
              : null}
          </div>
          <Drawer
            width="600"
            title={actionColumnProps.colHeaderText}
            placement="right"
            onClose={closeDrawer}
            visible={showDrawer.value}
            destroyOnClose // 必须要加，currentIndex不是一个state，Core不会重新渲染就跪了
          >
            <div class="fr-container">
              <Core {...fieldsProps} />
            </div>
          </Drawer>
          <Table
            size="small"
            scroll={{ x: 'max-content' }}
            dataSource={dataSource}
            rowClassName={(record, idx) => {
              const index = record && record._idx;
              const hasError = errorFields.find(item => item.name.indexOf(`${dataPath}[${index}]`) > -1);
              return hasError ? 'fr-row-error' : '';
            }}
            rowKey="_idx"
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

export default DrawerList;
</script>
