<template>
  <div
    ref="container"
    class="vc-saturation"
    :style="{ background: bgColor }"
    @mousedown="handleMouseDown"
    @touchmove="handleChange"
    @touchstart="handleChange"
  >
    <div class="vc-saturation--white"></div>
    <div class="vc-saturation--black"></div>
    <div class="vc-saturation-pointer" :style="{ top: pointerTop, left: pointerLeft }">
      <div class="vc-saturation-circle"></div>
    </div>
  </div>
</template>

<script>
import { throttle } from 'lodash-es';
function clamp(value, min, max) {
  return min < max ? (value < min ? min : value > max ? max : value) : value < max ? max : value > min ? min : value;
}
export default {
  name: 'Saturation',
  props: {
    value: Object,
  },
  computed: {
    colors() {
      return this.value;
    },
    bgColor() {
      return `hsl(${this.colors.hsv.h}, 100%, 50%)`;
    },
    pointerTop() {
      return -(this.colors.hsv.v * 100) + 1 + 100 + '%';
    },
    pointerLeft() {
      return this.colors.hsv.s * 100 + '%';
    },
  },
  methods: {
    throttle: throttle(
      (fn, data) => {
        fn(data);
      },
      20,
      {
        leading: true,
        trailing: false,
      }
    ),
    handleChange(e, skip) {
      !skip && e.preventDefault();
      var container = this.$refs.container;
      if (!container) {
        // for some edge cases, container may not exist. see #220
        return;
      }
      var containerWidth = container.clientWidth;
      var containerHeight = container.clientHeight;

      var xOffset = container.getBoundingClientRect().left + window.pageXOffset;
      var yOffset = container.getBoundingClientRect().top + window.pageYOffset;
      var pageX = e.pageX || (e.touches ? e.touches[0].pageX : 0);
      var pageY = e.pageY || (e.touches ? e.touches[0].pageY : 0);
      var left = clamp(pageX - xOffset, 0, containerWidth);
      var top = clamp(pageY - yOffset, 0, containerHeight);
      var saturation = left / containerWidth;
      var bright = clamp(-(top / containerHeight) + 1, 0, 1);

      this.throttle(this.onChange, {
        h: this.colors.hsv.h,
        s: saturation,
        v: bright,
        a: this.colors.hsv.a,
        source: 'hsva',
      });
    },
    onChange(param) {
      this.$emit('change', param);
    },
    handleMouseDown() {
      // this.handleChange(e, true)
      window.addEventListener('mousemove', this.handleChange);
      window.addEventListener('mouseup', this.handleChange);
      window.addEventListener('mouseup', this.handleMouseUp);
    },
    handleMouseUp() {
      this.unbindEventListeners();
    },
    unbindEventListeners() {
      window.removeEventListener('mousemove', this.handleChange);
      window.removeEventListener('mouseup', this.handleChange);
      window.removeEventListener('mouseup', this.handleMouseUp);
    },
  },
};
</script>

<style>
.vc-saturation,
.vc-saturation--white,
.vc-saturation--black {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  cursor: pointer;
}

.vc-saturation--white {
  background: linear-gradient(to right, #fff, rgb(255 255 255 / 0%));
}

.vc-saturation--black {
  background: linear-gradient(to top, #000, rgb(0 0 0 / 0%));
}

.vc-saturation-pointer {
  position: absolute;
  cursor: pointer;
}

.vc-saturation-circle {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  box-shadow: 0 0 0 1.5px #fff, inset 0 0 1px 1px rgb(0 0 0 / 30%), 0 0 1px 2px rgb(0 0 0 / 40%);
  transform: translate(-2px, -2px);
  cursor: pointer;
}
</style>
