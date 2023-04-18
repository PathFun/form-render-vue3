<script lang="ts" setup>
import 'ant-design-vue/dist/antd.css';
import { Button, Space, message } from 'ant-design-vue';
import FR, { useForm } from './form-render';
import { reactive, ref, watch } from 'vue';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const fakeApi = (url = '', data = {}) => {
  console.group('request:', url);
  console.log('params:', data);
  console.groupEnd();
  return delay(200);
};

const disabled = ref(false);

const form = useForm({
  initialValue: {},
});

const schema = reactive({
  type: 'object',
  properties: {
    data: {
      type: 'array',
      title: '中心数据',
      widget: 'drawerList',
      readOnlyWidget: 'staticJson',
      items: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            title: '数据的key(唯一)',
            required: true,
          },
          label: {
            type: 'string',
            title: '数据的label',
            required: true,
          },
          value: {
            type: 'object',
            title: '配置',
            properties: {
              dataType: {
                title: '数据类型',
                type: 'string',
                enum: ['interface', 'custom'],
                enumNames: ['接口数据', '自定义数据'],
              },
              url: {
                type: 'string',
                title: '接口地址',
                hidden: `{{rootValue.dataType !== 'interface'}}`,
                props: {
                  addonBefore: 'url',
                },
              },
              method: {
                type: 'string',
                title: '请求方法',
                enum: ['GET', 'POST', 'Put'],
                hidden: `{{rootValue.dataType !== 'interface'}}`,
              },
              interval: {
                type: 'number',
                title: '刷新时间',
                hidden: `{{rootValue.dataType !== 'interface'}}`,
                description:
                  '不填或者0时只在初始化时获取, 数值大于0时则为间隔当前数值时间获取、单位为秒，建议设置数值不少于1000',
              },
              data: {
                type: 'array',
                title: '接口data参数',
                hidden: `{{rootValue.dataType !== 'interface'}}`,
                max: 20,
                items: {
                  type: 'object',
                  properties: {
                    key: {
                      type: 'string',
                      title: '参数名',
                    },
                    value: {
                      type: 'string',
                      title: '参数值',
                    },
                    valueType: {
                      type: 'string',
                      title: '值类型',
                      description: `数字类型会以Number(str)转换、数组型会以str.split(',')方式转换, 复杂数组型与对象型会以JSON.parse(str)转换`,
                      enum: ['string', 'number', 'array', 'object'],
                      enumNames: ['字符型', '数字型', '数组型', '对象型'],
                    },
                  },
                },
              },
              params: {
                type: 'array',
                title: '接口params参数',
                hidden: `{{rootValue.dataType !== 'interface'}}`,
                max: 20,
                items: {
                  type: 'object',
                  properties: {
                    key: {
                      type: 'string',
                      title: '参数名',
                    },
                    value: {
                      type: 'string',
                      title: '参数值',
                    },
                  },
                },
              },
              afterFetch: {
                type: 'string',
                title: '获取数据后整理函数',
                description: '接口返回数据后执行此方法, result为返回值关键词',
                descType: 'text',
                widget: 'codemirror',
                props: {
                  extensions: ['javascript'],
                  placeholder: '请填写',
                  style: {
                    height: '220px',
                  },
                },
                hidden: `{{rootValue.dataType !== 'interface'}}`,
              },
              json: {
                type: 'string',
                title: '自定义JSON数据',
                widget: 'customData',
                props: {
                  extensions: ['javascript'],
                  placeholder: '请填写',
                },
                hidden: `{{rootValue.dataType !== 'custom'}}`,
              },
              initData: {
                type: 'string',
                title: '整理数据',
                description: 'result为返回值关键词',
                widget: 'codemirror',
                props: {
                  extensions: ['javascript'],
                  placeholder: '请填写',
                  style: {
                    height: '220px',
                  },
                },
                hidden: `{{rootValue.dataType === 'interface'}}`,
              },
            },
          },
        },
      },
    },
  },
});

// const schema = reactive({
//   type: 'object',
//   properties: {
//     table_eXrRIV: {
//       title: '表格对象',
//       type: 'object',
//       widget: 'table',
//       rows: [
//         [
//           {
//             merged: false,
//             colspan: 1,
//             rowspan: 1,
//             widgets: [],
//           },
//           {
//             merged: false,
//             colspan: 2,
//             rowspan: 1,
//             widgets: ['input3'],
//           },
//         ],
//         [
//           {
//             merged: false,
//             colspan: 1,
//             rowspan: 1,
//             widgets: ['input4'],
//           },
//           {
//             merged: false,
//             colspan: 1,
//             rowspan: 1,
//             widgets: [],
//           },
//           {
//             merged: false,
//             colspan: 1,
//             rowspan: 2,
//             widgets: ['select2'],
//           },
//         ],
//         [
//           {
//             merged: false,
//             colspan: 2,
//             rowspan: 1,
//             widgets: ['input2', 'input5'],
//           },
//           {
//             merged: true,
//             colspan: 1,
//             rowspan: 1,
//             widgets: [],
//           },
//         ],
//       ],
//       props: {
//         border: 1,
//         customClass: '',
//         hideTitle: true,
//       },
//       properties: {
//         select2: {
//           title: '单选',
//           type: 'string',
//           widget: 'select',
//           enum: ['a', 'b', 'c'],
//           enumNames: ['早上', '中午', '晚上'],
//         },
//         input2: {
//           title: '输入框2',
//           type: 'string',
//           required: true,
//         },
//         input3: {
//           title: '输入框3',
//           type: 'string',
//           required: true,
//         },
//         input4: {
//           title: '输入框4',
//           type: 'string',
//           required: true,
//         },
//         input5: {
//           title: '输入框5',
//           type: 'string',
//           required: true,
//         },
//       },
//     },
//   },
// });

