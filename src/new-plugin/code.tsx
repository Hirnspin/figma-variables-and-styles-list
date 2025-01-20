import Widget from '../widget/code';

const node = await figma.createNodeFromJSXAsync(Widget)

figma.currentPage.appendChild(node);