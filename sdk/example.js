const era = require('./era-electron');

// js没有函数重载，传入任意数量的参数调用的都是同一个函数
// 全看函数内部用到了多少参数，多出来的参数无用，少的参数全部以undefined处理
// undefined和null类似，但是因为三 位 一 体所以处理的时候得注意
// era提供的所有api里，数字和字符串是基本参数
// 一些api也会在末尾传入一个object形式的参数，称为config
// config参数是可以不填的，引擎做了处理，会给默认值

// 懒得上TypeScript了，不然那个就可以在声明函数时声明参数和返回值的类型
module.exports = async function () {
  era.addCharacter(1);
  era.clear();
  era.clear(5);
  // drawLine默认画一条虚线
  era.drawLine();
  // 设置isSolid画实线，设置content在线上写字，设置position控制线上文字的位置
  era.drawLine({
    content: '我是分界线',
    isSolid: true,
    position: 'left',
  });
  console.log(era.get('maxbase:1:体力'));
  console.log(era.getAddedCharacters());
  console.log(era.getAllCharacters());
  console.log(await era.input({ rule: '[0-3]' }));
  console.log(await era.loadData(1));
  era.loadGlobal();
  // config.isParagraph控制输出的文本是否包含在<p>标签里
  era.print('Hello world', {
    align: 'center',
    isParagraph: true,
    offset: 6,
    p: true,
    width: 12,
  });
  await era.printAndWait('Hello and wait for your any key');
  era.printButton('[0] 新的游戏', 0, {
    isButton: false,
    type: 'success',
    offset: 7,
    width: 10,
    align: 'right',
  });
  // 现在printButton的时候会自动在]之后补空格，不用专门写了
  // 在isButton是true的时候可以通过设置badge在按钮上显示角标
  // badge是'dot'的时候角标只有个圆点，不是的时候会显示字符串
  era.printButton('[1]招募队员', 1, {
    align: 'right',
    badge: '6',
    isButton: true,
    offset: 7,
    width: 10,
  });
  // 打印图片
  // 图片必须事先定义在resources文件夹下的csv文件里
  // csv文件里定义图片名和文件名、打印坐标、高宽和蒙板偏移量等信息
  // 注意csv文件必须和里面提到的图片文件在同一个文件夹下
  // 至于具体套几层engine并不care
  // 多个参数会打印多个图片并层层覆盖，实现蒙板效果，有几个参数就打几层，最先的参数打印的图片在最底下
  era.printImage('灵梦', '巨灵梦');
  // multi columns里的type与API是对应的
  // button对应era.printButton
  // divider对应era.drawLine
  // image对应era.printImage（还没实现）
  // progress对应era.printProgress
  // text对应era.print
  era.printMultiColumns(
    [
      { content: '我爱平底锅', type: 'text', config: { width: 8 } },
      {
        config: {
          p: true,
          align: 'center',
          width: 8,
        },
        content: '因为我老婆爱我',
        type: 'text',
      },
      {
        accelerator: 6,
        content: '我是\n灰太狼',
        type: 'button',
        config: {
          align: 'right',
          width: 8,
          inTextAlign: 'left',
        },
      },
    ],
    { verticalAlign: 'middle' },
  );
  era.printProgress(50, '50/100', '100/100', {
    align: 'right',
    barWidth: 20,
    color: 'rgb(0,255,255)',
    fontColor: '#ff00ff',
    height: 20,
    offset: 8,
    width: 8,
  });
  era.resetAllExceptGlobal();
  era.resetCharacter(1);
  era.resetGlobal();
  await era.saveData(1);
  era.saveGlobal();
  era.set('callname:2:1', 'Thee');
  // 以下三个set都是设置默认显示效果，即默认文本对齐方式、默认偏移量、默认宽度
  // 注意默认偏移量和默认宽度是element-plus布局里的设定，即0-24的整数值
  // 设置显示后的默认文本对齐方式，left、center、right
  era.setAlign('center');
  // 设置默认偏移量，是element-plus布局的设定，即0-23的整数值
  era.setOffset(5);
  // 设置窗口标题
  era.setTitle('EraElectron');
  // 设置默认宽度，是element-plus布局的设定，即1-24的整数值
  era.setWidth(14);
  await era.waitAnyKey();
};
