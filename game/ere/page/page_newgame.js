const era = require('../era-electron');

module.exports = async () => {
  const { genderArr } = require('../data/const.json');
  let flagNewGame = true;
  let playerName = '';
  let playerGender = -1;
  let flagSelectGender = false;

  while (flagNewGame) {
    era.clear();
    era.setAlign('center');
    era.print(
      '十年寒窗终于金榜题名，\n邮箱里的那封信烫着金漆，\n闪着与你刚刚拿到的那块训练员徽章同样颜色的光芒。\n\n你用还在颤抖的手取下了上面的火漆————',
    );
    era.drawLine();
    era.print(
      '聘书\n…………\n…………\n…………\n…………\n…………\n…………\n…………兹聘请贵方担任我校训练员一职。\n',
    );
    era.print('日本中央特雷森学院理事长\n秋川弥生', {
      align: 'right',
    });
    era.print(`（署名处）：  ${playerName}  ${genderArr[playerGender]}`, {
      align: 'left',
    });
    era.drawLine();
    era.setAlign('left');

    if (!playerName) {
      //未输入姓名
      era.print('——然后在左下角签上了自己的名字。（输入名字后回车）');
      playerName = await era.input();
      //    continue;
    } else if (!flagSelectGender) {
      //不在输入性别子循环
      if (playerGender < 0) {
        //未输入性别
        era.printButton('[0] 选择性别', 0);
      } else {
        //均已输入
        era.printButton('[1] 提交聘书', 1);
      }

      era.printButton('[10] 重新签名', 10);
      era.printButton('[99] 返回主菜单', 99);

      let ret = await era.input({ rule: '0|1|10|99' });

      switch (Number(ret)) {
        case 0:
          flagSelectGender = true; //进入输入性别子循环
          break;
        case 1:
          require('../system/sys_new_game')(playerName, playerGender);
          flagNewGame = false;
          await require('./page_homepage')();
          break;
        case 10:
          playerName = '';
          playerGender = 3;
          break;
        case 99:
          flagNewGame = false;
          break;
      }
    } else {
      //在输入性别子循环
      era.printButton('[0]女性', 0);
      era.printButton('[1]男性', 1);
      era.printButton('[2]扶她', 2);
      era.print('\n');

      let ret = await era.input({ rule: '[0-2]' });
      playerGender = Number(ret);
      flagSelectGender = false;
    }
    era.print('\n');

    //await era.waitAnyKey();
  }
};
