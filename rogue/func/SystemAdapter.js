/**
 * **目的:** OSやハードウェアに依存する低レベルな処理を抽象化します。 
 * **責務**: オペレーティングシステムやハードウェアに依存する低レベルな処理
 * （端末、ファイルシステム、シグナル処理、ユーザー情報など）を抽象化し、
 * ゲームコアからの独立性を高めます。シングルトンとして、または依存性注入を通じて提供されます。
 */
/**
 * 
 * @param {GameManager} r GameManagerインスタンス 
 */
function SystemAdapter(r){

    const d = r.define;
    const t = r.types;
    /*
    **カプセル化するグローバル変数（例）:**
    *   `orig_dsusp`, `got_ltc`, `in_shell` (端末設定関連)。
    *   `encstr`, `statlist` (暗号化関連)。
    * **カプセル化する変数**: `orig_dsusp` (元のサスペンド文字), `got_ltc` (ローカルTTYキャラ取得フラグ), 
    * `in_shell` (シェル中フラグ), `encstr`, `statlist` (暗号化関連) など。
    */
    /*
    **関連する関数（提案されるメソッドの例）:**
    * `md_init()`, `md_readchar()`, `md_gethomedir()`, `md_unlink()`, `md_crypt()` など、
    * `mach_dep.c` の全ての関数。
    * **関連するメソッド**: `initMachine()`, `readSystemChar()`, `getHomeDirectory()`, 
    * `unlinkFile()`, `cryptPassword()`, `chmodFile()`, `dropPrivileges()`, `getProcessId()`, 
    * `getUserName()`, `getPasswordInput()`, `shellEscape()`, 
    * `setupSignalHandlers()` (例: `onSignalAutosave()`), `sendTstpSignal()`, `resumeTstpSignal()`, 
    * `initCurses()`, `endCurses()` など、`mach_dep.c` および `main.c` の多くの関数を抽象化します。
    */
    //` (シングルトンまたは依存性注入)
} 
/**
 * DEBUG ROUTINE
 * @param {GameManager} r GameManagerインスタンス
 * @param {GameCore}    g GameCoreインスタンス
 */
