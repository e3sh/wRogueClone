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

    this.checkListsCount = function()
    {
        const mlist   = r.dungeon.mlist;  
        const lvl_obj = r.dungeon.lvl_obj;

        let mlcount = 0;
        for (let m = mlist; m != null ; m = m.l_next) {
            mlcount++;
            r.UI.submsg(`m y:${m.t_pos.y} x:${m.t_pos.x} f:${m.t_flags}`);
            r.UI.mvaddch(m.t_pos.y, m.t_pos.x, "&");
        }
        //console.log(mlcount);

        let locount = 0;
        for (let l = lvl_obj; l != null ; l = l.l_next){
            locount++;
            r.UI.submsg(`l y:${l.o_pos.y} x:${l.o_pos.x} f:${l.o_flags}`);
            r.UI.mvaddch(l.o_pos.y, l.o_pos.x, "$");
        } 
        //console.log(locount);

        r.UI.submsg(`mlist:${mlcount} lvl_obj:${locount}`);
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