import { usePropsStore } from '../../hooks';
import './Extra.less';
import { FlattenSchema } from '../../FRType';
const Extra = ({ schema }: { schema: FlattenSchema }) => {
  const { extra } = schema;
  const { widgets } = usePropsStore().value;

  if (!extra) return null;

  if (typeof extra === 'object' && extra.widget) {
    const widgetName = extra.widget;
    const Widget = widgets ? widgets[widgetName] : null;
    if (Widget) return <Widget schema={schema} />;
  }

  let __html = '';
  if (typeof extra === 'string') {
    __html = extra;
  }
  // 内部BU使用的口子，这个api不对外，也没有必要
  if (typeof extra === 'object' && extra.text) {
    __html = extra.text;
  }
  return (__html && <div class="fr-form-item-extra" innerHTML={__html} />) || <></>;
};

export default Extra;
