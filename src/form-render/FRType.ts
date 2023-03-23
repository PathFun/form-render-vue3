import { RuleItem } from 'async-validator/dist-types/interface';
import type { PropType, ExtractPropTypes, CSSProperties, Ref } from 'vue';
export type { RuleItem } from 'async-validator/dist-types/interface';
import PropTypes from './_util/vue-types';
export type SchemaType =
  | 'string'
  | 'object'
  | 'array'
  | 'number'
  | 'boolean'
  | 'void'
  | 'date'
  | 'datetime'
  | 'block'
  | string;

export type LabelAlign = 'right' | 'left';

export type DisplayType = 'column' | 'row' | 'inline';

export type RequiredMark = boolean | 'optional';

export interface SchemaBase {
  type: SchemaType;
  title: string;
  description: string;
  descType: 'text' | 'icon' | 'widget';
  format: 'image' | 'textarea' | 'color' | 'email' | 'url' | 'dateTime' | 'date' | 'time' | 'upload' | (string & {});
  default: any;
  /** 是否必填，支持 `'{{ formData.xxx === "" }}'` 形式的表达式 */
  required: boolean | string;
  placeholder: string;
  bind: false | string | string[];
  dependencies: string[];
  /** 最小值，支持表达式 */
  min: number | string;
  /** 最大值，支持表达式 */
  max: number | string;
  step: number | string;
  /** 是否禁用，支持 `'{{ formData.xxx === "" }}'` 形式的表达式 */
  disabled: boolean | string;
  /** 是否只读，支持 `'{{ formData.xxx === "" }}'` 形式的表达式 */
  readOnly: boolean | string;
  /** 是否隐藏，隐藏的字段不会在 formData 里透出，支持 `'{{ formData.xxx === "" }}'` 形式的表达式 */
  hidden: boolean | string;
  displayType: DisplayType;
  width: string | number;
  labelWidth: number | string;
  labelAlign: LabelAlign;
  column: number;
  className: string;
  widget: string;
  readOnlyWidget: string;
  extra:
    | string
    | {
        widget?: string;
        text?: string;
      };
  properties: Record<string, Schema>;
  items: Schema;
  /** 多选，支持表达式 */
  enum: Array<string | number> | string;
  /** 多选label，支持表达式 */
  enumNames: Array<string | number> | string;
  rules: RuleItem | RuleItem[];
  props: Record<string, any>;
  /**扩展字段 */
  'add-widget'?: string;
  renderTitle?: (schema: Record<string, any>) => JSX.Element;
  descWidget?: string;
  requiredMark: RequiredMark;
  itemProps?: Record<string, any>;
  // 一维、二维表格参数
  rows:
    | {
        widgets: string[];
        [key: string]: any;
      }[][]
    | {
        widgets: string[];
        [key: string]: any;
      }[];
}

export type Schema = Partial<SchemaBase>;

export interface Error {
  /** 错误的数据路径 */
  name: string;
  /** 错误的内容 */
  error: string[];
}
export interface FormParams {
  initialValue: Record<string, any>;
  onChange?: (data: Record<string, any>) => void;
  onValidate?: (valid: any) => void;
  showValidate?: boolean;
  /** 数据分析接口，表单展示完成渲染时触发 */
  logOnMount?: (stats: any) => void;
  /** 数据分析接口，表单提交成功时触发，获得本次表单填写的总时长 */
  logOnSubmit?: (stats: any) => void;
}

export interface ValidateParams {
  formData: Record<string, any>;
  schema: Schema;
  error: Error[];
  [k: string]: any;
}

export interface ResetParams {
  formData?: Record<string, any>;
  submitData?: Record<string, any>;
  errorFields?: Error[];
  touchedKeys?: string[];
  allTouched?: boolean;
  [k: string]: any;
}
export interface FieldParams {
  name: string;
  error?: string[];
  touched?: boolean;
  validating?: boolean;
  value?: any;
}

