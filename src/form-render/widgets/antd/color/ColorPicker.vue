<template>
  <div
    role="application"
    aria-label="Chrome color picker"
    :class="['vc-chrome', disableAlpha ? 'vc-chrome__disable-alpha' : '']"
  >
    <div class="vc-chrome-saturation-wrap">
      <saturation :value="colors" @change="childChange"></saturation>
    </div>
    <div class="vc-chrome-body">
      <div class="vc-chrome-controls">
        <div class="vc-chrome-color-wrap">
          <div
            :aria-label="`current color is ${colors.hex}`"
            class="vc-chrome-active-color"
            :style="{ background: activeColor }"
          ></div>
          <check-board v-if="!disableAlpha" />
        </div>

        <div class="vc-chrome-sliders">
          <div class="vc-chrome-hue-wrap">
            <hue :value="colors" @change="childChange"></hue>
          </div>
          <div v-if="!disableAlpha" class="vc-chrome-alpha-wrap">
            <alpha :value="colors" @change="childChange"></alpha>
          </div>
        </div>
      </div>

      <div v-if="!disableFields" class="vc-chrome-fields-wrap">
        <div v-show="fieldsIndex === 0" class="vc-chrome-fields">
          <!-- hex -->
          <div class="vc-chrome-field">
            <ed-in v-if="!hasAlpha" label="hex" :value="colors.hex" @change="inputChange"></ed-in>
            <ed-in v-else label="hex" :value="colors.hex8" @change="inputChange"></ed-in>
          </div>
        </div>
        <div v-show="fieldsIndex === 1" class="vc-chrome-fields">
          <!-- rgba -->
          <div class="vc-chrome-field">
            <ed-in label="r" :value="colors.rgba.r" @change="inputChange"></ed-in>
          </div>
          <div class="vc-chrome-field">
            <ed-in label="g" :value="colors.rgba.g" @change="inputChange"></ed-in>
          </div>
          <div class="vc-chrome-field">
            <ed-in label="b" :value="colors.rgba.b" @change="inputChange"></ed-in>
          </div>
          <div v-if="!disableAlpha" class="vc-chrome-field">
            <ed-in label="a" :value="colors.a" :arrow-offset="0.01" :max="1" @change="inputChange"></ed-in>
          </div>
        </div>
        <div v-show="fieldsIndex === 2" class="vc-chrome-fields">
          <!-- hsla -->
          <div class="vc-chrome-field">
            <ed-in label="h" :value="hsl.h" @change="inputChange"></ed-in>
          </div>
          <div class="vc-chrome-field">
            <ed-in label="s" :value="hsl.s" @change="inputChange"></ed-in>
          </div>
          <div class="vc-chrome-field">
            <ed-in label="l" :value="hsl.l" @change="inputChange"></ed-in>
          </div>
          <div v-if="!disableAlpha" class="vc-chrome-field">
            <ed-in label="a" :value="colors.a" :arrow-offset="0.01" :max="1" @change="inputChange"></ed-in>
          </div>
        </div>
        <!-- btn -->
        <div
          class="vc-chrome-toggle-btn"
          role="button"
          aria-label="Change another color definition"
          @click="toggleViews"
        >
          <div class="vc-chrome-toggle-icon">
            <svg
              style="width: 24px; height: 24px"
              viewBox="0 0 24 24"
              @mouseover="showHighlight"
              @mouseenter="showHighlight"
              @mouseout="hideHighlight"
            >
              <path
                fill="#333"
                d="M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z"
              />
            </svg>
          </div>
          <div v-show="highlight" class="vc-chrome-toggle-icon-highlight"></div>
        </div>
        <!-- btn -->
      </div>
    </div>
  </div>
</template>

<script>
import colorMixin from './mixin/color';
import editableInput from './common/EditableInput.vue';
import saturation from './common/Saturation.vue';
import hue from './common/Hue.vue';
import alpha from './common/Alpha.vue';
import CheckBoard from './common/CheckBoard.vue';

