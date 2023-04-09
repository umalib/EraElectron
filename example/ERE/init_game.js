const era = require('./era-electron.js');
const { genderArr } = require('./data/const');

module.exports = async () => {
  era.log('init game');

  let flagNewGame = true;
  let playerName = '';
  let playerGender = 3;

  while (flagNewGame) {
    era.clear();
    era.setAlign('center');
    era.print(
      '十年寒窗终于金榜题名，\n邮箱里的那封信烫着金漆，\n闪着与你刚刚拿到的那块训练员徽章同样颜色的光芒。',
      { p: true },
    );
    era.println();
    era.print('你用还在颤抖的手取下了上面的火漆————', { p: true });
    era.drawLine();
    era.print(
      '聘书\n…………\n…………\n…………\n…………\n…………\n…………\n…………兹聘请贵方担任我校训练员一职。',
      { p: true },
    );
    era.println();
    era.print('日本中央特雷森学院理事长', { p: true, align: 'right' });
    era.print('秋川弥生', { p: true, align: 'right' });
    era.print(`（署名处）：  ${playerName}  ${genderArr[playerGender]}`, {
      p: true,
      align: 'left',
    });
    era.println();
    era.drawLine();

    if (!playerName) {
      playerName = await era.input();
      continue;
    }
    await era.inputAny();
  }
};
