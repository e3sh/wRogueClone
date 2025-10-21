//============================================
//include
//============================================

const r = "rogue/func/";
const p = "rogue/param/";

const w = [
    // GameCore
    "https://e3sh.github.io/WebGameCoreSystem/coremin.js",
    "main.js",
    "ioControl.js",
    "sceneControl.js",
    // Rogue 
    r + "GameManager.js",
        r + "manager/rip.js",
    r + "PlayerCharacter.js",
        r + "player/pack.js",
        r + "player/misc.js",
    r + "DungeonMap.js", 
        r + "dungeon/rooms.js",
        r + "dungeon/passages.js",
    r + "MonsterManager.js",
        r + "monster/fight.js",
    r + "ItemManager.js",
        r + "item/rings.js",
        r + "item/things.js",
        r + "item/sticks.js",
        r + "item/potions.js",
    r + "UIManager.js",
    r + "DaemonScheduler.js",
    r + "SystemAdapter.js",
    // Rogue Parameters
    p + "rogueDefines.js",
    p + "rogueTypes.js",
    p + "globalvInit.js",
 ];

for (let i in w) {
    document.write(`<script type="text/javascript" src="${w[i]}"></script>`);
};
