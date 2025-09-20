// ----------------------------------------------------------------------
// GameTask
class sceneControl extends GameTask {
	
	constructor(id){
		super(id);

		let io, stf, waitc 
		let keyon;
		const keywait = 250; //0.25s

		this.init = function(g){
			//create
		}

		this.pre = function(g){
			io = g.task.read("io");

			const r = new GameManager(g); 
			g.rogue = r;

			//roguemain(g);

			stf = false;
			waitc = 0;
			keyon = g.time();
		}

		this.step = function(g){

			waitc++;
			if (!stf && (waitc > 90)){
				stf = true;
				g.console[2].insertln();
				g.console[2].printw(`rouge.start()`);
				g.console[3].clear();
				g.rogue.start();
			}else{
				if ((waitc%10)==0 && !stf){
					//g.console[2].insertln();
					g.console[2].printw(`start-wait:${10-Math.floor(waitc/9)}`);
					g.console[3].insertln();
					g.console[3].printw("rogue progress wait" + "..........".substring(0,Math.floor(waitc/9)));
				}
			}

			if (stf){
				if (keyon < g.time()){
					if (io.input.keylist.length != 0){
						g.rogue.running(g);
						keyon = g.time() + keywait; 
					}
				}
			}
		}

		this.draw = function(g){
			//console draw io
		}
	}
}