export interface FormInstance {
  formData: Record<string, any>;
  schema: Schema;
  flatten: Flatten;
  touchedKeys: string[];
  touchKey: (key: string) => void;
  onItemChange: (path: string, value: any) => void;
  setValueByPath: (path: string, value: any) => void;
  getSchemaByPath: (path: string) => object;
  setSchemaByPath: (path: string, value: any) => void;
  setSchema: (settings: any) => void;
  setValues: (formData: any) => void;
  getValues: (
    nameList: string[] | true,
    filterFunc?: (meta: { touched: boolean; validating: boolean }) => boolean
  ) => any;
  resetFields: (options?: ResetParams) => void;
  submit: () => Promise<{ data: any; errors: Error[] }>;
  submitData: any;
  errorFields: Error[];
  isValidating: boolean;
  outsideValidating: boolean;
  showValidate: boolean;
  isSubmitting: boolean;
  endValidating: () => void;
  endSubmitting: () => void;
  setErrorFields: (error: Error[]) => void;
  removeErrorField: (path: string) => void;
  removeTouched: (path: string) => void;
  changeTouchedKeys: (pathArray: string[]) => void;
  isEditing: boolean;
  setEditing: (status: boolean) => void;
  syncStuff: (args: any) => void;
  validateFields: (nameList?: string[]) => Promise<{ data: any; errors: Error[] }>;
  isFieldTouched: (namePath: string) => boolean;
  isFieldsTouched: (nameList?: string[], allTouched?: boolean) => boolean | undefined;
  setFieldValidating: (namePath: string) => void;
  removeFieldValidating: (namePath: string) => void;
  isFieldValidating: (namePath: string) => boolean;
  getFieldError: (namePath: string) => String[];
  getFieldsError: (nameList?: string[]) => Error[];
  setFields: (fields: FieldParams[]) => void;
  /** 折中升级方案中使用到，正常用不到 */
  init: () => void;
  /** 数据分析接口，表单展示完成渲染时触发 */
  logOnMount: (args: any) => void;
  /** 数据分析接口，表单提交成功时触发，获得本次表单填写的总时长 */
  logOnSubmit: (args: any) => void;
  _setErrors: (args: any) => void;
  allTouched: boolean;
  getHiddenValues: () => Record<string, any>;
  setFirstMount: (firstMount: boolean) => void;
  firstMount: boolean;
}

export interface FlattenSchema extends Schema {
  _id: string;
  [key: string]: any;
}

export interface FlattenValue {
  children: string[];
  parent?: string;
  schema: FlattenSchema;
}

export type Flatten = Record<string, FlattenValue>;

export interface FRPropsCtx {
  /** 表单的全局共享属性 */
  globalProps: Record<string, any>;
  /** 标签元素和输入元素的排列方式，column-分两行展示，row-同行展示，inline-自然顺排，默认`'column'` */
  displayType: DisplayType;
  theme: string;
  column: string | number;
  debounceInput?: boolean;
  /** 显示当前表单内部状态 */
  debug?: boolean;
  /** 标签宽度 */
  labelWidth: string | number;
  /** 覆盖默认的校验信息 */
  validateMessages: any;
  locale: 'cn' | 'en';
  /** 只读模式 */
  readOnly: boolean;
  /** 禁用模式 */
  disabled: boolean;
  /** 对象组件是否折叠（全局的控制） */
  allCollapsed: boolean;
  /** 自定义组件 */
  widgets: Record<string, any>;
  /** 组件和schema的映射规则 */
  mapping: Record<string, string>;
  labelAlign: LabelAlign;
  colon: boolean;
  renderTitle: (schema: Record<string, any>) => JSX.Element;
  requiredMark: RequiredMark;
  methods: Record<string, (...args: any[]) => any>;
}

export declare function useForm(params?: FormParams): FormInstance;

export const frProps = () => ({
  id: [String, Number],
  /** 表单顶层的className */
  className: String,
  /** 表单顶层的样式 */
  style: { type: Object as PropType<CSSProperties>, default: () => ({} as CSSProperties) },
  /** 表单 schema */
  schema: {
    type: Object as PropType<Schema>,
    required: true,
    default: () => ({}),
  },
  /** form单例 */
  form: {
    type: Object as PropType<FormInstance>,
    required: true,
    default: () => ({}),
  },
  /** 组件和schema的映射规则 */
  mapping: {
    type: Object as PropType<Record<string, string>>,
    default: () => ({}),
  },
  /** 自定义组件 */
  widgets: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
  /** 标签元素和输入元素的排列方式，column-分两行展示，row-同行展示，inline-自然顺排，默认`'column'` */
  displayType: String as PropType<DisplayType>,
  /** 表示是否显示 label 后面的冒号 */
  colon: Boolean,
  /** label 标签的文本对齐方式	 */
  labelAlign: {
    type: String as PropType<LabelAlign>,
    default: 'right',
  },
  /** 只读模式 */
  readOnly: {
    type: Boolean,
    default: false,
  },
  /** 禁用模式 */
  disabled: {
    type: Boolean,
    default: false,
  },
  /** 标签宽度 */
  labelWidth: {
    type: [Number, String],
    default: 120,
  },
  /** antd的全局config */
  configProvider: {
    type: Object,
    default: () => ({}),
  },
  theme: String,
  /** 覆盖默认的校验信息 */
  validateMessages: {
    type: Object as PropType<Record<string, string>>,
    default: () => ({}),
  },
  /** 显示当前表单内部状态 */
  debug: {
    type: Boolean,
    default: false,
  },
  /** 显示css布局提示线 */
  debugCss: {
    type: Boolean,
    default: false,
  },
  locale: {
    type: String as PropType<'cn' | 'en'>,
    default: 'cn',
  },
  column: {
    type: [Number, String],
    default: 1,
  },
  debounceInput: {
    type: Boolean,
    default: false,
  },
  size: String as PropType<'large' | 'small' | 'default'>,
  // 数据会作为 beforeFinish 的第四个参数传入
  config: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
  /** 对象组件是否折叠（全局的控制） */
  allCollapsed: {
    type: Boolean,
    default: false,
  },
  /** 表单的全局共享属性 */
  globalProps: {
    type: Object,
    default: () => ({}),
  },
  /** 隐藏的数据是否去掉，默认不去掉（false） */
  removeHiddenData: {
    type: Boolean,
    default: false,
  },
  /** 配置自定义layout组件 */
  layoutWidgets: PropTypes.any,
  renderTitle: {
    type: Function as PropType<(schema: Record<string, any>) => JSX.Element>,
  },
  requiredMark: {
    type: [Boolean, String] as PropType<RequiredMark>,
    default: true,
  },
  /** 扩展方法 */
  methods: {
    type: Object as PropType<Record<string, (...args: any[]) => any>>,
    default: () => ({}),
  },
  /** 表单首次加载钩子 */
  onMount: {
    type: Function as PropType<() => void>,
  },
  beforeFinish: {
    type: Function as PropType<BeforeFinish>,
  },
  /** 表单提交后钩子 */
  onFinish: {
    type: Function as PropType<(formData: any, error: Error[]) => void>,
  },
});

