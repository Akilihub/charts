import Plottable from 'plottable';
import { createTitle } from '../createTitle';
import { createColorLegend } from '../createLegend';
import { createChartTable } from '../createTable';
import createTooltips from '../tooltips/circular';
import { createCircularPlot } from './helpers';

/**
 * @typedef {Object} CircularChart - Circular chart configuration
 * @property {string} type - Type
 * @property {string} title - Title of chart
 * @property {string[]} colors - Colors
 * @property {indicator} coloring - Color Indicator
 * @property {Circular} circular - Sectors
 * @property {ColorLegend} legend - Legend
 */

/**
 * @typedef {Object} Circular - Sector configuration
 * @property {indicator} label - Label indicator
 * @property {indicator} value - Sector indicator
 * @property {number} innerRadius - Inner Radius (0 - 100%)
 * @property {number} strokeWidth - Stroke Width
 * @property {string} strokeColor - Stroke Color
 */

export default ({ element, plot, config }) => {
  const {
    title = null,

    titleAlignment = 'left',

    colors = [],

    coloring = null,

    circular = {
      label: 'label',
      value: 'value',
      innerRadius: 0,
      strokeWidth: 0,
      strokeColor: '#fff',
    },

    legend = {
      showLegend: false,
      position: 'bottom',
      alignment: 'center',
    },

    tooltips = {
      enable: true,
    }
  } = config;

  const colorScale = new Plottable.Scales.Color();

  const table = createChartTable({
    title: createTitle({ title, titleAlignment }),
    chart: createCircularPlot({ plot, ...circular }),
    legend: createColorLegend(colorScale, legend),
    legendPosition: legend.position,
  });

  table.renderTo(element);

  plot.onAnchor(plot => {
    setTimeout(() => {
      createTooltips(element, tooltips)(plot);
    }, 500);
  });

  const update = (data = []) => {
    const series = data.map((d, i) => ({
      label: d[circular.label],
      value: parseFloat(d[circular.value]),
      color: d[coloring] || colors[i] || '#abc',
    }));

    // TODO: Efficiently update legend
    if (legend.showLegend) {
      const domain = series.map(d => d.label);
      const range = series.map(d => d.color);
      colorScale.domain(domain).range(range);
    }

    plot.datasets([new Plottable.Dataset(series)]);
  };

  return {
    table,

    update,

    destroy: () => {
      table.destroy();
    },
  };
};
