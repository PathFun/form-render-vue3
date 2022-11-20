import { h } from 'vue';
import list from './List.vue';
import map from './Map.vue';
import { InputNumber, Checkbox, Input, Switch, Rate, TreeSelect, Cascader } from 'ant-design-vue';
import ImageInput from './ImageInput.vue';
import urlInput from './UrlInput.vue';
import Html from './Html.vue';
import select from './Select.vue';
import checkboxes from './Checkboxes.vue';
import multiSelect from './MultiSelect.vue';
import radio from './Radio.vue';
import time from './Time.vue';
import date from './Date.vue';
import dateRange from './DateRange.vue';
import timeRange from './TimeRange.vue';
import slider from './Slider.vue';
import color from './Color.vue';
import upload from './Upload.vue';

const { TextArea } = Input;

const FrNumber = ({ style, value, ...rest }) =>
  h(InputNumber, {
    style: { width: '100%', ...style },
    value: typeof value === 'number' ? value : undefined,
    ...rest,
  });

const FrTextArea = ({ autoSize, ...rest }) => h(TextArea, { autoSize: autoSize ? autoSize : { minRows: 3 }, ...rest });

const FrTreeSelect = ({ style, ...rest }) => h(TreeSelect, { style: { width: '100%', ...style }, ...rest });

const FrCascader = ({ style, ...rest }) => h(Cascader, { style: { width: '100%', ...style }, ...rest });

export const widgets = {
  input: Input,
  checkbox: Checkbox,
  checkboxes, // checkbox多选
  color,
  date,
  time,
  dateRange,
  timeRange,
  imageInput: ImageInput,
  url: urlInput,
  list,
  map,
  table: list,
  multiSelect, // 下拉多选
  number: FrNumber,
  radio,
  select,
  slider, // 带滚条的number
  switch: Switch,
  textarea: FrTextArea,
  upload,
  html: Html,
  rate: Rate,
  treeSelect: FrTreeSelect,
  cascader: FrCascader,
};

export const defaultWidgetNameList = Object.keys(widgets);
