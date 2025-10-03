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
} //` (シングルトンまたは依存性注入)

/**
 * DEBUG ROUTINE
 * @param {GameManager} r GameManagerインスタンス
 * @param {GameCore}    g GameCoreインスタンス
 */
function debug(r, g){

    const d = r.define;
    const t = r.types;

    let sw = false;

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
        //console.log(locount);
        g.console[4].clear();
        for (let i in r.mobs){
            const mc = r.mobs[i];
            const state_i = (i != mc.id)?"!":"-";
            const state_e = mc.enable   ?"o":"-";
            const st_tt   = (mc.t_type != null) ?mc.t_type:"";
            const st_ot   = (mc.o_type != null) ?mc.o_type:"";
            const st_opx  = (Boolean(mc.o_pos.x))?mc.o_pos.x:"";
            const st_opy  = (Boolean(mc.o_pos.y))?mc.o_pos.y:"";
            const st_tpx  = (Boolean(mc.t_pos.x))?mc.t_pos.x:"";
            const st_tpy  = (Boolean(mc.t_pos.y))?mc.t_pos.y:"";
            const st_eq   = (mc.o_packch != null)?(r.player.equip_state_check(mc.o_packch)?"*":""):"?";

            let st_pc   = (mc.o_packch != null)?`(${mc.o_packch})${st_eq}`:`[${st_opx}${st_tpx},${st_opy}${st_tpy}]`; 

            let st_loc = "FREE";
            if (mc.t_type != null)   st_loc = "MONS";
            if (mc.o_type != null)   st_loc = "LVL ";
            if (mc.o_packch != null) st_loc = "PACK";

            if (sw) {
                //g.screen[0].fill(0, 0, 32*6, 50*8, "Blue");   
                g.console[4].mvprintw(`${state_i}${state_e} ${st_tt}${st_ot} ${st_loc}${st_pc} `, 0, i);
            }
            //    st += ((r.mobs[i].enable)?String.fromCharCode(Number("A".charCodeAt(0))+Number(i)):"_");
        }

        r.UI.submsg(`mlist:${mlcount} lvl_obj:${locount}`);
        sw = !sw;
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
                ws += places[i][j].p_ch != " "?places[i][j].p_ch:"/";
            }
            vstr[i] = ws;
        }
        return vstr;
    }
}