<template>
  <div :class="['vc-hue', directionClass]">
    <div
      ref="container"
      class="vc-hue-container"
      role="slider"
      :aria-valuenow="colors.hsl.h"
      aria-valuemin="0"
      aria-valuemax="360"
      @mousedown="handleMouseDown"
      @touchmove="handleChange"
      @touchstart="handleChange"
    >
      <div class="vc-hue-pointer" :style="{ top: pointerTop, left: pointerLeft }" role="presentation">
        <div class="vc-hue-picker"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Hue',
  props: {
    value: Object,
    direction: {
      type: String,
      // [horizontal | vertical]
      default: 'horizontal',
    },
  },
  data() {
    return {
      oldHue: 0,
      pullDirection: '',
    };
  },
  computed: {
    colors() {
      const h = this.value.hsl.h;
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      if (h !== 0 && h - this.oldHue > 0) this.pullDirection = 'right';
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      if (h !== 0 && h - this.oldHue < 0) this.pullDirection = 'left';
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.oldHue = h;

      return this.value;
    },
    directionClass() {
      return {
        'vc-hue--horizontal': this.direction === 'horizontal',
        'vc-hue--vertical': this.direction === 'vertical',
      };
    },
    pointerTop() {
      if (this.direction === 'vertical') {
        if (this.colors.hsl.h === 0 && this.pullDirection === 'right') return 0;
        return -((this.colors.hsl.h * 100) / 360) + 100 + '%';
      } else {
        return 0;
      }
    },
    pointerLeft() {
      if (this.direction === 'vertical') {
        return 0;
      } else {
        if (this.colors.hsl.h === 0 && this.pullDirection === 'right') return '100%';
        return (this.colors.hsl.h * 100) / 360 + '%';
      }
    },
  },
  methods: {
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
      var left = pageX - xOffset;
      var top = pageY - yOffset;

      var h;
      var percent;

      if (this.direction === 'vertical') {
        if (top < 0) {
          h = 360;
        } else if (top > containerHeight) {
          h = 0;
        } else {
          percent = -((top * 100) / containerHeight) + 100;
          h = (360 * percent) / 100;
        }

        if (this.colors.hsl.h !== h) {
          this.$emit('change', {
            h: h,
            s: this.colors.hsl.s,
            l: this.colors.hsl.l,
            a: this.colors.hsl.a,
            source: 'hsl',
          });
        }
      } else {
        if (left < 0) {
          h = 0;
        } else if (left > containerWidth) {
          h = 360;
        } else {
          percent = (left * 100) / containerWidth;
          h = (360 * percent) / 100;
        }

        if (this.colors.hsl.h !== h) {
          this.$emit('change', {
            h: h,
            s: this.colors.hsl.s,
            l: this.colors.hsl.l,
            a: this.colors.hsl.a,
            source: 'hsl',
          });
        }
      }
    },
    handleMouseDown(e) {
      this.handleChange(e, true);
      window.addEventListener('mousemove', this.handleChange);
      window.addEventListener('mouseup', this.handleMouseUp);
    },
    handleMouseUp() {
      this.unbindEventListeners();
    },
    unbindEventListeners() {
      window.removeEventListener('mousemove', this.handleChange);
      window.removeEventListener('mouseup', this.handleMouseUp);
    },
  },
};
</script>

<style>
.vc-hue {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 2px;
}

.vc-hue--horizontal {
  background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
}

.vc-hue--vertical {
  background: linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
}

.vc-hue-container {
  position: relative;
  height: 100%;
  margin: 0 2px;
  cursor: pointer;
}

.vc-hue-pointer {
  position: absolute;
  z-index: 2;
}

.vc-hue-picker {
  width: 4px;
  height: 8px;
  margin-top: 1px;
  background: #fff;
  border-radius: 1px;
  box-shadow: 0 0 2px rgb(0 0 0 / 60%);
  transform: translateX(-2px);
  cursor: pointer;
}
</style>
