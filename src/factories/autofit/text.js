export const autoFitMetrics = (width, height, text) => {
  const baseFont = 9;
  const availableArea = width * height;
  const words = text.split(/\s+/);
  const longestWordLength = Math.max.apply(null, words.map((l) => { return l.length; }));
  const estimatedArea = longestWordLength * (baseFont * 0.6) * words.length * baseFont;

  const areaRatio = Math.floor(availableArea / estimatedArea);
  const widthRatio = width / (longestWordLength * (baseFont * 0.6));

  if (areaRatio < 2) return {fontSize: 0, showLabels: false};

  if (areaRatio < 4) {
    return {fontSize: baseFont * 1.2, showLabels: widthRatio > 1};
  }

  if (areaRatio < 6) {
    return {fontSize: baseFont * 1.5, showLabels: widthRatio > 1};
  }

  return {fontSize: baseFont * 1.8, showLabels: widthRatio > 1};
};

export const autofitStyles = (width, height, text) => {
  const autoFit = autoFitMetrics(width, height, text);
  return {
    label: `style="display: ${autoFit.showLabels ? 'block' : 'none'}"`,
    font: `style="font-size: ${autoFit.fontSize}px"`
  };
};