const getRemoteData = () => {
  fakeApi('xxx/getForm').then(_ => {
    form.setValues({ input1: 'hello world', select1: 'c' });
  });
};

// 异步加载表单
// delay(3000).then(_ => {
//   Object.assign(schema, {
//     type: 'object',
//     properties: {
//       html: {
//         title: 'html',
//         type: 'string',
//         widget: 'html',
//       },
//       inputName: {
//         title: 'url输入框',
//         type: 'string',
//         format: 'url',
//       },
//       inputSimple: {
//         title: '简单输入框',
//         type: 'string',
//       },
//       imageName: {
//         title: '图片展示',
//         type: 'string',
//         format: 'image',
//         hidden: '{{!rootValue.inputSimple}}',
//       },
//       color: {
//         title: '颜色展示',
//         type: 'string',
//         format: 'color',
//       },
//       testChild: {
//         type: 'object',
//         title: '对象内部',
//         properties: {
//           objectName: {
//             title: '图片展示',
//             type: 'string',
//           },
//           objectName2: {
//             title: 'email输入框',
//             type: 'string',
//           },
//           subLayout: {
//             title: '布局组件',
//             type: 'layout',
//             widget: 'card',
//             props: {
//               style: {
//                 width: '100%',
//               },
//               size: 'small',
//               extra: '<a href="#">更多</a>',
//               cover:
//                 '<img alt="example" style="width: 100%;" src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F0109975ed61679a801215aa003eb61.jpg%403000w_1l_2o_100sh.jpg&refer=http%3A%2F%2Fimg.zcool.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1670908474&t=31add1fd2a1e3dd7741aa697f8392c1b"/>',
//             },
//             properties: {
//               layoutInnerInput: {
//                 title: '图片展示',
//                 type: 'string',
//               },
//               listName2: {
//                 title: '对象数组',
//                 description: '对象数组嵌套功能',
//                 type: 'array',
//                 min: 1,
//                 max: 3,
//                 items: {
//                   type: 'object',
//                   properties: {
//                     input1: {
//                       title: '简单输入框',
//                       type: 'string',
//                     },
//                     select1: {
//                       title: '单选',
//                       type: 'string',
//                       enum: ['a', 'b', 'c'],
//                       enumNames: ['早', '中', '晚'],
//                     },
//                   },
//                 },
//               },
//               innerObject: {
//                 type: 'object',
//                 properties: {
//                   innerObjectName: {
//                     title: '图片展示',
//                     type: 'string',
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//       layoutData: {
//         title: '布局组件',
//         type: 'layout',
//         widget: 'tab',
//         rows: [
//           {
//             key: '1',
//             tab: 'pane 1',
//             widgets: ['layoutInput'],
//           },
//           {
//             key: '2',
//             tab: 'pane 2',
//             widgets: ['listName3'],
//           },
//         ],
//         props: {
//           size: 'small',
//           centered: true,
//           title: '<span style="padding-left: 16px">Tab布局组件</span>',
//           style: 'width: 100%',
//         },
//         properties: {
//           layoutInput: {
//             title: '图片展示',
//             type: 'string',
//           },
//           listName3: {
//             title: '对象数组',
//             description: '对象数组嵌套功能',
//             type: 'array',
//             min: 1,
//             max: 3,
//             items: {
//               type: 'object',
//               properties: {
//                 input1: {
//                   title: '简单输入框',
//                   type: 'string',
//                 },
//                 select1: {
//                   title: '单选',
//                   type: 'string',
//                   enum: ['a', 'b', 'c'],
//                   enumNames: ['早', '中', '晚'],
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//   });
// });

const onFinish = (data: any, errors: any[]) => {
  if (errors.length > 0) {
    setTimeout(function () {
      message.error('校验未通过：' + JSON.stringify(errors.map(item => item.name)));
    });
  } else {
    fakeApi('xxx/submit', data).then(_ => message.success('提交成功！'));
  }
};

const changeSchema = () => {
  Object.assign(schema, {
    type: 'object',
    properties: {
      inp1: {
        title: '输入框121',
        type: 'string',
        required: true,
      },
      sel1: {
        title: '单选121',
        type: 'string',
        enum: ['a', 'b', 'c'],
        enumNames: ['早', '中', '晚'],
      },
    },
  });
};

const changeDisabled = () => {
  disabled.value = !disabled.value;
};

const getFormDate = () => {
  // console.log(form.formData);
};

// watch(
//   () => form.formData,
//   newFormData => console.log(newFormData),
//   {
//     deep: true,
//   }
// );
</script>

<template>
  <div style="width: 100%; padding: 30px">
    <FR
      :form="form"
      :schema="schema"
      colon
      desc-type="icon"
      display-type="column"
      label-align="right"
      :on-finish="onFinish"
      :disabled="disabled"
    />
    <Space>
      <Button @click="getRemoteData">加载服务端数据</Button>
      <Button @click="changeSchema">点击修改Schema</Button>
      <Button @click="changeDisabled">点击修改Disabled</Button>
      <Button @click="getFormDate">获取FormData</Button>
      <Button type="primary" @click="() => form.submit()"> 提交（见console） </Button>
    </Space>
  </div>
</template>
