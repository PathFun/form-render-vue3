import { getValueByPath } from '../_util';
import { computed, watch, defineComponent } from 'vue';
import { watcherProps } from './type';
import { WatcherInstance } from '../FRType';

const runWatcher = (watchObj: WatcherInstance, watchKey: string, watchValue: any) => {
  if (typeof watchObj === 'function') {
    try {
      watchObj(watchValue);
    } catch (error) {
      console.log(`${watchKey}对应的watch函数执行报错：`, error);
    }
  } else if (watchObj && typeof watchObj.handler === 'function') {
    try {
      watchObj.handler(watchValue);
    } catch (error) {
      console.log(`${watchKey}对应的watch函数执行报错：`, error);
    }
  }
};

const Watcher = defineComponent({
  props: watcherProps(),
  setup(props) {
    let reloadFlag = false;
    const value = computed(() => getValueByPath(props.formData, props.watchKey));
    watch([value, () => props.reload], ([newValue, reload]) => {
      const { watchItem } = props;
      if (reload) {
        reloadFlag = true;
      } else {
        if (reloadFlag) {
          reloadFlag = false;
          const immediate = watchItem && typeof watchItem !== 'function' && watchItem.immediate;
          if (immediate) {
            runWatcher(watchItem, props.watchKey, newValue);
          }
        } else {
          runWatcher(watchItem, props.watchKey, newValue);
        }
      }
    });
  },
});

export default Watcher;
