export type { FRProps, ComponentProps, RenderListProps as LayoutProps } from './FRType';
export { widgets as defaultWidget } from './widgets/antd';
export { default as useForm } from './useForm';
export { mapping as defaultMapping } from './mapping';
import { withInstall } from './_util/type';
import './index.less';
import './atom.less';
import FR from './FR.vue';
export default withInstall(FR);
