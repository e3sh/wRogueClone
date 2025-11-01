// main NONTITLE(PwrRnkup) 2024/04/13- dncth16
//----------------------------------------------------------------------
function main() {

    const sysParam = { canvasId: "layer0", screen: [{ resolution: { w: 800, h: 480 , x:0, y:0 } }] 	};
	const game = new GameCore( sysParam );

	//Game Asset Setup
    const p = "pict/";
    game.asset.imageLoad("ASCII", p + "pdcfont.png");
    game.asset.imageLoad("SMALL", p + "k12x8_jisx0201c.png");
    game.asset.imageLoad("MINIF", p + "font4x6.png");
    game.asset.imageLoad("ASCBG", p + "pdcfont_bg.png");

	const spfd = SpriteFontData();
	for (let i in spfd) {
	    game.setSpFont(spfd[i]);
	}

    //Game Task Setup
   	game.task.add(new ioControl("io"));
	game.task.add(new sceneControl("scene"));
	//
	game.screen[0].setBackgroundcolor("black"); 
    game.screen[0].setInterval(1); 

    game.keyboard.codeMode();

	game.run();
}

//----------------------------------------------------------------------
// SpriteFontData
function SpriteFontData() {

    //8_16_font
	let sp = [];
    for (let i = 0; i < 8; i++) {// normal 1 - 3(<4)
        for (j = 0; j <32; j++) {
            ptn = { x:  8 * j, y: 16 * i, w:  8, h: 16 }
            sp.push(ptn);
        }
    }
    //6_8_font
    let s2 = [];
    for (let i = 2; i < 8; i++) {
        for (j = 0; j <16; j++) {
            ptn = { x:  6 * j, y: 8 * i, w:  6, h: 8 }
            s2.push(ptn);
        }
    }
    //4_6_font
    let ss = [];
    for (let i = 0; i < 6; i++) {
        for (j = 0; j <16; j++) {
            ptn = { x:  4 * j, y: 6 * i, w:  4, h: 6 }
            ss.push(ptn);
        }
    }
    //↑↑
    return [
        { name: "std"   , id: "ASCII", pattern: sp, ucc: true },
        { name: "small" , id: "SMALL", pattern: s2 },
        { name: "mini"  , id: "MINIF", pattern: ss },
        { name: "stdbg" , id: "ASCBG", pattern: sp, ucc: true },
    ]
}
