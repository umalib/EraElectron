const lineType = {
  button: 1,
  divider: 2,
  dynamicText: 3,
  image: 4,
  'image.whole': 5,
  lineUp: 6,
  multiCol: 7,
  inColRows: 8,
  progress: 9,
  text: 10,
};
const engineCommand = {
  copyright: 1,
  resize: 2,
  restart: 3,
  start: 4,
  version: 5,
};
Object.keys(lineType).forEach((k, i) => (lineType[k] = i + 1));
Object.keys(engineCommand).forEach((k, i) => (engineCommand[k] = i + 1));

module.exports = {
  lineType,
  engineCommand,
};
