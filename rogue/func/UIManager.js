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

    let delta;
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
    this.move    = function(y, x){     g.console[0].move(x, y);  }
    this.printw  = function(text){     g.console[0].printw(text); }
    this.mvaddch = function(y, x, ch){ g.console[0].mvprintw(ch, x, y); }
    this.addch   = function(ch){ g.console[0].printw(ch); }
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

    this.clear   = function(num){ if (isNaN(num)) num=0; g.console[num].clear();     }
    
    this.msg    = function(text){      g.console[1].insertln(); g.console[1].printw(text); }
    this.addmsg = this.msg;
    this.endmsg = this.msg;
    this.doadd  = this.msg;
    
    this.debug  = function(text){      this.comment(`d: ${text}`); }
    this.comment = function(text){     g.console[2].insertln(); g.console[2].printw(text); }
    this.submsg = function(text){     g.console[3].insertln(); g.console[3].printw(text); }
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

        const level = stat.lvl;
        const purse = stat.pur;
        const pstats = stat.pstat;
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
        s_lvl = level;
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
            this.move(d.STATLINE, 0);
            this.printw(`Level: ${level}  Gold: ${purse}  Hp: ${pstats.s_hpt}(${max_hp})`+  
                `  Str: ${pstats.s_str}(${max_stats.s_str})  Arm: ${10 - s_arm}` +
                `  Exp: ${pstats.s_lvl}/${pstats.s_exp}  ${state_name[hungry_state]}`
            );
        }
    }

    /*
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
        let player = r.player.player;
        const stat = r.player.get_status();
        const purse = stat.pur;
        const hero = player.t_pos; 
        const cur_ring = stat.ring;

        //let after = r.after;
        //let running = r.running;

        let no_command = stat.nocmd;
        //let to_death = stat.death;

        let ch ,ki;
        let ntimes = 1;			/* Number of player moves */
        let fp; //*fp
        let mp; //THING *mp;
        let countch, direction, newcount = false;

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
                r.UI.endmsg();
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
                if (--no_command == 0)
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
                l_last_comm = last_comm;
                l_last_dir = last_dir;
                l_last_pick = last_pick;
                last_comm = ch;
                last_dir = '\0';
                last_pick = null;
            }

            const viewInventry = ()=>{
                //r.after = false; inventory(pack, 0);
                let st = r.player.get_invstat();
                r.UI.clear(3);
                for (let i in st){
                    r.UI.submsg(st[i]);
                }
                r.player.packf.inventory(player.t_pack, 0);
            }


            ki = this.readchar();
            oldc = pr;
            let opcmdf = false; //operation command flag
            if (!ki.includes("ControlLeft")){            

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
                    opcmdf = true;
                }
                if (ki.includes("KeyI")) viewInventry();
                if (ki.includes("KeyD")) ;//drop();
                if (ki.includes("KeyR")) ;//read_scroll();
                if (ki.includes("KeyE")) ;//eat();
                if (ki.includes("KeyW")) ;//wear();
                if (ki.includes("KeyT")) ;//take_off();
                if (ki.includes("KeyP")) ;//ring_on();
                if (ki.includes("KeyR")) ;//ring_off();
                if (ki.includes("KeyS")) ;//search();
                if (ki.includes("KeyM")) {
                    r.after = false;
                    r.player.packf.move_on = !(r.player.packf.move_on);
                    r.UI.comment(`mv_on[${r.player.packf.move_on}]`);// ${r.after?"m":"s"}]`);
                }//search();
            } else {
                r.UI.msg("itemUse+");
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
                            r.dungeon.d_level(); //or u_level();
                        else
                            r.UI.msg(`find down stairs push[5]key next dungeon level`); 
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

        if (this.wait_for("KeyQ")) r.debug.mapcheckTest();
        if (this.wait_for("KeyZ")) r.dungeon.show_map();
        if (this.wait_for("ArrowDown")) r.debug.checkListsCount();

        this.look(true);

        let s = " ";
		for (let i in ki){s += `${ki[i]},`}
            this.comment(`command${s}[${pr} ${oldc}]`);
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

        let player = r.player.player;
        let pstats = player.t_stats
        let pack   = player.t_pack
        let proom  = player.t_room
        let hero   = player.t_pos;
        let maxhp  = player.t_states.s_maxhp;

        let oldpos = r.oldpos;
        let oldrp = r.oldrp;

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
        if (Boolean(r.oldpos)&&Boolean(r.oldrp)){
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
        pch = pp.p_ch;
        pfl = pp.p_flags;

        for (y = sy; y <= ey; y++)
        if (y > 0 && y < d.NUMLINES - 1) for (x = sx; x <= ex; x++)
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
                    !this.step_ok(r.dungeon.chat(y, hero.x)) && !this.step_ok(r.dungeon.chat(hero.y, x)))
                    continue;
            }

            if ((tp = pp.p_monst) == null )
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
                if (wakeup)
                    wake_monster(y, x);
                if (see_monst(tp))
                {
                    if (on(player, d.ISHALU))
                        ch = rnd(26) + 'A';
                    else
                        ch = tp.t_disguise;
                }
            }
            if (on(player, d.ISBLIND) && (y != hero.y || x != hero.x))
                continue;

            r.UI.move(y, x);

            if ((proom.r_flags & d.ISDARK) && !see_floor && ch == d.FLOOR)
                ch = ' ';

            if (tp != null || ch != r.UI.inch())
                r.UI.addch(ch);

            if (door_stop && !firstmove && running)
            {
                switch (runch)
                {
                    case 'h':
                        if (x == ex)
                            continue;
                        break; 
                    case 'j':
                        if (y == sy)
                            continue;
                        break; 
                    case 'k':
                        if (y == ey)
                            continue;
                        break; 
                    case 'l':
                        if (x == sx)
                            continue;
                        break; 
                    case 'y':
                        if ((y + x) - sumhero >= 1)
                            continue;
                        break; 
                    case 'u':
                        if ((y - x) - diffhero >= 1)
                            continue;
                        break; 
                    case 'n':
                        if ((y + x) - sumhero <= -1)
                            continue;
                        break; 
                    case 'b':
                        if ((y - x) - diffhero <= -1)
                            continue;
                        break;
                }
                switch (ch)
                {
                    case d.DOOR:
                        if (x == hero.x || y == hero.y)
                            running = false  ;
                        break;
                    case d.PASSAGE:
                        if (x == hero.x || y == hero.y)
                            passcount++;
                        break;
                    case d.FLOOR:
                    case '|':
                    case '-':
                    case ' ':
                        break;
                    default:
                        running = false ;
                        break;
                }
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
    * step_ok:
    *	Returns true if it is ok to step on ch
    */
    this.step_ok = function(ch)
    {
        switch (ch)
        {
            case ' ':
            case '|':
            case '-':
                return false;
            default:
                //return (!isalpha(ch));
                return (Boolean(ch.match(/[a-zA-Z]/)));
        }
    }


}
