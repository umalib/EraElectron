module.exports = {
  /**
   * DANGER add a variable by name
   * @param {string} varName REQUIRED the name of variable, String, like 'callname:1:2'
   * @param {any} val REQUIRED the value to be added
   * @returns {any|undefined} the new value of the variable, or undefined if failed
   */
  // eslint-disable-next-line no-unused-vars
  add(varName, val) {},
  /**
   * add some characters
   * @param {number | number[]} charaId REQUIRED id of the character defined in chara*.csv
   *     <br>if it is an array, is means add the character charaId[0] with the data of the character charaId[1]
   * @returns {boolean | boolean[]}
   */
  // eslint-disable-next-line no-unused-vars
  addCharacter(...charaId) {},
  /**
   * initialize data of some characters for training
   * @param {...number} charaId REQUIRED ids of the characters defined in chara*.csv
   * @returns {void} */
  // eslint-disable-next-line no-unused-vars
  addCharacterForTrain(...charaId) {},
  /**
   * initialize training and character data
   * @param {...number} charaId REQUIRED ids of the characters defined in chara*.csv
   */
  // eslint-disable-next-line no-unused-vars
  beginTrain(...charaId) {},
  /**
   * clear printed lines
   * @param {number} [lineCount] how many lines to be cleared, leave undefined to clear all
   * @returns {number} new line count
   */
  // eslint-disable-next-line no-unused-vars
  clear(lineCount) {},
  /**
   * make the current function to wait for some time
   * @param delay time to delay, ms
   * @return {Promise<unknown>}
   */
  async delay(delay) {
    return new Promise((resolve) => setTimeout(() => resolve(), delay));
  },
  /**
   * draw a divider to separate lines. the divider is also a line
   * @param {{[content]: string, [position]: 'left'|'center'|'right', [isSolid]: boolean, [width]: number}} [config] config of the line
   * @returns {number} line number of the printed
   */
  // eslint-disable-next-line no-unused-vars
  drawLine(config) {},
  /**
   * end training and destroy temporary data
   */
  endTrain() {},
  /**
   * get a variable by name
   * @param {string} varName REQUIRED the name of variable, String, like 'callname:1:2'
   * @returns {any|undefined} the variable, or undefined if failed
   */
  // eslint-disable-next-line no-unused-vars
  get(varName) {},
  /**
   * get all added characters
   * @returns {array<number>} the list of added characters' ids
   */
  getAddedCharacters() {},
  /**
   * get all characters
   * @returns {array<number>} the list of all characters' ids
   */
  getAllCharacters() {},
  /**
   * get characters added in train
   * @returns {array<number>} ids of characters in train
   */
  getCharactersInTrain() {},
  /**
   * wait for use's input, the engine will try to return number
   * @param {{[disableBefore]: boolean, [rule]: string, [useRule]: boolean}} [config] config of input, like rule
   * @returns {Promise<any>} a promise of the user input, please use await
   */
  // eslint-disable-next-line no-unused-vars
  async input(config) {},
  /**
   * load a save file
   * @param {number} savIndex REQUIRED the index of the save file
   * @returns {Promise<boolean>} if the loading succeeds
   */
  // eslint-disable-next-line no-unused-vars
  async loadData(savIndex) {},
  /**
   * load global variables from save file
   * @returns {boolean} if the loading succeeds
   */
  loadGlobal() {},
  /**
   * to log something into program logs
   * @param {any} msg
   */
  // eslint-disable-next-line no-unused-vars
  log(msg) {},
  /**
   * to log save data and global data into program logs
   */
  logData() {},
  /**
   * to log static data and field name data (from .csv) into program logs
   */
  logStatic() {},
  logger: {
    /**
     * to log something into program logs as debug level
     * @param {any} msg
     */
    // eslint-disable-next-line no-unused-vars
    debug(msg) {},
    /**
     * to log something into program logs as error level
     * @param {any} msg
     */
    // eslint-disable-next-line no-unused-vars
    error(msg) {},
    /**
     * to log something into program logs
     * @param {any} msg
     */
    // eslint-disable-next-line no-unused-vars
    info(msg) {},
  },
  /**
   * print some text
   * @param {string|{[color]: string, content: string, [isBr]: boolean}[]} content REQUIRED the text to be printed
   * @param {{[align]: 'left'|'center'|'right', [color]: string, [isList]: boolean, [isParagraph]: boolean, [offset]: number, [width]: number}} [config] config of the printed line
   * @returns {number} line number of the printed
   */
  // eslint-disable-next-line no-unused-vars
  print(content, config) {},
  /**
   * print some text and wait any key from user
   * @param {string} content REQUIRED the text to be printed
   * @param {{[align]: 'left'|'center'|'right', [color]: string, [isParagraph]: boolean, [offset]: number, [width]: number}} [config] config of the printed line   * @returns {Promise<void>} the same with waitAnyKey, please use await
   * @returns {Promise<number>} line number of the printed
   */
  // eslint-disable-next-line no-unused-vars
  async printAndWait(content, config) {},
  /**
   * print a button
   * @param {string} content REQUIRED the text of the button
   * @param {number} accelerator REQUIRED the accelerator key of the button used in the input
   * @param {{[align]: 'left'|'center'|'right', [badge]: 'dot'|string, [buttonType]: 'primary'|'success'|'warning'|'danger'|'info'|'', [disabled]: boolean, [inTextAlign]: 'left'|'center'|'right', [isButton]: boolean, [offset]: number, [width]: number}} [config] config of the printed button
   * @returns {number} line number of the printed
   */
  // eslint-disable-next-line no-unused-vars
  printButton(content, accelerator, config) {},
  /**
   *
   * @param content
   * @param [config]
   * @param [style]
   * @returns {number} line number of the printed
   */
  // eslint-disable-next-line no-unused-vars
  printDynamicText(content, config, style) {},
  /**
   * print images that must be declared in csv files in #/resources
   * @param {string} names REQUIRED image names
   * @returns {number} line number of the printed
   */
  // eslint-disable-next-line no-unused-vars
  printImage(...names) {},
  /**
   * print multiple columns into a row, excluding inputs
   * @param {Array<{type: 'button'|'divider'|'image'|'progress'|'text', [config]: {}}>} columnObjects the array of settings of columns, like print, printButton, printImage and printProgress
   * @param {{[horizontalAlign]: 'start'|'center'|'end'|'space-between'|'space-around'|'space-evenly', [verticalAlign]: 'top'|'middle'|'bottom'}} [config] config of the row
   * @returns {number} line number of the printed
   * @see print
   * @see printButton
   * @see printImage
   * @see printProgress
   */
  // eslint-disable-next-line no-unused-vars
  printMultiColumns(columnObjects, config) {},
  /**
   *
   * @param {...{columns: [{type: 'button'|'divider'|'image'|'image.whole'|'progress'|'text', [config]: {}}], [config]: {}}} columnObjects
   * @returns {number} line number of the printed
   */
  // eslint-disable-next-line no-unused-vars
  printInColRows(...columnObjects) {},
  /**
   * print a progress bar
   * @param {number} percentage REQUIRED the percentage of the progress bar, float, 0-100
   * @param {string} inContent REQUIRED the text shown in the progress bar
   * @param {string} outContent REQUIRED the text shown next to the progress bar
   * @param {{[align]: 'left'|'center'|'right', [barRatio]: number, [color]: string, [fontColor]: string, [height]: number, [offset]: number, [width]: number}} [config] config of the printed progress
   * @returns {number} line number of the printed
   */
  // eslint-disable-next-line no-unused-vars
  printProgress(percentage, inContent, outContent, config) {},
  /**
   * print the whole image
   * @param {string} name REQUIRED
   * @param {{[fit]: 'fill'|'contain'|'cover'|'none'|'scale-down'|'unset', [offset]: number, [textAlign]: 'left'|'center'|'right', [width]: number}} [config]
   * @returns {number} line number of the printed
   */
  // eslint-disable-next-line no-unused-vars
  printWholeImage(name, config) {},
  /**
   * print a line break, if just used to print enter at the end of a line, please use print('***\n') to replace
   * @returns {number} line number of the printed
   */
  println() {},
  /**
   * reset all variables except global variables
   * @returns {boolean}
   */
  resetAllExceptGlobal() {},
  /**
   * reset the data of a character
   * @param {number | number[]} charaId REQUIRED id of the character defined in chara*.csv
   *     <br>if it is an array, is means reset the character charaId[0] with the data of the character charaId[1]
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  resetCharacter(...charaId) {},
  /**
   * reset all data of the save
   * @returns {void}
   */
  resetData() {},
  /**
   * reset global variables
   * @returns {void}
   */
  resetGlobal() {},
  /**
   * remove a data file
   * @param {number} savIndex REQUIRED the index of the save file
   * @returns {boolean} if the removing succeeds
   */
  // eslint-disable-next-line no-unused-vars
  rmData(savIndex) {},
  /**
   * save data into a save file
   * @param {number} savIndex REQUIRED the index of the save file
   * @param {string} [comment] the comment of the save
   * @returns {Promise<boolean>} if the saving succeeds
   */
  // eslint-disable-next-line no-unused-vars
  async saveData(savIndex, comment) {},
  /**
   * save global variables into save file
   * @returns {boolean} if the saving succeeds
   */
  saveGlobal() {},
  /**
   * set a variable by name
   * @param {string} varName REQUIRED the name of variable, String, like 'callname:1:2'
   * @param {any} val REQUIRED the new value of the variable
   * @returns {any|undefined} the new value of the variable, or undefined if failed
   */
  // eslint-disable-next-line no-unused-vars
  set(varName, val) {},
  /**
   * set default text-align
   * @param {string} textAlign REQUIRED the text-align, center, left or right used in usual
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  setAlign(textAlign) {},
  /**
   * set style of dynamic text
   * @param lineNumber
   * @param style
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  setDynamicStyle(lineNumber, style) {},
  /**
   * set default offset
   * @param {number} offset REQUIRED an integer between 0 and 23
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  setOffset(offset) {},
  /**
   * set the title of the window
   * @param {string} title REQUIRED
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  setTitle(title) {},
  /**
   * set default width
   * @param {number} width REQUIRED an integer between 1 and 24
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  setWidth(width) {},
  /**
   * toggle debug status
   * @returns {boolean} if debug
   */
  toggleDebug() {},
  /**
   * wait any key from user
   * @returns {Promise<void>} a promise of nothing, please use await
   */
  async waitAnyKey() {},
  isEra: true,
};
