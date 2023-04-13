module.exports = {
  /**
   * add a character
   * @param {integer} charaId REQUIRED id of the character defined in chara*.csv
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  addCharacter(charaId) {},
  /**
   * clear printed lines
   * @param {integer} [lineCount] how many lines to be cleared, leave undefined to clear all
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
   * @returns {array<integer>} the list of added characters' ids
   */
  getAddedCharacters() {},
  /**
   * get all characters
   * @returns {array<integer>} the list of all characters' ids
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
   * @param {integer} savIndex REQUIRED the index of the save file
   * @returns {boolean} if the loading succeeds
   */
  // eslint-disable-next-line no-unused-vars
  load(savIndex) {},
  /**
   * load global variables from save file
   * @returns {boolean} if the loading succeeds
   */
  loadGlobal() {},
  /**
   * print some text
   * @param {string} content REQUIRED the text to be printed
   * @param {{align: string, isParagraph: boolean, offset: integer, p: boolean, width: integer}} [config] the config of the printed line
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  print(content, config) {},
  /**
   * print a button
   * @param {string} content REQUIRED the text of the button
   * @param {integer} accelerator REQUIRED the accelerator key of the button used in the input
   * @param {{isButton: boolean, type: string, offset: integer, width: integer, align: string}} [config] the config of the printed button
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  printButton(content, accelerator, config) {},
  /**
   * @deprecated print a line break, please use print('\n') to replace
   * @returns {void}
   */
  println() {},
  /**
   * print a progress bar
   * @param {float} percentage REQUIRED the percentage of the progress bar, 0-100
   * @param {string} inContent REQUIRED the text shown in the progress bar
   * @param {string} outContent REQUIRED the text shown next to the progress bar
   * @param {{align: string, barRatio: float, color: string, fontColor: string, height: integer, offset: integer, width: integer}} [config] the config of the printed progress
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  printProgress(percentage, inContent, outContent, config) {},
  /**
   * reset all variables except global variables
   * @returns {boolean}
   */
  resetAllExceptGlobal() {},
  /**
   * reset the data of a character
   * @param {integer} charaId REQUIRED id of the character defined in chara*.csv
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
   * @param {integer} savIndex REQUIRED the index of the save file
   * @returns {boolean} if the saving succeeds
   */
  // eslint-disable-next-line no-unused-vars
  save(savIndex) {},
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
   * @param {integer} offset REQUIRED an integer between 0 and 23
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
   * @param {integer} width REQUIRED an integer between 1 and 24
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
