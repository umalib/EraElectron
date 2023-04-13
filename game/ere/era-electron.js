module.exports = {
  /**
   * add a character
   * @param {number} charaId REQUIRED id of the character defined in chara*.csv
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  addCharacter(charaId) {},
  /**
   * clear printed lines
   * @param {number} [lineCount] how many lines to be cleared, leave undefined to clear all
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  clear(lineCount) {},
  /**
   * draw a divider to separate lines. the divider is also a line
   * @returns {void}
   */
  drawLine() {},
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
   * wait for use's input
   * @param {{rule: string}} [config] the config of input, like rule
   * @returns {Promise<any>} a promise of the user input, please use await
   */
  // eslint-disable-next-line no-unused-vars
  async input(config) {},
  /**
   * load a save file
   * @param {number} savIndex REQUIRED the index of the save file
   * @returns {boolean} if the loading succeeds
   */
  // eslint-disable-next-line no-unused-vars
  loadData(savIndex) {},
  /**
   * load global variables from save file
   * @returns {boolean} if the loading succeeds
   */
  loadGlobal() {},
  /**
   * print some text
   * @param {string} content REQUIRED the text to be printed
   * @param {{p: boolean, offset: number, width: number, isParagraph: boolean, align: string}} [config] the config of the printed line
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  print(content, config) {},
  /**
   * print some text and wait any key from user
   * @param {string} content REQUIRED the text to be printed
   * @param {{align: string, isParagraph: boolean, offset: number, p: boolean, width: number}} [config] the config of the printed line
   * @returns {Promise<void>} the same with waitAnyKey, please use await
   */
  // eslint-disable-next-line no-unused-vars
  async printAndWait(content, config) {},
  /**
   * print a button
   * @param {string} content REQUIRED the text of the button
   * @param {number} accelerator REQUIRED the accelerator key of the button used in the input
   * @param {{isButton: boolean, offset: number, width: number, buttonType: 'primary'|'success'|'warning'|'danger'|'info', align: string}} [config] the config of the printed button
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  printButton(content, accelerator, config) {},
  /**
   * print multiple columns into a row, excluding inputs
   * @param {Array<{type: 'button'|'image'|'progress'|'text', config?: {}}>} columnObjects the array of settings of columns, like print, printButton, printImage and printProgress
   * @param {{justify: 'start'|'center'|'end'|'space-between'|'space-around'|'space-evenly', align: 'top'|'middle'|'bottom'}} [config] the config of the row
   * @returns {void}
   * @see print
   * @see printButton
   * @see printImage
   * @see printProgress
   */
  // eslint-disable-next-line no-unused-vars
  printMultiColumns(columnObjects, config) {},
  /**
   * print a progress bar
   * @param {number} percentage REQUIRED the percentage of the progress bar, float, 0-100
   * @param {string} inContent REQUIRED the text shown in the progress bar
   * @param {string} outContent REQUIRED the text shown next to the progress bar
   * @param {{barRatio: number, color: string, offset: number, width: number, align: string, fontColor: string, height: number}} [config] the config of the printed progress
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  printProgress(percentage, inContent, outContent, config) {},
  /**
   * @deprecated print a line break, please use print('\n') to replace
   * @returns {void}
   */
  println() {},
  /**
   * reset all variables except global variables
   * @returns {boolean}
   */
  resetAllExceptGlobal() {},
  /**
   * reset the data of a character
   * @param {number} charaId REQUIRED id of the character defined in chara*.csv
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  resetCharacter(charaId) {},
  /**
   * reset global variables
   * @returns {boolean}
   */
  resetGlobal() {},
  /**
   * save data into a save file
   * @param {number} savIndex REQUIRED the index of the save file
   * @param {string} [comment] the comment of the save
   * @returns {boolean} if the saving succeeds
   */
  // eslint-disable-next-line no-unused-vars
  saveData(savIndex, comment) {},
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
   * wait any key from user
   * @returns {Promise<void>} a promise of nothing, please use await
   */
  async waitAnyKey() {},
};
