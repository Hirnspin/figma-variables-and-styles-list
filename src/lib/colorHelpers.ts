import { colord } from "colord";

export function colordFigmaColor(color: string | RGB | RGBA | WidgetJSX.Color, opacity?: number) {
  if (typeof color === "string") {
    return colord(color);
  }

  let r = Math.round(color.r * 255);
  let g = Math.round(color.g * 255);
  let b = Math.round(color.b * 255);
  let a = 1;

  if ((color as RGBA).a) {
    a = (color as RGBA).a;
  }

  if (opacity) {
    a = opacity;
  }

  return colord({ r, g, b, a });
}

/// Source: https://css-tricks.com/converting-color-spaces-in-javascript/

export function colorToRgbaString(color: string | RGB | RGBA | WidgetJSX.Color, forceRgb = false): string {
  if (typeof (color) === "string") {
    return color;
  } else {
    if ((color as RGBA).a && (color as RGBA).a !== 1) {
      return `rgba(${[color.r, color.g, color.b]
        .map((n) => Math.round(n * 255))
        .join(", ")}, ${(color as RGBA).a.toFixed(4).replace(/(\.0+|0+)$/, "")})`;
    } else if ((color as RGBA).a === 1 || forceRgb) {
      return `rgb(${[color.r, color.g, color.b]
        .map((n) => Math.round(n * 255))
        .join(", ")})`;
    }
  }

  return '';
}

export function HSLToRGB(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2,
    r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return "rgb(" + r + "," + g + "," + b + ")";
}

export function colorToHslaString(color: RGB | RGBA | WidgetJSX.Color) {
  let r = color.r / 255;
  let g = color.g / 255;
  let b = color.b / 255;
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  if ((color as RGBA).a && (color as RGBA).a !== 1) {
    return `hsla(${h},${s}%,${l}%,${(color as RGBA).a})`;
  } else {
    return `hsl(${h},${s}%,${l}%)`;
  }
}

export function toHex(value: number) {
  const hex = value.toString(16);
  return hex.length === 1 ? "FF" + hex : hex;
}

export function rgbaStringToHexa(color: RGB | RGBA | WidgetJSX.Color, forceRemoveAlpha = false) {
  let alpha = '';

  if (typeof (color as RGBA).a !== "undefined" && (color as RGBA).a < 1 && !forceRemoveAlpha) {
    alpha = Math.round((color as RGBA).a * 255).toString(16);
    alpha = alpha.length === 1 ? "FF" + alpha : alpha;
  }

  let red = Math.round(color.r * 255).toString(16);
  let green = Math.round(color.g * 255).toString(16);
  let blue = Math.round(color.b * 255).toString(16);

  const hex = `#${red}${green}${blue}${alpha}`;

  return hex;
}

export function colorToHexString(color: RGB | RGBA | WidgetJSX.Color, opacity?: number) {
  const hex = [toHex(color.r), toHex(color.g), toHex(color.b)].join("");

  if (opacity || (color as RGBA).a) {
    opacity = opacity || (color as RGBA).a;

    if (opacity < 1) {
      return `#${hex}${toHex(opacity)}`;
    }
  }

  //console.log(color, hex);
  return `#${hex}`;
}

export function getPerceptualBrightness(hexColor: string): number {
  var r = parseInt(hexColor.substring(0, 2), 16);
  var g = parseInt(hexColor.substring(2, 4), 16);
  var b = parseInt(hexColor.substring(4, 6), 16);

  return r * 2 + g * 3 + b;
}

export function isColorBrighter(color1: string, color2: string): boolean {
  return color1 > color2;
}
export function invertHexColor(color: string, useBlackWhite: boolean = true) {
  if (color.indexOf('#') === 0) {
    color = color.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (color.length === 3) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }

  let r = parseInt(color.slice(0, 2), 16),
    g = parseInt(color.slice(2, 4), 16),
    b = parseInt(color.slice(4, 6), 16);
  if (useBlackWhite) {
    // https://stackoverflow.com/a/3943023/112731
    return (r * 0.299 + g * 0.587 + b * 0.114) > 186
      ? '#000000'
      : '#FFFFFF';
  }
  // invert color components
  const red = (255 - r).toString(16);
  const green = (255 - g).toString(16);
  const blue = (255 - b).toString(16);
  // pad each with zeros and return
  return "#" + padZero(red) + padZero(green) + padZero(blue);
}

function padZero(str: string, len: number = 2) {
  const zeros = new Array(len).join('0');
  return (zeros + str).slice(-len);
}

export function getColorList(color: RGB | RGBA) {
  return `Hexadecimal: ${colorToHexString(color)}\n
  RGB(A): ${colorToRgbaString(color)}\n
  HSL(A): ${colorToHslaString(color)}`;
}

export function colorMapper(paints: readonly Paint[]): WidgetJSX.SolidPaint[] {
  let solidPaintList: WidgetJSX.SolidPaint[] = [];
  paints
    .filter((p) => p.type === "SOLID")
    .forEach((pp) =>
      solidPaintList.push({
        type: "solid",
        color: {
          r: (pp as SolidPaint).color.r,
          g: (pp as SolidPaint).color.g,
          b: (pp as SolidPaint).color.b,
          a: pp.opacity as number,
        },
      }),
    );
  return solidPaintList as WidgetJSX.SolidPaint[];
}

export const collectionColorPalette = [
  "#A4AAFF",
  "#ff5e57",
  "#ffc048",
  "#2FF3E0",
  "#F51720",
  "#ffdd59",
  "#36EEE0",
  "#0be881",
  "#f53b57",
  "#05c46b",
  "#ffa801",
  "#0fbcf9",
  "#FA26A0",
  "#00d8d6",
  "#ff3f34",
  "#BCECE0",
];

export const getColorByMode = (
  colorName:
    | "background-fill"
    | "text-fill"
    | "text2-fill"
    | "text3-fill"
    | "stroke"
    | "button-background-fill"
    | "button-text-fill"
    | "button-background-fill-hover"
    | "code-fill"
    | "code-text-fill"
    | "color-pot-fill"
    | "color-pot-text-fill",
  useDarkMode: boolean = false,
) => {
  if (useDarkMode) {
    switch (colorName) {
      case "background-fill":
        return "#2c2c2c";
      case "text-fill":
        return "#ffffff";
      case "text2-fill":
        return "#eeeeee";
      case "text3-fill":
        return "#999999";
      case "stroke":
        return "#383838";
      case "button-background-fill":
        return "#ffffff";
      case "button-background-fill-hover":
        return "#666666";
      case "button-text-fill":
        return "#2c2c2c";
      case "code-fill":
        return "#1a1a1a";
      case "code-text-fill":
        return "#f72585";
      case "color-pot-fill":
        return "#444444";
      case "color-pot-text-fill":
        return "#ffffff";
      default:
        return "#ffffff";
    }
  } else {
    switch (colorName) {
      case "background-fill":
        return "#ffffff";
      case "text-fill":
        return "#333333";
      case "text2-fill":
        return "#808080";
      case "text3-fill":
        return "#666666";
      case "stroke":
        return "#e5e5e5";
      case "button-background-fill":
        return "#2c2c2c";
      case "button-background-fill-hover":
        return "#000000";
      case "button-text-fill":
        return "#ffffff";
      case "code-fill":
        return "#ededed";
      case "code-text-fill":
        return "#f72585";
      case "color-pot-fill":
        return "#ffffff";
      case "color-pot-text-fill":
        return "#000000";
      default:
        return "#ffffff";
    }
  }
};
