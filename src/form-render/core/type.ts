import { PropType } from 'vue';
import { WatchProperties, WatcherInstance } from '../FRType';
export const watcherProps = () => ({
  watchKey: {
    type: String,
    default: '',
    required: true,
  },
  watchMap: {
    type: Object as PropType<WatchProperties>,
    default: () => ({}),
  },
  watchItem: {
    type: Object as PropType<WatcherInstance>,
    default: () => ({}),
  },
  reload: {
    type: Boolean,
    default: false,
  },
  formData: {
    type: Object,
    default: () => ({}),
  },
});
