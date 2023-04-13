module.exports = {
  /**
   * add a character
   * @param charaId REQUIRED id of the character defined in chara*.csv
   */
  addCharacter(charaId) {},
  /**
   * clear printed lines
   * @param lineCount how many lines to be cleared, leave undefined to clear all
   */
  clear(lineCount) {},
  /**
   * draw a divider to separate lines. the divider is also a line
   */
  drawLine() {},
  /**
   * get a variable by name
   * @param varName REQUIRED the name of variable, String, like 'callname:1:2'
   * @return {any} the variable
   */
  get(varName) {},
  /**
   * get all added characters
   * @return {array<int>} the list of added characters' ids
   */
  getAddedCharacters() {},
  /**
   * get all characters
   * @return {array<int>} the list of all characters' ids
   */
  getAllCharacters() {},
  /**
   * wait for use's input
   * @param config the config of input, like rule
   * @return {Promise<any>} a promise of the user input, please use await
   */
  async input(config) {},
  /**
   * load a save file
   * @param savIndex REQUIRED the index of the save file
   * @return {boolean} if the loading succeeds
   */
  load(savIndex) {},
  /**
   * load global variables from save file
   * @return {boolean} if the loading succeeds
   */
  loadGlobal() {},
  /**
   * print some text
   * @param content REQUIRED the text to be printed
   * @param config the config of the printed line
   */
  print(content, config) {},
  /**
   * print a button
   * @param content REQUIRED the text of the button
   * @param accelerator REQUIRED the accelerator key of the button used in the input
   * @param config the config of the printed button
   */
  printButton(content, accelerator, config) {},
  /**
   * @deprecated print a line break, please use print('\n') to replace
   */
  println() {},
  /**
   * print a progress bar
   * @param percentage REQUIRED the percentage of the progress bar, 0-100
   * @param inContent REQUIRED the text shown in the progress bar
   * @param outContent REQUIRED the text shown next to the progress bar
   * @param config the config of the printed progress
   */
  printProgress(percentage, inContent, outContent, config) {},
  /**
   * reset all variables except global variables
   */
  resetAllExceptGlobal() {},
  /**
   * reset the data of a character
   * @param charaId REQUIRED id of the character defined in chara*.csv
   */
  resetCharacter(charaId) {},
  /**
   * reset global variables
   */
  resetGlobal() {},
  /**
   * save data into a save file
   * @param savIndex REQUIRED the index of the save file
   * @return {boolean} if the saving succeeds
   */
  save(savIndex) {},
  /**
   * save global variables into save file
   * @return {boolean} if the saving succeeds
   */
  saveGlobal() {},
  /**
   * set a variable by name
   * @param varName REQUIRED the name of variable, String, like 'callname:1:2'
   * @param val the new value of the variable
   * @return {boolean} the new value of the variable
   */
  set(varName, val) {},
  /**
   * set default text-align
   * @param textAlign the text-align, center, left or right used in usual
   */
  setAlign(textAlign) {},
  /**
   * set default offset
   * @param offset an integer between 0 and 23
   */
  setOffset(offset) {},
  /**
   * set the title of the window
   * @param title a string
   */
  setTitle(title) {},
  /**
   * set default width
   * @param width an integer between 1 and 24
   */
  setWidth(width) {},
  /**
   * wait any key from user
   * @return {Promise<void>} a promise of nothing, please use await
   */
  async waitAnyKey() {},
};
