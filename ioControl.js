// ----------------------------------------------------------------------
// GameTask
class ioControl extends GameTask {
	
	constructor(id){
		super(id);
	}
//----------------------------------------------------------------------
	pre(g){// 最初の実行時に実行。

		g.font["std"].useScreen(0);

		const cp = [
			//fontID,prompt	,charw, linew, location x,y
			[80, 24,"std"	,["_" ," "], 8,16	,  0,  0], //0:printw, addch, move, clear
			[60, 10,"small"	,["_" ," "], 6, 8	, 40,384],	//1:msg
			[32, 20,"small"	,["_" ," "], 6, 8	,480, 16], //2:debug, comment
			[40, 32,"small"	,false ,	 6, 10	,400,384], //3:inventry
			[32, 50,"mini"	,["_" ," "], 4, 6	,  0, 18], //4:mobslist
			[80,  1,"std"	,false, 8,16,   0,368], //5:statusbar
			[60, 27,"stdbg"	,false,	8,16, 160, 48]	//6:viewUpwindow
		]

		let cnsl = [];
		let layo = [];
		for (let i in cp){
			let p = cp[i];
			let c = new textConsole(p[0], p[1]);
			c.setFontId(p[2]);
			c.setPrompt(p[3]);
			c.setCharwidth(p[4]);
			c.setLinewidth(p[5]);
			const l = {con:c, x:p[6], y:p[7]};

			cnsl.push(c);
			layo.push(l);
		}
		g.console = cnsl;
		this.layout = layo;
		/*
		const c0 = new textConsole(80, 25);
		c0.setFontId("std");
		c0.setPrompt( ["_" ," "]);
		c0.setLinewidth(16);
		c0.setCharwidth(8);

		const c1 = new textConsole(80, 5);
		c1.setFontId("std");
		c1.setPrompt( ["_" ," "]);
		c1.setLinewidth(16);
		c1.setCharwidth(8);

		const c2 = new textConsole(32, 58);
		c2.setFontId("small");
		c2.setPrompt( ["_" ," "]);
		c2.setLinewidth(8);
		c2.setCharwidth(6);

		g.console = [c0, c1, c2];
		this.layout = [
			{con:c0, x: 0	, y:0}, 
			{con:c1, x: 0	, y:400}, 
			{con:c2, x: 640-50, y: 16}
		];
		*/
		this.debugview = true;
		this.overlapview = false;
		this.waittime = g.time();
		this.input = {};
	}
//----------------------------------------------------------------------
	step(g){// this.enable が true時にループ毎に実行される。

		// Input Keyboard ENTRY Check
	    let w = g.keyboard.check();

		const input = {
			//A: Boolean(w[65]),
			//D: Boolean(w[68]),
			//W: Boolean(w[87]),
			//S: Boolean(w[83]),
			//Q: Boolean(w[81]),
			//E: Boolean(w[69]),
			//UP:	  Boolean(w[38]),
			//DOWN: Boolean(w[40]),
			//LEFT: Boolean(w[37]),
			//RIGHT: Boolean(w[39]),
			//SPACE: Boolean(w[32]),
			//Z: Boolean(w[90]),
			HOME: Boolean(w["Home"]),//Boolean(w[36]),
			//P: Boolean(w[80]),
			LOG: Boolean(w["End"])
		}

		if (this.waittime < g.time()){
			let fullscr = (input.HOME)?true:false;
			if (fullscr){
				if (!document.fullscreenElement){ 
					g.systemCanvas.requestFullscreen();
				}
			}

			if (input.LOG) {
				this.debugview = (this.debugview)?false:true;
				this.waittime = g.time() + 500;
			}
		}
		let p = false;
		for (let i in input){
			if (input[i]) p = true;
		}
		input.pushdown = p;

		let keylist = [];
		for (let i in w){
			if (w[i]){
				keylist.push(i);
			}
		}
		keylist = GpadToKey(g, keylist);

		input.keylist = keylist;
		this.input = input;

		//-----------------------------------------------------------------------------
		// internal function 
		function GpadToKey(g, input){

			let gpd = g.gamepad;
			gpd.check();

			const KEYASSIGN = { 
				N0: "Numpad0",
				N1: "Numpad1",
				N2: "Numpad2",
				N3: "Numpad3",
				N4: "Numpad4",
				N5: "Numpad5",
				N6: "Numpad6",
				N7: "Numpad7",
				N8: "Numpad8",
				N9: "Numpad9",
				D:  "KeyD", 
				I:  "KeyI",
				SPC:"Space",
				RET:"Enter",
				HOME:"Home",
				END:"End",
				UP: "ArrowUp",
				DOWN:"ArrowDown"
			}
			
			if (gpd.upkey){
				if (gpd.leftkey || gpd.rightkey){
					input.push((gpd.leftkey)?KEYASSIGN.N7:KEYASSIGN.N9);
				}else
					input.push(KEYASSIGN.N8);
			} else 
				if (gpd.downkey){
					if (gpd.leftkey || gpd.rightkey){
						input.push((gpd.leftkey)?KEYASSIGN.N1:KEYASSIGN.N3);
					}else
						input.push(KEYASSIGN.N2);
				}else
					if (!gpd.upkey && !gpd.downkey) {
						if (gpd.leftkey) input.push(KEYASSIGN.N4);
						if (gpd.rightkey) input.push(KEYASSIGN.N6);
					}
			if (gpd.btn_x) input.push(KEYASSIGN.N0);
			if (gpd.btn_a) input.push(KEYASSIGN.N5);
			if (gpd.btn_b) input.push(KEYASSIGN.I);
			if (gpd.btn_y) input.push(KEYASSIGN.D);

			if (gpd.btn_start) input.push(KEYASSIGN.RET);
			//if (gpd.btn_back) input.push(KEYASSIGN.END) ;

			if (gpd.btn_rb) input.push(KEYASSIGN.DOWN);
			if (gpd.btn_rt || gpd.btn_lb) input.push(KEYASSIGN.UP);

			//if (gpd.btn_lb) input.push(KEYASSIGN.HOME);

			return input;
		}
	}
//----------------------------------------------------------------------
	draw(g){// this.visible が true時にループ毎に実行される。

		let r = g.fpsload.result();
		let dt = g.deltaTime().toString().substring(0,4);
		g.font["small"].putchr(`FPS:${Math.floor(r.fps)}  delta:${dt}`,520, 0);

		//let dispf = [true, true, !this.debugview, !this.overlapview, !this.debugview, true, this.overlapview];
		let dispf = [true, true, !this.debugview, true, !this.debugview, true, this.overlapview];


		for (let i in this.layout){
			let d = this.layout[i];

			if (dispf[i]) d.con.draw(g, d.x, d.y);
			//if (!((this.debugview && (i ==2 || i ==4)) || (this.overlapview && i==6))) d.con.draw(g, d.x, d.y);
			//if (this.debugview) d.con.draw(g, d.x, d.y);
		}

		let s = "input:";
		for (let i in this.input.keylist){s += `${this.input.keylist[i]},`}
		g.font["small"].putchr(s,0 , 480-8);

	}
}