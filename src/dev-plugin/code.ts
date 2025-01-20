import Widget from '../widget/code';

const { Image, AutoLayout } = figma.widget;

const node = await figma.createNodeFromJSXAsync(Widget)

figma.currentPage.appendChild(node);