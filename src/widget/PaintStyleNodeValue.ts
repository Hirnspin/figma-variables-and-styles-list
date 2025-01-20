import Color from "@lib/Color";

export interface IPaintStyleNodeValue {
  style: PaintStyle
  groupName: string
  name: string
  readonly publishStatus?: PublishStatus
  readonly widgetPaints: WidgetJSX.Paint[]
}

export interface IPaintStyleNodeValueArgs {
  style: PaintStyle,
}

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  if (value === null || value === undefined) return false;
  return true;
}

function mapGradientTransform(
  gradientTransform: Transform,
): [WidgetJSX.Vector, WidgetJSX.Vector, WidgetJSX.Vector] {
  return [
    { x: gradientTransform[0][0], y: gradientTransform[1][0] },
    { x: gradientTransform[0][1], y: gradientTransform[1][1] },
    { x: gradientTransform[0][2], y: gradientTransform[1][2] },
  ];
}

function mapPluginBlendModeToWidgetBlendMode(
  blendMode: BlendMode | undefined,
) {
  return blendMode
    ? (blendMode.toLowerCase().replace("_", "-") as WidgetJSX.BlendMode)
    : undefined;
}

async function getImagePaintAsync(
  imagePaint: ImagePaint,
): Promise<WidgetJSX.ImagePaint | null> {
  if (imagePaint.imageHash) {
    const img = figma.getImageByHash(imagePaint.imageHash);

    if (img) {
      const bytesPromise = img.getBytesAsync();
      const sizePromise = img.getSizeAsync();

      return await Promise.all([bytesPromise, sizePromise]).then((result) => {
        const bytes = result[0];
        const size = result[1];
        const _imagePaint: WidgetJSX.ImagePaint = {
          type: "image",
          blendMode: mapPluginBlendModeToWidgetBlendMode(imagePaint.blendMode),
          src: `data:image/png;base64,${figma.base64Encode(bytes)}`,
          imageSize: size,
          imageTransform: imagePaint.imageTransform,
          opacity: imagePaint.opacity,
          rotation: imagePaint.rotation,
          scaleMode: imagePaint.scaleMode.toLowerCase() as WidgetJSX.ScaleMode,
        };

        return _imagePaint;
      });
    }
  }

  return null;
}

async function mapPluginPaintsToWidgetPaintsAsync(
  paints: ReadonlyArray<Paint>,
): Promise<WidgetJSX.Paint[]> {
  let _paints: Array<WidgetJSX.Paint> = [];
  const promises: Promise<WidgetJSX.ImagePaint | null>[] = [];

  paints.forEach((paint, index) => {
    switch (paint.type) {
      case "GRADIENT_LINEAR":
      case "GRADIENT_RADIAL":
      case "GRADIENT_ANGULAR":
      case "GRADIENT_DIAMOND":
        const _gradientPaint: WidgetJSX.GradientPaint = {
          type: paint.type.toLowerCase().replace("_", "-") as
            | "gradient-linear"
            | "gradient-radial"
            | "gradient-angular"
            | "gradient-diamond",
          gradientHandlePositions: mapGradientTransform(
            paint.gradientTransform,
          ),
          gradientStops: paint.gradientStops.map<WidgetJSX.ColorStop>(
            (x) => ({
              color: {
                r: x.color.r,
                g: x.color.g,
                b: x.color.b,
                a: x.color.a,
              },
              position: x.position,
            }),
          ),
          opacity: paint.opacity,
          blendMode: mapPluginBlendModeToWidgetBlendMode(paint.blendMode),
          visible: paint.visible,
        };
        _paints.push(_gradientPaint);
        break;
      case "IMAGE":
        // TODO: Memory leak?
        //promises.push(getImagePaintAsync(paint));
        break;
      case "SOLID":
      default:
        const _solidPaint: WidgetJSX.SolidPaint = {
          type: "solid",
          color: {
            r: (paint as SolidPaint).color.r,
            g: (paint as SolidPaint).color.g,
            b: (paint as SolidPaint).color.b,
            a: paint.opacity as number,
          },
        };
        _paints.push(_solidPaint);
        break;
    }
  });

  return await Promise.all(promises).then((results) => {
    const _imagePaints = results.filter(notEmpty);

    _paints = _paints.concat(_imagePaints);

    return _paints;
  });
}

export class PaintStyleNodeValue implements IPaintStyleNodeValue {
  public style: PaintStyle;
  public publishStatus?: PublishStatus;
  public widgetPaints: WidgetJSX.Paint[];
  public groupName: string;
  public name: string;

  constructor(args: IPaintStyleNodeValueArgs) {
    this.style = args.style;
    this.widgetPaints = [];
    this.groupName = args.style.name.substring(0, args.style.name.lastIndexOf("/"));
    this.name = args.style.name.substring(args.style.name.lastIndexOf("/") + 1, args.style.name.length);
  }

  static async buildAsync(args: IPaintStyleNodeValueArgs) {
    const node = new PaintStyleNodeValue(args);
    const publishStatusPromise = node.style.getPublishStatusAsync();
    const widgetPaints = mapPluginPaintsToWidgetPaintsAsync(node.style.paints);

    await Promise.all([publishStatusPromise, widgetPaints]).then((result) => {
      node.publishStatus = result[0];
      node.widgetPaints = result[1];
    });

    return node;
  }
}