export const coreProps = () => ({
  id: {
    type: String,
    default: '#',
  },
  dataIndex: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  _item: {
    type: Object as PropType<FlattenValue>,
    default: undefined,
  },
  hideTitle: {
    type: Boolean,
    default: false,
  },
  hideValidation: {
    type: Boolean,
    default: false,
  },
  debugCss: {
    type: Boolean,
    default: false,
  },
  labelAlign: {
    type: String as PropType<LabelAlign>,
    default: 'right',
  },
  displayType: {
    type: String as PropType<DisplayType>,
  },
});

export const coreRenderProps = () => ({
  id: {
    type: String,
    default: '#',
  },
  schema: {
    type: Object as PropType<FlattenSchema>,
    default: () => ({}),
    required: true,
  },
  item: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
    required: true,
  },
  dataIndex: {
    type: Array as PropType<number[]>,
    default: (): number[] => [],
  },
  dataPath: {
    type: String,
    default: '',
  },
  _value: PropTypes.any,
  dependValues: {
    type: Array as PropType<any[]>,
    default: (): any[] => [],
  },
  hideTitle: {
    type: Boolean,
    default: false,
  },
  hideValidation: {
    type: Boolean,
    default: false,
  },
  debugCss: {
    type: Boolean,
    default: false,
  },
  displayType: {
    type: String as PropType<DisplayType>,
  },
  column: {
    type: [Number, String],
    default: 1,
  },
  labelWidth: {
    type: [Number, String],
    default: '',
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  errorFields: {
    type: Array as PropType<Error[]>,
    default: (): Error[] => [],
  },
  effectiveLabelWidth: {
    type: [Number, String],
    default: '',
  },
  allTouched: {
    type: Boolean,
    default: false,
  },
  labelAlign: {
    type: String as PropType<LabelAlign>,
    default: 'right',
  },
});

export const renderFieldProps = () => ({
  dataIndex: Array as PropType<number[]>,
  dataPath: {
    type: String,
    default: '',
  },
  _value: PropTypes.any,
  dependValues: Array as PropType<any[]>,
  _schema: {
    type: Object as PropType<FlattenSchema>,
    required: true,
    default: () => ({}),
  },
  labelClass: {
    type: String,
    default: '',
  },
  labelStyle: {
    type: Object as PropType<CSSProperties>,
    default: () => ({}),
  },
  hideValidation: Boolean,
  contentClass: String,
  errorFields: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  hideTitle: Boolean,
  displayType: String as PropType<DisplayType>,
});

export const messagesProps = () => ({
  message: PropTypes.any,
  schema: {
    type: Object as PropType<FlattenSchema>,
    default: () => ({}),
  },
  softHidden: { type: Boolean, default: false },
  hardHidden: { type: Boolean, default: false },
});

