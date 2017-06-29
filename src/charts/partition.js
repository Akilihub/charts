import Plottable from "plottable";
import createTreeChart, {createColorFiller} from "../factories/createTreeChart";
import {createTreeHierachy} from "../factories/createDataset";
import {createScaleAnimator} from '../factories/createAnimator'

/**
 * @typedef {TreeChart} Partition
 * @public
 * @property {'partition'} type
 * @property {('vertical'|'horizontal')} orientation=horizontal - Orientation
 *
 */
export default (element, data = [], config) => {

  const {

    colors = [],

    coloring = null,

    tree = {
      id: 'id',
      parent: 'parent',
      value: 'value',
      depth: Infinity,
    },

    ...moreConfig

  } = config;

  const orientation = 'horizontal';

  const plot = new Plottable.Plots.Rectangle();

  const treeChart = createTreeChart({element, plot, config: {orientation, ...moreConfig}});

  const layout = partition().size([1, 1]);

  const colorize = createColorFiller(colors, [], coloring);

  const transform = data => {
    const root = colorize(createTreeHierachy(data, tree));
    return layout(root)
      .descendants()
      .filter(d => d.depth <= tree.depth || Infinity);
  };

  const ease = (actual, expected, factor) => {
    if (+expected.toFixed(4) !== +actual.toFixed(4)) {
      const diff = expected - actual;

      const differenceTooSmall = parseFloat(Math.abs(diff).toFixed(3)) === 0;

      return differenceTooSmall ? expected : actual + (diff * factor)
    }
  };
  let listeners = [];

  const animate = createScaleAnimator(200);

  treeChart.onClick((entities, xScale, yScale) => {

    const entity = entities.pop();
    const datum = entity.datum;

    // TODO: Rethink orientation implementation for tree chats
    // It might be better to fix orientation for each tree chart
    //
    const x = orientation === 'vertical' ? 'x' : 'y';
    const y = orientation === 'horizontal' ? 'x' : 'y';
    const x0 = x + '0';
    const y0 = y + '0';
    const x1 = x + '1';
    const y1 = y + '1';

    const xMax = orientation === 'horizontal' ? datum.descendants().sort((a, b) => a[x1] - b[x1]).pop()[x1] : datum[x1];
    const xMin = orientation === 'horizontal' && datum.parent ? datum[x0] - (xMax - datum[x0]) * 0.1 : datum[x0];
    const yMax = orientation === 'vertical' ? datum.descendants().sort((a, b) => a[y1] - b[y1]).pop()[y1] : datum[y1];
    const yMin = orientation === 'vertical' && datum.parent ? datum[y0] - (yMax - datum[y0]) * 0.1 : datum[y0];

    animate([xScale, yScale], [xMin, xMax], [yMin, yMax])
  });

  const chart = {

    ...treeChart,

    onClick: (callback) => {
      listeners.push(callback)
    },

    addData: data => treeChart.addData(transform(data))
  };

  chart.addData(data);

  return chart
};

const partition = function () {
  let dx = 1,
    dy = 1,
    padding = 0,
    round = false;

  function partition(root) {
    const n = root.height + 1;
    root.x0 = root.y0 = padding;
    root.x1 = dx;
    root.y1 = dy / n;
    root.eachBefore(positionNode(dy, n));
    if (round) root.eachBefore(roundNode);
    return root;
  }

  function positionNode(dy, n) {
    return function (node) {
      if (node.children) {
        treemapDice(node, node.x0, dy * (node.depth + 1) / n, node.x1, dy * (node.depth + 2) / n);
      }
      let x0 = node.x0,
        y0 = node.y0,
        x1 = node.x1 - padding,
        y1 = node.y1 - padding;
      if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
      if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
      node.x0 = x0;
      node.y0 = y0;
      node.x1 = x1;
      node.y1 = y1;
    };
  }

  partition.round = function (x) {
    //noinspection CommaExpressionJS
    return arguments.length ? (round = !!x, partition) : round;
  };

  partition.size = function (x) {
    //noinspection CommaExpressionJS
    return arguments.length ? (dx = +x[0], dy = +x[1], partition) : [dx, dy];
  };

  partition.padding = function (x) {
    //noinspection CommaExpressionJS
    return arguments.length ? (padding = +x, partition) : padding;
  };

  return partition;
};

const treemapDice = function (parent, x0, y0, x1, y1) {
  let nodes = parent.children,
    node,
    i = -1,
    n = nodes.length,
    sum = nodes.reduce((sum, n) => sum + Math.abs(n.value), 0),
    k = (x1 - x0) / sum;

  while (++i < n) {
    node = nodes[i];
    node.y0 = y0;
    node.y1 = y1;
    node.x0 = x0;
    node.x1 = x0 += Math.abs(node.value) * k;
  }
};

const roundNode = node => {
  node.x0 = Math.round(node.x0);
  node.y0 = Math.round(node.y0);
  node.x1 = Math.round(node.x1);
  node.y1 = Math.round(node.y1);
};
