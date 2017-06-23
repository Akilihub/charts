import Plottable from "plottable";
import createRectangleChart, {createColorFiller} from "../factories/createTreeChart";
import {createTreeHierachy} from "../factories/createDataset";
import treemap from "d3-hierarchy/src/treemap";

/**
 * @typedef {Treemap} Treemap
 * @public
 * @property {'treemap'} type
 * @property {TreemapConfig} treemap
 *
 */

/**
 * @typedef {Object} TreemapConfig
 * @property {'binary'|'dice'|'slice'|'sliceDice'|'squarify'|'resquarify'} tile - Tiling Method
 *
 */

export default (element, data = [], config) => {

  const {

    orientation = 'vertical',

    colors = [],

    tree = {
      id: 'id',
      parent: 'parent',
      value: 'value',
      depth: Infinity,
    },

    // Treemap configuration
    treemap: {
      // Tiling algorithm: binary, dice, slice, sliceDice, squarify, resquarify
      tile = 'sliceDice',

    } = {},

    ...more

  } = config;

  const plot = new Plottable.Plots.Rectangle();

  // ... apply rectangle configuration

  const treeChart = createRectangleChart({element, plot, config: {orientation, ...more}});

  const tilingMethod = require(`d3-hierarchy/src/treemap/${tile}.js`);

  const layout = treemap().tile(tilingMethod.default);

  const colorize = createColorFiller(colors, []);

  const transform = root => {
    return layout(root)
      .leaves()
      .filter(d => d.depth <= tree.depth || Infinity);
  };

  const chart = {

    ...treeChart,

    addData: data => {
      const root = colorize(createTreeHierachy(data, tree));
      treeChart.addData(transform(root))
    }
  };

  chart.addData(data);

  return chart
};