export default {
  name: 'ColorPicker',
  components: {
    saturation,
    hue,
    alpha,
    'ed-in': editableInput,
    CheckBoard,
  },
  mixins: [colorMixin],
  props: {
    disableAlpha: {
      type: Boolean,
      default: false,
    },
    disableFields: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: 'hex',
    },
  },
  data() {
    return {
      fieldsIndex: 0,
      highlight: false,
    };
  },
  computed: {
    hsl() {
      const { h, s, l } = this.colors.hsl;
      return {
        h: h.toFixed(),
        s: `${(s * 100).toFixed()}%`,
        l: `${(l * 100).toFixed()}%`,
      };
    },
    activeColor() {
      const rgba = this.colors.rgba;
      return 'rgba(' + [rgba.r, rgba.g, rgba.b, rgba.a].join(',') + ')';
    },
    hasAlpha() {
      return this.colors.a < 1;
    },
  },
  mounted() {
    const modeToIndex = {
      hex: 0,
      rgba: 1,
      hsla: 2,
    };
    this.fieldsIndex = modeToIndex[this.mode];
  },
  methods: {
    childChange(data) {
      this.colorChange(data);
    },
    inputChange(data) {
      if (!data) {
        return;
      }
      if (data.hex) {
        this.isValidHex(data.hex) &&
          this.colorChange({
            hex: data.hex,
            source: 'hex',
          });
      } else if (data.r || data.g || data.b || data.a) {
        this.colorChange({
          r: data.r || this.colors.rgba.r,
          g: data.g || this.colors.rgba.g,
          b: data.b || this.colors.rgba.b,
          a: data.a || this.colors.rgba.a,
          source: 'rgba',
        });
      } else if (data.h || data.s || data.l) {
        const s = data.s ? data.s.replace('%', '') / 100 : this.colors.hsl.s;
        const l = data.l ? data.l.replace('%', '') / 100 : this.colors.hsl.l;

        this.colorChange({
          h: data.h || this.colors.hsl.h,
          s,
          l,
          source: 'hsl',
        });
      }
    },
    toggleViews() {
      if (this.fieldsIndex >= 2) {
        this.fieldsIndex = 0;
        return;
      }
      this.fieldsIndex++;
    },
    showHighlight() {
      this.highlight = true;
    },
    hideHighlight() {
      this.highlight = false;
    },
  },
};
</script>

<style>
.vc-chrome {
  box-sizing: initial;
  width: 225px;
  font-family: Menlo, serif;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 0 2px rgb(0 0 0 / 30%), 0 4px 8px rgb(0 0 0 / 30%);
}

.vc-chrome-controls {
  display: flex;
}

.vc-chrome-color-wrap {
  position: relative;
  width: 36px;
}

.vc-chrome-active-color {
  position: relative;
  z-index: 1;
  width: 30px;
  height: 30px;
  overflow: hidden;
  border-radius: 15px;
}

.vc-chrome-color-wrap .vc-checkerboard {
  width: 30px;
  height: 30px;
  background-size: auto;
  border-radius: 15px;
}

.vc-chrome-sliders {
  flex: 1;
}

.vc-chrome-fields-wrap {
  display: flex;
  padding-top: 16px;
}

.vc-chrome-fields {
  display: flex;
  flex: 1;
  margin-left: -6px;
}

.vc-chrome-field {
  width: 100%;
  padding-left: 6px;
}

.vc-chrome-toggle-btn {
  position: relative;
  width: 32px;
  text-align: right;
}

.vc-chrome-toggle-icon {
  position: relative;
  z-index: 2;
  margin-top: 12px;
  margin-right: -4px;
  cursor: pointer;
}

.vc-chrome-toggle-icon-highlight {
  position: absolute;
  top: 10px;
  left: 12px;
  width: 24px;
  height: 28px;
  background: #eee;
  border-radius: 4px;
}

.vc-chrome-hue-wrap {
  position: relative;
  height: 10px;
  margin-bottom: 8px;
}

.vc-chrome-alpha-wrap {
  position: relative;
  height: 10px;
}

.vc-chrome-hue-wrap .vc-hue {
  border-radius: 2px;
}

.vc-chrome-alpha-wrap .vc-alpha-gradient {
  border-radius: 2px;
}

.vc-chrome-hue-wrap .vc-hue-picker,
.vc-chrome-alpha-wrap .vc-alpha-picker {
  width: 12px;
  height: 12px;
  background-color: rgb(248 248 248);
  border-radius: 6px;
  box-shadow: 0 1px 4px 0 rgb(0 0 0 / 37%);
  transform: translate(-6px, -2px);
}

.vc-chrome-body {
  padding: 16px 16px 12px;
  background-color: #fff;
}

.vc-chrome-saturation-wrap {
  position: relative;
  width: 100%;
  padding-bottom: 55%;
  overflow: hidden;
  border-radius: 2px 2px 0 0;
}

.vc-chrome-saturation-wrap .vc-saturation-circle {
  width: 12px;
  height: 12px;
}

.vc-chrome-fields .vc-input__input {
  width: 100%;
  height: 21px;
  color: #333;
  font-size: 11px;
  text-align: center;
  border: none;
  border-radius: 2px;
  box-shadow: inset 0 0 0 1px #dadada;
}

.vc-chrome-fields .vc-input__label {
  display: block;
  margin-top: 12px;
  color: #969696;
  font-size: 11px;
  line-height: 11px;
  text-align: center;
  text-transform: uppercase;
}

.vc-chrome__disable-alpha .vc-chrome-active-color {
  width: 18px;
  height: 18px;
}

.vc-chrome__disable-alpha .vc-chrome-color-wrap {
  width: 30px;
}

.vc-chrome__disable-alpha .vc-chrome-hue-wrap {
  margin-top: 4px;
  margin-bottom: 4px;
}
</style>
