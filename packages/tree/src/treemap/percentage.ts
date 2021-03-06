import {Datum} from '../types';

export default (width: number, height: number) => {
  const percentArea = (width * height) / 100;
  return (datum: Datum) =>
    Math.round(((datum.x1 - datum.x0) * (datum.y1 - datum.y0)) / percentArea);
};
