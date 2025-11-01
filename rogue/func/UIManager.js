/**
 * **目的:** 全てのユーザーインターフェース（画面表示とユーザー入力）を処理します。
 * **責務**: 全てのユーザーインターフェース（画面表示とユーザー入力）を処理します。
 */
/**
 * 
 * @param {GameManager} r GameManagerインスタンス
 * @param {GameCore} g GameCoreインスタンス 
 */

function UIManager(r, g){

    const d = r.define;
    const t = r.types;
    
    /*
    **カプセル化するグローバル変数（例）:**
    *   `hw`, `stdscr` (cursesウィンドウポインタ)。
    *   `msgbuf`, `mpos`, `newpos` (メッセージバッファとカーソル位置)。
    *   `huh` (直前のメッセージ)。
    *   `prbuf` (汎用文字列バッファ)。
    *   `terse`, `lower_msg`, `save_msg`, `stat_msg` (メッセージ表示オプション)。
    *   `whoami` (プレイヤー名表示用)。
    *   `delta`, `dir_ch` (方向入力)。
    *   `last_comm`, `last_dir`, `last_pick`, `l_last_comm`, `l_last_dir`, `l_last_pick` (直前のコマンド記録)。
    *   `msg_esc` (メッセージ中のESC処理)。
    * **カプセル化する変数**: `hw`, `stdscr` (cursesウィンドウポインタ), 
    * `msgbuf`, `mpos`, `newpos` (メッセージバッファとカーソル位置), `huh` (直前のメッセージ), 
    * `prbuf` (汎用文字列バッファ), `terse`, `lower_msg`, `save_msg`, `stat_msg` (メッセージ表示オプション), 
    * `whoami` (プレイヤー名表示用), `delta`, `dir_ch` (方向入力), `last_comm`, `last_dir`, `last_pick`, 
    * `l_last_comm`, `l_last_dir`, `l_last_pick` (直前のコマンド記録), `msg_esc` (メッセージ中のESC処理) など。
    */
    //const stdscr = g.console;
    whoami = "player"; this.whoami = whoami;   /* //char whoami[MAXSTR];/* Name of player */

    let msgbuf;
    let mpos = 0;				/* Where cursor is on top line */
    //let newpos;
    //let huh;       			/* The last message printed */
    //let prbuf;  			/* buffer for sprintfs */

    let terse = false;			/* true if we should be short  (メッセージ表示オプション)*/
    let lower_msg = false;			/* Messages should start w/lower case */
    let save_msg = true;			/* Remember last msg */
    let stat_msg = false;			/* Should status() print as a msg()  (ステータスメッセージ表示フラグ)*/

    let delta = 0;
    let dir_ch;     /* Direction from last get_dir() call */
    let last_comm;  /* Last command typed */
    let last_dir;   /* Last direction given */
    let last_pick;  /* Last object picked in get_item() */
    let l_last_comm;    /* Last last_comm */
    let l_last_dir;     /* Last object picked in get_item() */
    let l_last_pick;    /* Last last_pick */
    let msg_esc;
    
    let after;				/* true if we want after daemons */
    let again;				/* Repeating the last command */
    let seenstairs;			/* Have seen the stairs (for lsd) (階段目撃フラグ)*/
    let see_floor = true;	/* Show the lamp illuminated floor */
    let has_hit = false;	/* Has a "hit" message pending in msg (ヒットメッセージフラグ)*/

    let running = false ;		/* true  if player is running */
    let door_stop = false ;		/* Stop running break; case  we pass a door */
    let firstmove = false ;		/* First move after setting door_stop */
    let jump = false ;			/* Show running as series of jumps */
    let to_death = false;	    /* Fighting is to the death! (戦死フラグ)*/

    let count = 0;				/* Number of times to repeat command  (コマンド繰り返し回数)*/

    this.has_hit = has_hit;

    let exec_iu = false;
    this.get_execItemuse =()=>{return exec_iu;};
    this.set_execItemuse =()=>{exec_iu = true;};
    this.reset_execItemuse =()=>{exec_iu = false;}

    this.delta = delta;
    this.get_delta =()=>{
        let resd = {};
        switch (Number(delta))
        {
            case 7: resd.y = -1; resd.x = -1; break;
            case 8: resd.y = -1; resd.x =  0; break;
            case 9: resd.y = -1; resd.x =  1; break;
            case 4: resd.y =  0; resd.x = -1; break;
            case 6: resd.y =  0; resd.x =  1; break;
            case 1: resd.y =  1; resd.x = -1; break;
            case 2: resd.y =  1; resd.x =  0; break;
            case 3: resd.y =  1; resd.x =  1; break;
            default:  return; 
        }
        return resd;
    }

    const scene = g.task.read("scene")
    const moveEffect = scene.moveEffect;
    this.setEffect = moveEffect.setEffect; 

    this.battleEffect = function(asch, x ,y){
        for (let i=0; i<(2*Math.PI); i+=0.3){
            this.setEffect(asch,{x:x,y:y},
                {x: x+Math.cos(i)*3,
                 y: y+Math.sin(i)*3 
                }
            )
        }        
    } 
    this.damageEffect = function(asch, x ,y){
        for (let i=0; i<(2*Math.PI); i+=0.3){
            this.setEffect(asch,
                {x: x+Math.floor(Math.cos(i)*2),
                 y: y+Math.floor(Math.sin(i)*2) 
                },
                {x:x,y:y}
            )
        }        
    } 
    this.hitEffect = function(asch, x ,y){
        for (let i=0; i<(2*Math.PI); i+=0.3){
            this.setEffect(asch,{x:x,y:y},
                {x: x+Math.cos(i)*1.5,
                 y: y+Math.sin(i)*1.5 
                }
            )
        }        
    } 



    /*
    **関連する関数（提案されるメソッドの例）:**
    *   `msg()`, `addmsg()`, `endmsg()`, `doadd()` (メッセージ表示)。
    *   `readchar()`, `wait_for()` (文字入力)。
    *   `status()` (ステータスライン更新)。
    *   `look()`, `trip_ch()` (マップ表示)。
    *   `help()` (ヘルプ表示)。
    *   `get_dir()` (方向入力処理)。
    *   `inventory()`, `picky_inven()` (インベントリ表示)。
    *   `command()` (UI入力のメインループ、`GameManager` と連携)。
    *   `illcom()` (不正コマンドメッセージ)。
    *   `current()` (装備品表示)。
    *   `shell()` (シェルエスケープ)。
    * **関連するメソッド**: `displayMessage()`, `addMessage()`, `endMessage()`, `doAdd()` (メッセージ表示), 
    * `readChar()` (文字入力), `waitForKey()` (キー入力待ち), `updateStatus()` (ステータスライン更新), 
    * `look()`, `tripChar()` (マップ表示), `help()` (ヘルプ表示), `getDirection()` (方向入力処理), 
    * `displayInventory()`, `pickyInventory()` (インベントリ表示), `illegalCommandMessage()`, 
    * `displayCurrentEquipment()`, `shellEscape()` など。
    */
    const on = (thing,flag)=>{return ((thing.t_flags & flag) != 0)};

    //cursor move
    //textConsole 0:main 1:msg 2:debug/comment 3:submsg(inventry) 
    // (4):r.debug.checkListsCount (5):statisline 
    this.move    = function(y, x){     g.console[0].move(x, y);  }
    this.printw  = function(text){     g.console[0].printw(text); }
    this.mvaddch = function(y, x, ch){ g.console[0].mvprintw(ch, x, y); }
    this.mvaddstr = this.mvaddch;
    this.addch   = function(ch){ g.console[0].printw(ch); }
    this.addstr = this.addch;
    this.inch    = function(){
        let buff = g.console[0].buffer;
        let cx = g.console[0].cursor.x;
        let cy = g.console[0].cursor.y;

        let res = ' ';
        if (buff.length <= cy){
            if (buff[cy].length <= cx){
                res = buff[cy].substring(cx,cx+1);
            }
        }
        return res;
    }
    this.mvinch =(y, x)=>{
        this.move(y, x);
        return this.inch();
    }
    this.clear   = function(num){ if (isNaN(num)) num=0; g.console[num].clear(); }
    
    this.texwork = "";
    this.msg    = function(text){
        text = this.texwork + text;
        if (!Boolean(text)) return;
        if (text.length >0){ g.console[1].insertln(); g.console[1].printw(text);
        } 
        this.texwork = "";
    }
    this.addmsg = function(text){ this.texwork += text;}
    this.endmsg = function(){ this.msg("");};
    this.doadd  = function(text){ this.texwork += text;}
    
    this.debug  = function(text){      this.comment(`d: ${text}`); }
    this.comment = function(text){     g.console[2].insertln(); g.console[2].printw(text); }
    this.submsg = function(text){
             //g.console[3].insertln();
             g.console[3].move(g.console[3].cursor.x, g.console[3].cursor.y+1); 
             g.console[3].printw(text); 
    }
    this.submvprintw = function(y, x, text){
             g.console[3].move(x, y); 
             g.console[3].printw(text); 
    }

    this.setHomesub = function(){ g.console[3].move(0,0);}

    /*
    * readchar:
    *	Reads and returns a character, checking for gross input errors
    * ユーザーからの1文字入力を読み取ります。
    */
    this.readchar = function()
    {
        let ki = g.task.read("io").input.keylist;
        //if (ki.includes("KeyQ")) r.mapcheckTest();
        //keylistを返す
        return ki;
    }
    /*
    * wait_for
    *	Sit around until the guy types the right key
    * x特定のキーが押されるまで待機します。
    * 指定のキーの入力を判定
    */
    this.wait_for = function(ch)
    {
        let ki = g.task.read("io").input.keylist;
        return (ki.includes(ch))?true: false;
    }
    /*
    * status:
    *	Display the important stats line.  Keep the cursor where it was.
    * プレイヤーのステータス（HP、ゴールド、力など）を更新し表示します。
    * 参照)
    * cur_armor (装備中の防具), pstats (プレイヤーの統計情報), purse (所持ゴールド), 
    * level (現在の階層), hungry_state (空腹状態), stat_msg (ステータスメッセージ表示フラグ), 
    * max_hp, max_stats (最大ステータス)
    */
    this.status = function(){

        const stat = r.player.get_status();

        const level = r.dungeon.get_level();//stat.lvl;
        const purse = stat.pur;
        const pstats = r.player.get_pstat();//stat.pstat;
        const max_stats = stat.mstat;
        const cur_armor = stat.arm;
        const hungry_state = stat.hungs;
        const max_hp = stat.mhp

        let oy, ox, temp;
        let hpwidth = 0;
        let s_hungry = 0;
        let s_lvl = 0;
        let s_pur = -1;
        let s_hp = 0;
        let s_arm = 0;
        let s_str = 0;
        let s_exp = 0;
        let state_name = ["", "Hungry", "Weak", "Faint"];

        /*
        * If nothing has changed since the last status, don't
        * bother.
        */
        temp = ((cur_armor != null) ? cur_armor.o_arm : pstats.s_arm);
        if (s_hp == pstats.s_hpt && s_exp == pstats.s_exp && s_pur == purse
            && s_arm == temp && s_str == pstats.s_str && s_lvl == level
            && s_hungry == hungry_state
            && !stat_msg
        )
            return;

        s_arm = temp;

        //getyx(stdscr, oy, ox);
        if (s_hp != max_hp)
        {
            temp = max_hp;
            s_hp = max_hp;
            for (hpwidth = 0; temp; hpwidth++)
                temp /= 10;
        }

        /*
        * Save current status
        */
        s_lvl = level
        s_pur = purse;
        s_hp = pstats.s_hpt;
        s_str = pstats.s_str;
        s_exp = pstats.s_exp; 
        s_hungry = hungry_state;

        if (stat_msg)
        {
            this.move(0, 0);
            this.msg(`Level: ${level}  Gold: ${purse}  Hp: ${pstats.s_hpt}(${max_hp})`+  
                `  Str: ${pstats.s_str}(${max_stats.s_str})  Arm: ${10 - s_arm}` +
                `  Exp: ${pstats.s_lvl}/${pstats.s_exp}  ${state_name[hungry_state]}`
            );
        }
        else
        {
            //this.move(d.STATLINE, 0);
            g.console[5].clear();
            g.console[5].mvprintw(`${getPtnDelta(this.delta)} Level: ${level}  Gold: ${purse}  Hp: ${pstats.s_hpt}(${max_hp})`+  
                `  Str: ${pstats.s_str}(${max_stats.s_str})  Arm: ${10 - s_arm}` +
                `  Exp: ${pstats.s_lvl}/${pstats.s_exp}  ${state_name[hungry_state]}`
                ,0,0);
        }
    }
    //
    function getPtnDelta(delta){

        let res = "";
        const U = String.fromCharCode(24);
        const D = String.fromCharCode(25);
        const L = String.fromCharCode(27);
        const R = String.fromCharCode(26);

        switch(delta){
            case 7: res = `${L}${U} `; break;
            case 8: res = ` ${U} ` ;break;
            case 9: res = ` ${U}${R}` ; break;
            case 4: res = `${L}- ` ; break;
            case 6: res = ` -${R}` ; break;
            case 1: res = `${L}${D} ` ; break;
            case 2: res = ` ${D} ` ; break;
            case 3: res = ` ${D}${R}`; break;
            default: res = " + "; break;
        }
        return res;
    } 

    /*
    * 
    *
    *
    */
    this.pause = function(text){
        g.console[5].clear();
        g.console[5].mvprintw(text 
            ,23,0);
    }

    /*
    * command
    * 参照）
    * player (プレイヤーオブジェクト), has_hit (ヒットメッセージフラグ), running (走行中フラグ), 
    * door_stop (ドア通過時停止フラグ), purse (所持ゴールド), count (コマンド繰り返し回数), 
    * after (デーモン処理フラグ), to_death (戦死フラグ), cur_ring (装備中の指輪), 
    * terse (メッセージ表示オプション), 
    * last_comm, l_last_comm, last_dir, l_last_dir, last_pick, l_last_pick (直前のコマンド情報)
    */
    let pr;     //after bgchr
    let oldc;   //before bgchr

    this.command = function()
    {
        let ki = this.readchar();

        if (r.pause) {

            ki = this.readchar();
            r.UI.pause("[Press return to continue]");
            if (this.wait_for("Enter")||this.wait_for("NumpadEnter")){
                r.pause = false;
                r.restart();
            }
            return;
        } 

        let player = r.player.player;
        const stat = r.player.get_status();
        const purse = stat.pur;
        const hero = player.t_pos; 
        const cur_ring = stat.ring;

        //let after = r.after;
        //let running = r.running;

        let no_command = stat.nocmd;
        //let to_death = stat.death;

        let ch; //,ki;
        let ntimes = 1;			/* Number of player moves */
        let fp; //*fp
        let mp; //THING *mp;
        let countch, direction, newcount = false;
        let kvf = false;

        if (on(player, d.ISHASTE))
            ntimes++;
        /*
        * Let the daemons start up
        */
        r.daemon.do_daemons(d.BEFORE);
        r.daemon.do_fuses(d.BEFORE);

        while (ntimes--)
        {
            again = false;
            if (has_hit)
            {
                r.UI.endmsg("");
                has_hit = false;
            }
            /*
            * these are illegal things for the player to be, so if any are
            * set, someone's been poking in memeory
            */
            if (on(player, d.ISSLOW|d.ISGREED|d.ISINVIS|d.ISREGEN|d.ISTARGET))
            {
                r.UI.debug("illegal thing for the player");         
                //exit(1);
            }

            this.look(true);
            if (!running)
                door_stop = false;
            r.UI.status();
            lastscore = purse;
            r.UI.move(hero.y, hero.x);
            //if (!((running || count) && jump))
            //    refresh();			/* Draw screen */
            take = 0;
            r.after = true;

            /*
            * Read command or continue run
            */
            //if (wizard)
            //    noscore = true;
            if (!no_command)
            {
                if (running || to_death)
                    ch = runch;
                else if (count)
                    ch = countch;
                else
                {
                    //ch = r.UI.readchar();
                    move_on = false;
                    if (mpos != 0)		/* Erase message if its there */
                        msg("");
                }
            }
            else
                ch = '.';
            if (no_command)
            {
                r.player.set_no_command(--no_command);
                if (no_command == 0)
                {
                    player.t_flags |= d.ISRUN;
                    r.UI.msg("you can move again");
                }
            }
            /*
            * execute a command
            */
            if (count && !running)
            count--;
            if (ch != 'a' && ch != d.ESCAPE && !(running || count || to_death))
            {
                //l_last_comm = last_comm;
                //l_last_dir = last_dir;
                //l_last_pick = last_pick;
                //last_comm = ch;
                //last_dir = '\0';
                //last_pick = null;
            }

            const viewInventry = ()=>{
                //r.after = false; inventory(pack, 0);
                let st = r.player.get_invstat();
                r.UI.setHomesub();
                r.UI.clear(3);

                let io = g.task.read("io");
                if (!io.debugview){
                    for (let i in st){
                        r.UI.submsg(st[i]);
                    }
                    r.UI.submsg(`inpack ${r.player.packf.read_inpack()} /cur:${r.player.packf.get_cur()}`);
                }
                r.player.packf.inventory(player.t_pack, 0);
                r.debug.mobslist();
            }

            const useItem = ()=>{
                //let inkeyst = "";
                //for (let i in ki){
                //    if (ki[i].includes("Key")){
                //        inkeyst = ki[i].substring(3).toLowerCase();
                //        break;
                //    }
                // }
                let inkeyst = r.player.packf.get_cur();

                if (inkeyst != "") {
                    //let cnum = inkeyst.charCodeAt(0);
                    let ws = "";
                    let useitem = r.player.packf.picky_inven(inkeyst);
                    if (useitem != null){
                        //ws = `Item type "${useitem.o_type}"`;
                        r.after = false;

                        switch(useitem.o_type)
                        {
                            case d.FOOD:
                                ws = "food eat()";
                                r.player.eat(useitem);
                                break;
                            case d.WEAPON:
                                ws = "weapon wield()";
                                if (r.player.equip_state_check(inkeyst)) ws += "*";
                                r.item.weapon.wield(useitem);
                                // wield()
                                break;
                            case d.ARMOR:
                                ws = "armor wear()/takeoff()";
                                if (r.player.equip_state_check(inkeyst)) ws += "*";
                                r.item.armor.wear(useitem);/// takeoff()
                                break;                            
                            case d.RING:
                                ws = "ring ring_on/ring_off()";
                                if (r.player.equip_state_check(inkeyst)) ws += "*";
                                r.item.rings.ring_on(useitem);// ring_off()
                                break;                            
                            case d.STICK:
                                ws = "stick/wand do_zap()";
                                r.item.sticks.do_zap(useitem)//do_zap()
                                break;                            
                            case d.POTION:
                                ws = "potion quaff()";
                                r.item.potions.quaff(useitem);
                                break;                            
                            case d.SCROLL:
                                ws = "scroll read_scroll()";
                                r.item.scroll.read_scroll(useitem);
                                break;                            
                            default:
                                ws = "etc";
                                //no operation
                        }
                        //r.UI.msg(`${ws} ${inkeyst})${r.item.things.inv_name(useitem, false)}`);//(${cnum})` );
                    }
                    r.UI.comment(`${ws} ${inkeyst})`);
                    //r.UI.msg(`use Item ${inkeyst})${r.item.things.inv_name(obj, false)} ${ws}`);//(${cnum})` );
                    r.player.packf.set_cur(0);
                    exec_iu = true;
                    viewInventry();
                }
                //selectしたキーのalphabetのitemがあるか？
                //itemがあった場合はitemの種類を判定
                //Foodだった場合はeat()を呼ぶ
                //ringだった場合は？どうするか装備する指をどのように指定するべきか
                //weaponだった場合は持ち替え
                //armorだった場合は装備変更
                //potion/scroll/staff/wand...thing.o_type DEFINE SYMBOL
                // command:
                // identify weild ware discoverd
            }

            const dropItem =()=>{

                let inkeyst = r.player.packf.get_cur();
                let dobj = r.player.packf.picky_inven(inkeyst);
                if (!Boolean(dobj)) return;

                if (dobj.o_type == d.WEAPON){
                    let delta = this.get_delta();
                    r.item.weapon.missile(dobj, delta.y, delta.x);
                    //r.UI.msg(`throw ${inkeyst})${r.item.things.inv_name(dobj, false)} x${delta.x},y${delta.y}`);
                }else{
                    r.item.things.drop(dobj);
                    //r.UI.msg(`drop ${inkeyst})${r.item.things.inv_name(dobj, false)}`);
                }
                r.player.packf.set_cur(0);
                viewInventry();
            }

            //ki = this.readchar();
            oldc = pr;
            let opcmdf = false; //operation command flag
            //if (!ki.includes("Space")){            

            if (ki.includes("Numpad4")) pr = r.player.do_move( 0,-1);
            if (ki.includes("Numpad2")) pr = r.player.do_move( 1, 0);
            if (ki.includes("Numpad8")) pr = r.player.do_move(-1, 0);
            if (ki.includes("Numpad6")) pr = r.player.do_move( 0, 1);
            if (ki.includes("Numpad7")) pr = r.player.do_move(-1,-1);
            if (ki.includes("Numpad9")) pr = r.player.do_move(-1, 1);
            if (ki.includes("Numpad1")) pr = r.player.do_move( 1,-1);
            if (ki.includes("Numpad3")) pr = r.player.do_move( 1, 1);

            if (ki.includes("Numpad5")) {
                pr = r.player.do_move( 0, 0);
                search();
                opcmdf = true;
            }
            if (ki.includes("NumpadAdd")||ki.includes("NumpadSubtract")||
                ki.includes("ArrowDown")||ki.includes("ArrowUp"))
            {
                r.player.packf.set_cur(
                    (ki.includes("NumpadAdd")||ki.includes("ArrowDown"))?1:-1
                );
                viewInventry();
            }
            //if (ki.includes("NumpadAdd")) r.player.packf.set_cur(1);//r.UI.msg("+");
            //if (ki.includes("NumpadSubtract")) r.player.packf.set_cur(-1)//r.UI.msg("-");
            //if (ki.includes("Numpad0")) r.UI.msg("Zero");

            if (ki.includes("Numpad0")) useItem();

            if (ki.includes("KeyI")) viewInventry();
            if (ki.includes("KeyD")) dropItem(); 
            if (ki.includes("KeyR")) ;//read_scroll(); //auto_select
            if (ki.includes("KeyE")) ;//eat(); //auto_select
            if (ki.includes("KeyW")) ;//wear(); //auto_select
            if (ki.includes("KeyT")) ;//take_off(); //auto_select
            if (ki.includes("KeyP")) ;//ring_on(); //auto_select
            if (ki.includes("KeyR")) ;//ring_off(); //auto_select
            if (ki.includes("KeyL")) ;//ring// select position L /
            if (ki.includes("KeyS")) ;//search(); //no operation
            if (ki.includes("KeyM")) { //get item on/off
                r.after = false;
                r.player.packf.move_on = !(r.player.packf.move_on);
                r.UI.comment(`mv_on[${r.player.packf.move_on}]`);// ${r.after?"m":"s"}]`);
            }//search();
            //use potion function is quaff() (potions)
            if (this.wait_for("KeyQ")) r.debug.mapcheckTest(); //debug command
            if (this.wait_for("KeyA")) r.debug.monsterViewTest(); //debug command
            if (this.wait_for("KeyZ")) r.dungeon.show_map(); //debug command
            //if (this.wait_for("ArrowDown")) r.debug.checkListsCount(); //debug command

            //} else {
            //}
            //set delta
            for (let i in ki)
                if (ki[i].includes("Numpad")){
                    let cnum = Number(ki[i].substring(6));
                    if (cnum >=1 && cnum <=9)    
                    {
                        //inkeyst = `direction: ${ki[i].substring(6).toLowerCase()}`;
                        if (cnum !=5) {
                            if (delta != cnum) kvf = true;
                            delta = cnum;
                            this.delta = delta;
                        }
                        break;
                    }
                }

            if (r.after)
            {
                //r.UI.comment(`[${pr} ${oldc}`);// ${r.after?"m":"s"}]`);
                switch (pr)
                {
                    case d.DOOR:
                        //r.UI.msg(`DOOR:ROOM ${(oldc==d.PASSAGE)?"IN":"OUT"}`);
                        if (oldc==d.PASSAGE) r.dungeon.roomf.enter_room(hero);
                        if (oldc==d.FLOOR)   r.dungeon.roomf.leave_room(hero);
                        break;
                    case d.STAIRS: //r.UI.msg("STAIRS");
                        if (opcmdf) 
                            if (r.player.amulet){
                                r.dungeon.u_level();
                            }else{
                                r.dungeon.d_level();
                            }      
                        else
                            if (r.player.amulet){
                                r.UI.msg(`you find up stairs.`);//(push[5] or pad(A)key next dungeon level)`);
                            }else{
                                r.UI.msg(`you find down stairs.`);//(push[5] or pad(A)key next dungeon level)`);
                            }
                        break;
                    case d.GOLD:  
                    case d.FOOD:  
                    case d.POTION:
                    case d.SCROLL:
                    case d.WEAPON:
                    case d.ARMOR:  
                    case d.RING:   
                    case d.MAGIC:  
                    case d.STICK:  
                    case d.AMULET:
                        r.player.packf.pick_up(pr);
                        viewInventry();
                        //r.UI.msg(`GET ITEM:${pr}/mode${r.player.packf.move_on}`); 
                        break;  
                }
            }
        }

        r.daemon.do_daemons(d.AFTER);
        r.daemon.do_fuses(d.AFTER);

        const ISRING = (h,r)=>  {cur_ring[h] != null && cur_ring[h].o_which == r}

        if (ISRING(d.LEFT, d.R_SEARCH))
            search();
        else if (ISRING(d.LEFT, d.R_TELEPORT) && r.rnd(50) == 0)
            teleport();
        if (ISRING(d.RIGHT, d.R_SEARCH))
            search();
        else if (ISRING(d.RIGHT, d.R_TELEPORT) && r.rnd(50) == 0)
            teleport();

        this.look(true);
        r.UI.status();

        let s = " ";
		for (let i in ki){s += `${ki[i]},`}
        if (kvf) this.comment(`dir:${delta} input:${s}`);//[${pr} ${oldc}]`);
    }

    /*
    * look:
    *	A quick glance all around the player
    * プレイヤーの周囲の状況を画面に表示します。
    * 参照）
    * hero, oldpos, proom, oldrp (位置情報), door_stop, firstmove, 
    * running, runch (移動フラグ), player (t_flags), after (デーモン処理フラグ), 
    * stairs, seenstairs (階段情報)
    */
    this.look = function(wakeup)
    {
        //const ce =(a,b)=>{((a).x == (b).x && (a).y == (b).y)}

        const step_ok = r.dungeon.step_ok;


        let player = r.player.player;
        let proom  = player.t_room
        let hero   = player.t_pos;

        let x, y;
        let ch;
        let tp; //THING *tp;
        let pp; //PLACE *pp;
        let rp; //struct room *rp;
        let ey, ex;
        let passcount;
        let pfl, fp, pch;
        let sy, sx, sumhero = 0, diffhero = 0;

        let done = false ;

        if (done) return;
        done = true ;

        passcount = 0;
        rp = r.player.player.t_room; //proom;
        if (r.oldpos != null && r.oldrp != null){
            if (!((r.oldpos.x == hero.x) && (r.oldpos.y == hero.y)))
            {
                r.UI.erase_lamp(r.oldpos, r.oldrp);
                r.oldpos = hero;
                r.oldrp = rp;
            }
        }
        ey = hero.y + 1;
        ex = hero.x + 1;
        sx = hero.x - 1;
        sy = hero.y - 1;
        if (door_stop && !firstmove && running)
        {
            sumhero = hero.y + hero.x;
            diffhero = hero.y - hero.x;
        }
        pp = r.dungeon.INDEX(hero.y, hero.x);
        
        if (!Boolean(pp)) {
            r.UI.debug("LK outside?")   
            return 
        }

        pch = pp.p_ch;
        pfl = pp.p_flags;

        for (y = sy; y <= ey; y++)
        if (y > 0 && y < d.NUMLINES - 1)
            for (x = sx; x <= ex; x++)
            {
                if (x < 0 || x >= d.NUMCOLS)
                    continue;
                if (!on(player, d.ISBLIND))
                {
                    if (y == hero.y && x == hero.x)
                        continue;
                }

                pp = r.dungeon.INDEX(y, x);
                ch = pp.p_ch;
                if (ch == ' ')		/* nothing need be done with a ' ' */
                    continue;
                fp = pp.p_flags;
                if (pch != d.DOOR && ch != d.DOOR)
                    if ((pfl & d.F_PASS) != (fp & d.F_PASS))
                        continue;
                if (((fp & d.F_PASS) || ch == d.DOOR) && 
                  ((pfl & d.F_PASS) || pch == d.DOOR))
                {
                    if (hero.x != x && hero.y != y &&
                        !step_ok(r.dungeon.chat(y, hero.x)) && !step_ok(r.dungeon.chat(hero.y, x)))
                        continue;
                }

                tp = pp.p_monst;
                if (tp == null )
                    ch = this.trip_ch(y, x, ch);
                else
                    if (on(player, d.SEEMONST) && on(tp, d.ISINVIS))
                    {
                        if (door_stop && !firstmove)
                            running = false ;
                        continue;
                    }
                    else
                    {
                        //console.log("d ms ");
                        if (wakeup)
                            r.monster.wake_monster(y, x);
                        if (r.player.see_monst(tp))
                        {
                            if (on(player, d.ISHALU))
                                ch = String.fromCharCode(r.rnd(26) + Number('A'.charCodeAt(0)));
                            else
                                ch = tp.t_disguise;
                        }
                    }
                if (on(player, d.ISBLIND) && (y != hero.y || x != hero.x))
                    continue;

                r.UI.move(y, x);

                if ((proom.r_flags & d.ISDARK) && !see_floor && ch == d.FLOOR)
                    ch = ' ';

                if (tp != null || ch != r.UI.inch()){
                    if (Boolean(ch))
                        r.UI.addch(ch);
                    else
                        console.log(`look:${ch}`);
                }
            }
        if (door_stop && !firstmove && passcount > 1)
            running = false ;
        if (!running || !jump)
            r.UI.mvaddch(hero.y, hero.x, d.PLAYER);
        done = false ;
    }

    /*
    * trip_ch:
    *	Return the character appropriate for this space, taking into
    *	account whether or not the player is tripping.
    * 幻覚状態の場合の画面上のキャラクター表示を制御します。
    */
    this.trip_ch = function(y, x, ch)
    {
        let player = r.player.player;
        let stairs = r.dungeon.get_stairs();

        if (on(player, d.ISHALU) && after)
        switch (ch)
        {
            case d.FLOOR:
            case ' ':
            case d.PASSAGE:
            case '-':
            case '|':
            case d.DOOR:
            case d.TRAP:
                break;
            default:
                if (y != stairs.y || x != stairs.x || !seenstairs)
                    ch = rnd_thing();
            break;
        }
        return ch;
    }

    /*
    * erase_lamp:
    *	Erase the area shown by a lamp in a dark room.
    * 暗い部屋でランプが照らす範囲を消去します。
    */
    //erase_lamp(coord *pos, struct room *rp)
    this.erase_lamp = function(pos, rp)
    {
        //return;
        const player = r.player.player;
        const hero = r.player.hero;

        let y, x, ey, sy, ex;

        if (!(see_floor && (rp.r_flags & (d.ISGONE|d.ISDARK)) == d.ISDARK
            && !on(player,d.ISBLIND)))
                return;

        ey = pos.y + 1;
        ex = pos.x + 1;
        sy = pos.y - 1;
        for (x = pos.x - 1; x <= ex; x++)
            for (y = sy; y <= ey; y++)
            {
                if (y == hero.y && x == hero.x)
                    continue;
                r.UI.move(y, x);
                if (r.UI.inch() == d.FLOOR)
                    r.UI.addch(' ');
            }
    }

    /*
    * show_floor:
    *	Should we show the floor in her room at this time?
    * 部屋の床を表示するかどうかを判定します。
    */
    this.show_floor = function()
    {
        let player = r.player.player;
        let proom  = player.t_room;

        if ((proom.r_flags & (d.ISGONE|d.ISDARK)) == d.ISDARK && !on(player, d.ISBLIND))
            return see_floor;
        else
            return true ;
    }
    /*
    * search:
    *	player gropes about him to find hidden things.
    */
    //void
    function search()
    {
        let player = r.player.player;
        let hero   = player.t_pos;

        let y, x; //register int y, x;
        let fp;	//register char *fp;
        let ey, ex;	//register int ey, ex;
        let probinc;	//int probinc;
        let found;	//bool found;

        const foundone =()=>{
            found = d.TRUE;
            fp |= d.F_REAL;
            count = false;
            running = false;
        }

        ey = hero.y + 1;
        ex = hero.x + 1;
        probinc = (on(player, d.ISHALU) ? 3 : 0);
        probinc += (on(player, d.ISBLIND) ? 2 : 0);
        found = false;
        for (y = hero.y - 1; y <= ey; y++) 
            for (x = hero.x - 1; x <= ex; x++)
            {
                if (y == hero.y && x == hero.x)
                    continue;
                fp = r.dungeon.flat(y, x);
                if (!(fp & d.F_REAL))
                    switch (r.dungeon.chat(y, x))
                    {
                    case '|':
                    case '-':
                        if (r.rnd(5 + probinc) != 0)
                            break;
                        r.dungeon.places[y][x].p_ch = d.DOOR;
                        r.UI.msg("a secret door");
                //foundone:
                        found = d.TRUE;
                        fp |= d.F_REAL;
                        count = false;
                        running = false;
                        break;
                    case d.FLOOR:
                        if (r.rnd(2 + probinc) != 0)
                            break;
                        r.dungeon.places[y][x].p_ch = TRAP;
                        if (!terse)
                            r.UI.addmsg("you found ");
                        if (on(player, d.ISHALU))
                            r.UI.msg(tr_name[r.rnd(d.NTRAPS)]);
                        else {
                            r.UI.msg(tr_name[fp & d.F_TMASK]);
                            fp |= d.F_SEEN;
                        }
                        foundone();
                        break;
                        case ' ':
                            if (r.rnd(3 + probinc) != 0)
                                break;
                        r.dungeon.places[y][x].p_ch = d.PASSAGE;
                        foundone();
                    }
                //r.UI.debug("search");
            }
        if (found)
            this.look(false);
    }

	/*
	* get_dir:
	*      Set up the direction co_ordinate for use in varios "prefix"
	*	commands
	*/
	//bool
	function get_dir()
	{
		let prompt;
		let gotit;
		let last_delt= {x:0,y:0};//static coord last_delt= {0,0};

		if (again && last_dir != '\0')
		{
			delta.y = last_delt.y;
			delta.x = last_delt.x;
			dir_ch = last_dir;
		}
		else
		{
			if (!terse)
				this.msg(prompt = "which direction? ");
			else
				prompt = "direction: ";
			do
			{
				gotit = TRUE;
				switch (dir_ch = readchar())
				{
				case 'h': case'H': delta.y =  0; delta.x = -1;
				break; case 'j': case'J': delta.y =  1; delta.x =  0;
				break; case 'k': case'K': delta.y = -1; delta.x =  0;
				break; case 'l': case'L': delta.y =  0; delta.x =  1;
				break; case 'y': case'Y': delta.y = -1; delta.x = -1;
				break; case 'u': case'U': delta.y = -1; delta.x =  1;
				break; case 'b': case'B': delta.y =  1; delta.x = -1;
				break; case 'n': case'N': delta.y =  1; delta.x =  1;
				break; case ESCAPE: last_dir = '\0'; reset_last(); return FALSE;
				otherwise:
					mpos = 0;
					msg(prompt);
					gotit = FALSE;
				}
			} while (!gotit);
			if (isupper(dir_ch))
				dir_ch = tolower(dir_ch);
			last_dir = dir_ch;
			last_delt.y = delta.y;
			last_delt.x = delta.x;
		}
		if (on(player, ISHUH) && rnd(5) == 0)
		do
		{
			delta.y = rnd(3) - 1;
			delta.x = rnd(3) - 1;
		} while (delta.y == 0 && delta.x == 0);
		mpos = 0;
		return TRUE;
	}
}
