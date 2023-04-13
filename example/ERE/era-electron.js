module.exports = {
  /**
   * add a character
   * @param charaId {integer} REQUIRED id of the character defined in chara*.csv
   * @returns {void}
   */
  addCharacter(charaId) {},
  /**
   * clear printed lines
   * @param lineCount {integer} how many lines to be cleared, leave undefined to clear all
   * @returns {void}
   */
  clear(lineCount) {},
  /**
   * draw a divider to separate lines. the divider is also a line
   * @returns {void}
   */
  drawLine() {},
  /**
   * get a variable by name
   * @param varName {string} REQUIRED the name of variable, String, like 'callname:1:2'
   * @returns {any|undefined} the variable, or undefined if failed
   */
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
   * @param config {{rule: string}} the config of input, like rule
   * @returns {Promise<any>} a promise of the user input, please use await
   */
  async input(config) {},
  /**
   * load a save file
   * @param savIndex {integer} REQUIRED the index of the save file
   * @returns {boolean} if the loading succeeds
   */
  load(savIndex) {},
  /**
   * load global variables from save file
   * @returns {boolean} if the loading succeeds
   */
  loadGlobal() {},
  /**
   * print some text
   * @param content {string} REQUIRED the text to be printed
   * @param config {{align: string, isParagraph: boolean, offset: integer, p: boolean, width: integer}} the config of the printed line
   * @returns {void}
   */
  print(content, config) {},
  /**
   * print a button
   * @param content {string} REQUIRED the text of the button
   * @param accelerator {integer} REQUIRED the accelerator key of the button used in the input
   * @param config {{isButton: boolean, type: string, offset: integer, width: integer, align: string}} the config of the printed button
   * @returns {void}
   */
  printButton(content, accelerator, config) {},
  /**
   * @deprecated print a line break, please use print('\n') to replace
   * @returns {void}
   */
  println() {},
  /**
   * print a progress bar
   * @param percentage {float} REQUIRED the percentage of the progress bar, 0-100
   * @param inContent {string} REQUIRED the text shown in the progress bar
   * @param outContent {string} REQUIRED the text shown next to the progress bar
   * @param config {{align: string, barRatio: float, color: string, fontColor: string, height: integer, offset: integer, width: integer}} the config of the printed progress
   * @returns {void}
   */
  printProgress(percentage, inContent, outContent, config) {},
  /**
   * reset all variables except global variables
   * @returns {boolean}
   */
  resetAllExceptGlobal() {},
  /**
   * reset the data of a character
   * @param charaId {integer} REQUIRED id of the character defined in chara*.csv
   * @returns {void}
   */
  resetCharacter(charaId) {},
  /**
   * reset global variables
   * @returns {boolean}
   */
  resetGlobal() {},
  /**
   * save data into a save file
   * @param savIndex {integer} REQUIRED the index of the save file
   * @returns {boolean} if the saving succeeds
   */
  save(savIndex) {},
  /**
   * save global variables into save file
   * @returns {boolean} if the saving succeeds
   */
  saveGlobal() {},
  /**
   * set a variable by name
   * @param varName {string} REQUIRED the name of variable, String, like 'callname:1:2'
   * @param val {any} the new value of the variable
   * @returns {any|undefined} the new value of the variable, or undefined if failed
   */
  set(varName, val) {},
  /**
   * set default text-align
   * @param textAlign {string} the text-align, center, left or right used in usual
   * @returns {void}
   */
  setAlign(textAlign) {},
  /**
   * set default offset
   * @param offset {integer} an integer between 0 and 23
   * @returns {void}
   */
  setOffset(offset) {},
  /**
   * set the title of the window
   * @param title {string}
   * @returns {void}
   */
  setTitle(title) {},
  /**
   * set default width
   * @param width {integer} an integer between 1 and 24
   * @returns {void}
   */
  setWidth(width) {},
  /**
   * wait any key from user
   * @returns {Promise<void>} a promise of nothing, please use await
   */
  async waitAnyKey() {},
};
