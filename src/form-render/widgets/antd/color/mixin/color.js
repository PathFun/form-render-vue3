import tinyColor from 'tinycolor2';

function _colorChange(data, oldHue) {
  let alpha = data && data.a;
  let color;

  // hsl is better than hex between conversions
  if (data && data.hsl) {
    color = tinyColor(data.hsl);
  } else if (data && data.hex && data.hex.length > 0) {
    color = tinyColor(data.hex);
  } else if (data && data.hsv) {
    color = tinyColor(data.hsv);
  } else if (data && data.rgba) {
    color = tinyColor(data.rgba);
  } else if (data && data.rgb) {
    color = tinyColor(data.rgb);
  } else {
    color = tinyColor(data);
  }

  if (color && (color._a === undefined || color._a === null)) {
    color.setAlpha(alpha || 1);
  }

  let hsl = color.toHsl();
  let hsv = color.toHsv();

  if (hsl.s === 0) {
    hsv.h = hsl.h = data.h || (data.hsl && data.hsl.h) || oldHue || 0;
  }

  return {
    hsl: hsl,
    hex: color.toHexString().toUpperCase(),
    hex8: color.toHex8String().toUpperCase(),
    rgba: color.toRgb(),
    hsv: hsv,
    oldHue: data.h || oldHue || hsl.h,
    source: data.source,
    a: data.a || color.getAlpha(),
  };
}

export default {
  props: ['value'],
  data() {
    return {
      colors: _colorChange(this.value),
    };
  },
  watch: {
    colors(newVal) {
      this.$emit('change', newVal);
    },
  },
  methods: {
    colorChange(data, oldHue) {
      this.oldHue = this.colors.hsl.h;
      this.colors = _colorChange(data, oldHue || this.oldHue);
    },
    isValidHex(hex) {
      return tinyColor(hex).isValid();
    },
    simpleCheckForValidColor(data) {
      const keysToCheck = ['r', 'g', 'b', 'a', 'h', 's', 'l', 'v'];
      let checked = 0;
      let passed = 0;

      for (let i = 0; i < keysToCheck.length; i++) {
        const letter = keysToCheck[i];
        if (data[letter]) {
          checked++;
          if (!isNaN(data[letter])) {
            passed++;
          }
        }
      }

      if (checked === passed) {
        return data;
      }
    },
    paletteUpperCase(palette) {
      return palette.map(c => c.toUpperCase());
    },
    isTransparent(color) {
      return tinyColor(color).getAlpha() === 0;
    },
  },
};