export const extendedWidgetProps = () => ({
  schema: {
    type: Object as PropType<FlattenSchema>,
    default: () => ({}),
    required: true,
  },
  onChange: {
    type: Function,
    default: function () {},
  },
  value: PropTypes.any,
  dependValues: {
    type: Array as PropType<any[]>,
    default: (): any[] => [],
  },
  onItemChange: {
    type: Function,
    default: function () {
      console.error('error');
    },
  },
  formData: PropTypes.any,
  getValue: {
    type: Function,
    default: function () {
      console.error('error');
    },
  },
  readOnly: {
    type: [Boolean, String],
    default: false,
  },
  dataPath: { type: String, default: '' },
  disabled: {
    type: [Boolean, String],
    default: false,
  },
  dataIndex: {
    type: Array as PropType<number[]>,
    default: (): number[] => [],
  },
  hasError: Boolean,
});

export const titleProps = () => ({
  labelClass: {
    type: String,
    default: '',
  },
  labelStyle: {
    type: Object as PropType<CSSProperties>,
    default: () => ({}),
  },
  schema: {
    type: Object as PropType<FlattenSchema>,
    default: () => ({}),
  },
  displayType: {
    type: String as PropType<DisplayType>,
    default: '',
  },
  renderTitle: Function as PropType<(schema: Record<string, any>) => JSX.Element>,
  requiredMark: [Boolean, String] as PropType<RequiredMark>,
});

const fnDefine = {
  type: Function as PropType<(...args: any[]) => any>,
  default: function () {
    console.warn('warn');
  },
};

export const renderListProps = () => ({
  parentId: {
    type: String,
    default: '',
    required: true,
  },
  schema: {
    type: Object as PropType<FlattenSchema>,
    default: () => ({}),
    required: true,
  },
  dataIndex: {
    type: Array as PropType<number[]>,
    default: (): number[] => [],
  },
  errorFields: {
    type: Array as PropType<Error[]>,
    default: () => [],
  },
  displayType: {
    type: String as PropType<DisplayType>,
    default: '',
  },
  hideTitle: {
    type: Boolean,
    default: false,
  },
  labelAlign: {
    type: String as PropType<LabelAlign>,
    default: 'right',
  },
  children: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});

export const listProps = () => ({
  schema: {
    type: Object as PropType<FlattenSchema>,
    default: () => ({}),
  },
  displayList: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  listData: PropTypes.any,
  changeList: fnDefine,
  deleteItem: fnDefine,
  addItem: fnDefine,
  copyItem: fnDefine,
  moveItemUp: fnDefine,
  moveItemDown: fnDefine,
  displayType: {
    type: String as PropType<'column' | 'row' | 'inline'>,
    default: 'column',
  },
  getFieldsProps: {
    type: Function as PropType<
      (
        idx: number,
        extraProps?: Record<string, any>
      ) => {
        _item: FlattenValue;
        dataIndex: number[];
        [key: string]: any;
      }
    >,
    required: true,
    default: function () {
      console.warn('warn');
    },
  },
  dataPath: {
    type: String,
    default: '',
  },
  dataIndex: {
    type: Array as PropType<number[]>,
    default: () => [],
  },
  children: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  flatten: {
    type: Object as PropType<Flatten>,
    default: () => ({}),
  },
  errorFields: {
    type: Array as PropType<Error[]>,
    default: () => [],
  },
});

export const componentProps = () => ({
  schema: {
    type: Object as PropType<FlattenSchema>,
    default: () => ({}),
  },
  onChange: {
    type: Function as PropType<(...args: any[]) => any>,
    default: function () {
      console.warn('warn');
    },
  },
  value: PropTypes.any,
  disabled: {
    type: Boolean,
    default: false,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  class: {
    type: String,
    default: '',
  },
  componentProps: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
  globalProps: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
});

export type BeforeFinish = (params: ValidateParams) => Error[] | Promise<Error[]>;

export type FRProps = Partial<ExtractPropTypes<ReturnType<typeof frProps>>>;
export type CoreProps = Partial<ExtractPropTypes<ReturnType<typeof coreProps>>>;
export type MessagesProps = Partial<ExtractPropTypes<ReturnType<typeof messagesProps>>>;
export type ExtendedWidgetProps = Partial<ExtractPropTypes<ReturnType<typeof extendedWidgetProps>>>;
export type TitleProps = Partial<ExtractPropTypes<ReturnType<typeof titleProps>>>;
export type RenderListProps = Partial<ExtractPropTypes<ReturnType<typeof renderListProps>>>;
export type ListProps = Partial<ExtractPropTypes<ReturnType<typeof listProps>>>;
export type CoreRenderProps = Partial<ExtractPropTypes<ReturnType<typeof coreRenderProps>>>;
export type RenderFieldProps = Partial<ExtractPropTypes<ReturnType<typeof renderFieldProps>>>;
export type ComponentProps = Partial<ExtractPropTypes<ReturnType<typeof componentProps>>>;
