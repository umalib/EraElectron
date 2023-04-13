const era = require('../era-electron');

module.exports = async () => {
    let flagRecruitPanel = true;

    while (flagRecruitPanel) {
        era.clear();
        require('./page_header')();





        await era.waitAnyKey();
    }
}