function debug(r, g){

    const d = r.define;
    const t = r.types;

    let sw = false;

    this.wizard = new wizard(r, g);

    this.checkListsCount = function()
    {
        const mlist   = r.dungeon.mlist;  
        const lvl_obj = r.dungeon.lvl_obj;

        let mlcount = 0;
        for (let m = mlist; m != null ; m = m.l_next) {
            mlcount++;
            r.UI.submsg(`${m.t_type} y:${m.t_pos.y} x:${m.t_pos.x} _m${m.id}${m.enable?"e":"d"} `);
            r.UI.mvaddch(m.t_pos.y, m.t_pos.x, m.t_type);
        }
        //console.log(mlcount);

        let locount = 0;
        for (let l = lvl_obj; l != null ; l = l.l_next){
            locount++;
            r.UI.submsg(`${l.o_type} y:${l.o_pos.y} x:${l.o_pos.x} _l${l.id}${l.enable?"e":"d"}`);
            r.UI.mvaddch(l.o_pos.y, l.o_pos.x, l.o_type);
        } 
        r.UI.submsg(`mlist:${mlcount} lvl_obj:${locount}`);
    }

    this.mobslist = function()
    {
        //console.log(locount);
        g.console[4].clear();
        for (let i in r.mobs){
            const mc = r.mobs[i];
            const str = "  " + mc.id
            const state_i = str.slice(str.length-2);
            const state_e = mc.enable   ?".":"/";
            const st_tt   = (mc.t_type != null) ?mc.t_type:"";
            const st_ot   = (mc.o_type != null) ?mc.o_type:"";
            const st_opx  = (Boolean(mc.o_pos.x))?mc.o_pos.x:"";
            const st_opy  = (Boolean(mc.o_pos.y))?mc.o_pos.y:"";
            const st_tpx  = (Boolean(mc.t_pos.x))?mc.t_pos.x:"";
            const st_tpy  = (Boolean(mc.t_pos.y))?mc.t_pos.y:"";

            let txt = "";
            switch(mc.location){
                case d.PLOBJ:
                    txt = `Player[${st_tpx},${st_tpy}] hp:${mc.t_stats.s_hpt}/${mc.t_stats.s_maxhp} `;
                    break;
                case d.FREE:
                    txt = `Free`;
                    break;
                case d.MLIST:
                    txt = `Mon [${st_tpx},${st_tpy}]${(Boolean(mc.t_dest.x))?"*":" "}hp:${mc.t_stats.s_hpt}`;
                    break;
                case d.LVLOBJ:
                    txt = `Lvl [${st_opx},${st_opy}]`;
                    break;
                case d.PACK_P:
                    txt = `Ppl (${mc.o_packch})${r.player.equip_state_check(mc.o_packch)?"*":""}`;
                    break;
                case d.PACK_M:
                    txt = `Pmo`;
                    break;
                default:
                    txt = `Unknown`;
            }

            if (sw) {
                //g.screen[0].fill(0, 0, 32*6, 50*8, "Blue");   
                //g.console[4].mvprintw(`${state_i}${state_e} ${st_tt}${st_ot} ${st_loc}${st_pc} ${st_parm} `, 0, i);
                g.console[4].mvprintw(`${state_i}${state_e}${st_tt}${st_ot} ${txt}`, 0, Number(i)+1);
            }
            //    st += ((r.mobs[i].enable)?String.fromCharCode(Number("A".charCodeAt(0))+Number(i)):"_");
        }
        sw = true;//!sw
        sysstate();
    }

    function sysstate(){

        const on = (thing,flag)=>{return ((thing.t_flags & flag) != 0)};
        const player = r.player.player;

        if (!Boolean(player)) return;

        let txt = [];

        txt.push(`no_command:${r.player.get_no_command()}`);
        txt.push(`food_left :${r.player.get_food_left()}`);
        txt.push(`to_death:${r.player.to_death?"o":"_"}`);     
        txt.push(`CANHUH :${on(player, d.CANHUH )?"o":"_"}`);
        txt.push(`CANSEE :${on(player, d.CANSEE )?"o":"_"}`);
        txt.push(`ISBLIND:${on(player, d.ISBLIND)?"o":"_"}`);
        txt.push(`ISLEVIT:${on(player, d.ISLEVIT)?"o":"_"}`);
        txt.push(`ISHASTE:${on(player, d.ISHASTE)?"o":"_"}`);
        txt.push(`ISHELD :${on(player, d.ISHELD )?"o":"_"}`);
        txt.push(`ISHUH  :${on(player, d.ISHUH  )?"o":"_"}`);
        txt.push(`ISHALU :${on(player, d.ISHALU )?"o":"_"}`);

        const sline = r.mobs.length +2;

        for (let i in txt)
            g.console[4].mvprintw(txt[i], 0, sline+Number(i));
    }

    //debug
    this.mapcheckTest = function()
    {
        let ws = this.placesCheck();

        for (let i in ws){
            g.console[0].mvprintw(ws[i], 0, i);
        }
        r.dungeon.passf.add_pass();
    }

    //debug
    this.placesCheck = function(){

        const places = r.dungeon.places;
        let vstr = []; 

        for (let i = 0; i< d.MAXLINES; i++){
            let ws = "";
            for (let j = 0; j< d.MAXCOLS; j++){
                //if (places[i][j].p_flags != 0) ws+="?"; else 
                let pl = places[i][j];
                let ch = (pl.p_monst != null)?pl.p_monst.t_disguise: pl.p_ch;

                ws += (ch != " ")?ch:"/";
            }
            vstr[i] = ws;
        }
        return vstr;
    }

    //debug
    this.monsterViewTest = function()
    {
        for (let i in r.mobs){
            const mc = r.mobs[i];
            if (mc.t_type != null) {
                r.UI.mvaddch(mc.t_pos.y, mc.t_pos.x, mc.t_type);
            }
        }
    }

    let col = 0, curw = 0;
	this.title = function(){

  		title_menu();

        let ki = r.UI.readchar();
        if (ki.includes("ArrowDown")||ki.includes("ArrowUp")){
			col +=((ki.includes("ArrowDown"))?1:-1);
		}
        if (ki.includes("ArrowRight")||ki.includes("ArrowLeft")){
			curw +=((ki.includes("ArrowRight"))?1:-1);
		}
        if (ki.includes("Numpad2")||ki.includes("Numpad8")){
			col +=((ki.includes("Numpad2"))?1:-1);
		}

        title_menu();

		if (r.UI.wait_for("Enter")||r.UI.wait_for("NumpadEnter")){
			let io = g.task.read("io");
			io.overlapview = null;
            if (col == 3){
                r.beginproc(true);
            }
            r.setScene(d.MAINR);
		}
 	}

	function title_menu(){

		switch(col)
		{
			case 2:
				// initPlayer
				break;
			case 3:
				// load Web Storage
				break;
			default:
				break;
		}

		if (col < 2) col = 2; else if (col >3) col = 3;

		const menu = [
			"Rogue: Exploring the Dungeons of Doom",
			"",
			`NEW GAME`,
			`CONTINUE (AUTOSAVE) `,
			"",
			"Push ENTER to START",
		]

		let io = g.task.read("io");
		io.overlapview = true;

		r.UI.clear(6);
		for (let i in menu){
			r.UI.submvprintw(i, 0, `${(col == i && (col >=2 && col <=3))?">":" "} ${menu[i]}`, true);
		}
	}
}