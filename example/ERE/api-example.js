const era = require('./era-electron');

// js没有函数重载，传入任意数量的参数调用的都是同一个函数
// 全看函数内部用到了多少参数，多出来的参数无用，少的参数全部以undefined处理
// undefined和null类似，但是因为三 位 一 体所以处理的时候得注意
// era提供的所有api里，数字和字符串是基本参数
// 一些api也会在末尾传入一个object形式的参数，称为config
// config参数是可以不填的，引擎做了处理，会给默认值

// 懒得上TypeScript了，不然那个就可以在声明函数时声明参数和返回值的类型
// 请原谅我吧
module.exports = async function () {
  era.addCharacter(1);
  era.clear();
  era.clear(5);
  era.drawLine();
  let ret;
  ret = era.get('maxbase:1:体力');
  ret = era.getAddedCharacters();
  ret = era.getAllCharacters();
  ret = await era.input({ rule: '[0-3]' });
  ret = era.load(1);
  era.loadGlobal();
  // config.p和config.isParagraph的作用完全相同
  // 控制输出的文本是否包含在<p>标签里
  // 前者是后者的简写，而后者是优先使用的，实际使用的时候用一个就行，避免混乱
  era.print('Hello world', {
    align: 'center',
    isParagraph: true,
    offset: 6,
    p: true,
    width: 12,
  });
  era.printButton('[0] 新的游戏', 0, {
    isButton: false,
    type: 'success',
    offset: 7,
    width: 10,
    align: 'right',
  });
  era.printProgress(50, '50/100', '100/100', {
    align: 'right',
    barRatio: 0.8,
    color: 'rgb(0,255,255)',
    fontColor: '#ff00ff',
    height: 20,
    offset: 8,
    width: 8,
  });
  era.resetAllExceptGlobal();
  era.resetCharacter(1);
  era.resetGlobal();
  era.save(1);
  era.saveGlobal();
  era.set('callname:2:1', '斯佩酱');
  // 以下三个set都是设置默认显示效果，即默认文本对齐方式、默认偏移量、默认宽度
  // 注意默认偏移量和默认宽度是element-plus布局里的设定，即0-24的整数值
  // 设置显示后的默认文本对齐方式，left、center、right
  era.setAlign('center');
  // 设置默认偏移量，是element-plus布局的设定，即0-23的整数值
  era.setOffset(5);
  // 设置窗口标题
  era.setTitle('EraUma');
  // 设置默认宽度，是element-plus布局的设定，即1-24的整数值
  era.setWidth(14);
  await era.waitAnyKey();

  console.log(ret);
};
