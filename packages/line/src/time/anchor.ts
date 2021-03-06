import { drag, event } from 'd3';
import { Table } from 'plottable/build/src/components';
import { LegendConfig } from '@devinit-charts/core/lib/legend';
import { Component, Scales } from 'plottable';

export type Listener = (year: number) => void;
export interface TimeAchorConfig {
  table: Table;
  timeScale: Scales.Time;
  anchor?: {start: number, end?: number};
  legend?: LegendConfig;
  listeners?: Listener[];
}

export default (opts: TimeAchorConfig) => {
  const {table, timeScale, anchor = {start: 0}, listeners = [], legend}  = opts;

  const originDate = new Date(timeScale.domainMin());
  const startDate = anchor.start ? new Date(anchor.start.toString()) : originDate;
  let currentYear = startDate.getFullYear().toString();

  const minYear = new Date(timeScale.domainMin()).getFullYear();
  const maxYear = new Date(timeScale.domainMax()).getFullYear();
  // TODO: these scale transformation function were taking in actual Dates,
  // but the API seems to have changed such that they now take in numbers
  const origin = timeScale.scaleTransformation(originDate.getTime());
  const start = timeScale.scaleTransformation(startDate.getTime());

  const chartArea: Component = table.componentAt(1, 0);
  // TODO: the api may have changed, thats why we have chartArea as any
  const plotArea = legend && legend.showLegend ? (chartArea as any).componentAt(0, 0) : chartArea;

  const timeAxis = plotArea.componentAt(2, 1);

  const foreground = plotArea.foreground();

  foreground.attr('style', 'z-index: 1');

  const foregroundBounds = foreground.node().getBoundingClientRect();
  const timeAxisBounds = timeAxis
    .content()
    .node()
    .getBoundingClientRect();

  const leftOffset = timeAxisBounds.left - foregroundBounds.left;

  const xPosition = leftOffset + start;

  // Circle radius
  const topPosition = 20;

  const circle = foreground
    .append('circle')
    .attr('class', 'symbol')
    .attr('cx', xPosition)
    .attr('cy', topPosition)
    .attr('fill', 'rgb(232, 68, 58)')
    // .attr('stroke', '#444')
    .attr('r', topPosition);

  const text = foreground
    .append('text')
    .text(startDate.getFullYear().toString())
    .attr('class', 'symbol-label')
    .attr('x', xPosition)
    .attr('y', topPosition + 5)
    .attr('fill', '#fff')
    .attr('font-size', 13)
    .attr('text-anchor', 'middle');

  const line = foreground
    .append('line')
    .attr('class', 'symbol-line')
    .attr('x1', xPosition)
    .attr('x2', xPosition + 1)
    .attr('y1', topPosition + 22)
    .attr('y2', timeAxisBounds.top - foregroundBounds.top)
    .attr('stroke', '#444')
    .attr('stroke-width', 2);

  const changeAnchorPosition = (year: number): void => {
    // Prevent duplicate movements,
    // oh and they'll be duplicate movements
    // -- remove this condition at your own risk.
    // just kidding, i think
    if (year !== +currentYear && year >= +minYear && year <= +maxYear) {
      const _foregroundBounds = foreground.node().getBoundingClientRect();
      const _timeAxisBounds = timeAxis
        .content()
        .node()
        .getBoundingClientRect();

      const _leftOffset = _timeAxisBounds.left - _foregroundBounds.left;

      const _xPosition = timeScale.scaleTransformation(+year);

      circle.attr('cx', leftOffset + xPosition);

      text.attr('x', _leftOffset + _xPosition).text(year);

      line.attr('x1', _leftOffset + _xPosition).attr('x2', _leftOffset + _xPosition);

      // ... notify movement listeners
      listeners.forEach(callback => {
        if (callback && callback.call) {
          callback(+year);
        }
      });

      // ... update global current year
      currentYear = year.toString();
    }
  };

  function started() {
    // Change cursor style
    document.body.style.cursor = 'ew-resize';

    function dragged() {
      const { x } = event;

      const xDate = timeScale.invertedTransformation((origin + x) - leftOffset);

      const draggedYear = new Date(xDate).getFullYear();

      changeAnchorPosition(draggedYear);
    }

    function ended() {
      // revert cursor style
      // ts-disable
      /* tslint:disable-next-line */
      // TODO: type system says the below line is wrong
      // document.body.style = {};
    }

    event.on('drag', dragged).on('end', ended);
  }

  circle.call(drag().on('start', started));
  text.call(drag().on('start', started));
  line.call(drag().on('start', started));

  return changeAnchorPosition;
};
