import type { App, Plugin } from 'vue';
import AsyncWrapper from './components/AsyncWrapper.vue';
import './index.less';
AsyncWrapper.install = (app: App): App => {
  app.component(AsyncWrapper.name, AsyncWrapper);
  return app;
};

export default AsyncWrapper as typeof AsyncWrapper & Plugin;
