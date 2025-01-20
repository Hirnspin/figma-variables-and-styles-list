import { alphaBlend } from "apca-w3";

namespace Color {
  export function colorMapper(
    paints: readonly Paint[],
  ): WidgetJSX.SolidPaint[] {
    let solidPaintList: WidgetJSX.SolidPaint[] = [];
    paints
      .filter((p) => p.type === "SOLID")
      .forEach((pp) => {
        solidPaintList.push({
          type: "solid",
          color: {
            r: Math.round((pp as SolidPaint).color.r * 255),
            g: Math.round((pp as SolidPaint).color.g * 255),
            b: Math.round((pp as SolidPaint).color.b * 255),
            a: Math.round(pp.opacity as number * 255),
          },
        });
      });

    return solidPaintList as WidgetJSX.SolidPaint[];
  }

  export function joinPluginSolidPaints(paints: Array<SolidPaint>): SolidPaint {
    let solidPaint: SolidPaint = paints[0];

    for (let index = 1; index < paints.length; index++) {
      const paint = paints[index];
      solidPaint = figma.util.solidPaint(solidPaint.color, paint);
    }

    return solidPaint;
  }

  export function joinSolidPaints(
    paints: Array<WidgetJSX.SolidPaint>,
  ): RGB | WidgetJSX.Color | undefined {
    let calculatedColor: RGB | RGBA | undefined;

    paints
      .filter((p) => p.type === "solid")
      .forEach((paint) => {
        if (!calculatedColor && (paint.color as WidgetJSX.Color).a) {
          calculatedColor = { r: 255, g: 255, b: 255 };
        } else if (!calculatedColor) {
          calculatedColor = paint.color as WidgetJSX.Color;
        } else {
          const colorBlend = alphaBlend(
            [
              Math.round((paint.color as WidgetJSX.Color).r * 255),
              Math.round((paint.color as WidgetJSX.Color).g * 255),
              Math.round((paint.color as WidgetJSX.Color).b * 255),
              Math.round((paint.color as WidgetJSX.Color).a * 255),
            ],
            [calculatedColor.r, calculatedColor.g, calculatedColor.b],
          );
          calculatedColor = {
            r: colorBlend[0],
            g: colorBlend[1],
            b: colorBlend[2],
          };
        }
      });

    return calculatedColor;
  }

  export function toHex(value: number) {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }

  export function colorToHexString(color: RGB | RGBA) {
    if (color) {
      const hex = [toHex(color.r), toHex(color.g), toHex(color.b)].join("");
      return `#${hex}${(color as RGBA).a && (color as RGBA).a !== 1
        ? toHex((color as RGBA).a)
        : ""
        }`;
    } else {
      return "NaN";
    }
  }

  export function colorToRgbaString(color: RGB | RGBA) {
    if (color) {
      if (Object.hasOwn(color, "a")) {
        return `rgba${color.r}, ${color.g}, ${color.b}, ${(color as RGBA).a}`;
      } else {
        return `rgb${color.r}, ${color.g}, ${color.b}`;
      }
    } else {
      return "NaN";
    }
  }
}

export enum ColorType {
  HEX = "Hexadecimal", RBGA = "RGB(A)", HSLA = "HSL(A)"
}

export function getEnumKeys<T extends string, ColorType extends string | number>(enumVariable: { [key in T]: ColorType }) {
  return Object.keys(enumVariable) as Array<T>;
}

export default Color;
