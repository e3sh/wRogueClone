/**
 * **目的:** プレイヤーキャラクターに関する全てのデータと行動を管理します。
 * **責務**: プレイヤーのステータス（HP、筋力、経験値など）、装備品（武器、防具、リング）、持ち物（パック）、
 * 現在地、およびプレイヤーが実行できる行動（移動、攻撃、アイテム使用など）に関する全てを管理します。
 */
/**
 * 
 * @param {GameManager} r GameManagerインスタンス 
 */
function PlayerCharacter(r){
    
    const d = r.define;
    const t = r.types;
    /*
    **カプセル化するグローバル変数（例）:**
    *   `player` 構造体全体（`pstats`, `t_flags`, `t_pack` (インベントリ), `t_room` (現在の部屋) を含む）。
    *   `hero` (プレイヤーの座標、`player.t_pos` のマクロ)。
    *   `max_hp` (プレイヤーの最大HP、`player.t_stats.s_maxhp` のマクロ)。
    *   `food_left`, `hungry_state`, `no_command`, `no_move` (空腹や行動不能状態)。
    *   `purse` (所持ゴールド)。
    *   `level` (プレイヤーが認識する現在の階層、ゲーム全体の状態でもあるがプレイヤーに紐づく側面が強い)。
    *   `amulet` (YendorのAmuletを所持しているか)。
    *   `cur_armor`, `cur_weapon`, `cur_ring[]` (装備中のアイテム)。
    *   `inpack`, `pack_used[]` (インベントリ関連)。
    **カプセル化する変数**: `pstats` (プレイヤーの統計情報), `pack` (持ち物リスト), `cur_weapon` (現在の武器), `cur_armor` (現在の防具), `cur_ring[]` (リング),
    *   `hero` (プレイヤーの座標), `proom` (プレイヤーがいる部屋) など。
    */
    let player = new t.thing(); //(プレイヤーオブジェクト)
    player.t_stats = new t.stats(d.INIT_STATS);//[0,0,0,0,0,0,0]);
    let pstats = player.t_stats // (プレイヤーの統計情報) プレイヤーの統計情報 (Str, HPなど)
    let pack   = player.t_pack  // (プレイヤーインベントリ) プレイヤーのインベントリリスト
    let proom  = player.t_room // プレイヤーがいる部屋
    let hero   = player.t_pos; // (プレイヤー位置)
    let maxhp  = player.t_stats.s_maxhp; //プレイヤーの最大HP

    let max_stats  = new t.stats(d.INIT_STATS); 

    let food_left = 0;			/* Amount of food in hero's stomach (食料残量)*/
    let hungry_state = 0;   /* How hungry is he  (空腹状態)*/	
    let no_command = 0;	/* Number of turns asleep  (行動不能ターン数)*/
    let no_move = 0;    /* Number of turns held in place (行動不能ターン数)*/		
    let purse = 0;  /* How much gold he has  (所持ゴールド)*/
    let level = 1;  /* What level she is on (現在の階層)*/
    let see_floor = true;	/* Show the lamp illuminated floor */
    let terse = false;		/* true if we should be short (メッセージ表示オプション)*/
    let to_death = false;	/* Fighting is to the death! (戦死フラグ)*/
    let kamikaze = false;			/* to_death really to DEATH */
    let move_on = false;	/* Next move shouldn't pick up items */
    
    let amulet = false; /* He found the amulet */ 

    let cur_armor = new t.thing(); 			/* What he is wearing (装備中の防具)*/
    let cur_ring = [];  // (装備中の指輪)
    cur_ring[0] = null;//new t.thing();			/* Which rings are being worn */
    cur_ring[1] = null;//new t.thing();			/* Which rings are being worn */
    let cur_weapon = new t.thing();			/* Which weapon he is weilding  (装備品)*/

    let inpack = 0;				/* Number of things in pack */
    let pack_used = Array(27);  /* Is the character used in the pack?  (インベントリ文字の使用状況)*/
    pack_used.fill(false);

    let quiet = 0;				/* Number of quiet turns */

    const GOLDCALC = (Math.floor(Math.random(50 + 10 * level)) + 2);
    const ISRING = (h,r)=>  {cur_ring[h] != null && cur_ring[h].o_which == r} //指定した手に特定のリングを着用しているか
    const ISWEARING =(r)=>  {return (ISRING(d.LEFT, r) || ISRING(d.RIGHT, r))}
    const ISMULT = (type)=> {return (type == d.POTION || type == d.SCROLL || type == d.FOOD)}

    this.player = player;
    this.amulet = amulet;
    this.to_death = to_death;
    this.kamikaze = kamikaze;

    this.isWearing = ISWEARING;

    this.packf = new packf(r);
    this.misc  = new miscf(r);
    /*
    **関連する関数（提案されるメソッドの例）:**
    *   `init_player()` (初期化)。
    *   `do_move()`, `do_run()` (移動)。
    *   `eat()`, `stomach()` (デーモン関数だが、プレイヤーの空腹状態に特化) (食料・空腹管理)。
    *   `quaff()`, `read_scroll()` (アイテム使用、効果は他のクラスとの連携で処理)。
    *   `wear()`, `take_off()`, `ring_on()`, `ring_off()`, `wield()` (装備管理)。
    *   `drop()`, `add_pack()`, `pick_up()`, `leave_pack()` (インベントリ操作)。
    *   `check_level()` (経験値・レベルアップ)。
    *   `add_str()`, `chg_str()` (筋力変更)。
    *   `add_haste()`, `unconfuse()`, `unsee()`, `sight()`, `nohaste()`, `come_down()`, `visuals()`, `land()` (状態異常管理)。
    *   `is_current()`, `levit_check()` (ステータスチェック)。
    **関連するメソッド**: `move()`, `attack()`, `useItem()`, `wieldWeapon()`, `wearArmor()`, 
    *   `quaffPotion()`, `readScroll()`, `eatFood()`, `dropItem()`, `pickUpItem()`, 
    *   `checkLevelUp()`, `chgStr()`, `addHaste()`, `teleport()`, `saveThrow()` など。
    */
    const on = (thing,flag)=>{return ((thing.t_flags & flag) != 0)};
    const isupper =(ch)=> { 
        if (Boolean(ch))    
            return (ch === ch.toUpperCase() && ch !== ch.toLowerCase());
        else
        {
            console.log(`isuppper:${ch}`);
            return false;
        } 
    }

    let step_ok;// = r.dungeon.step_ok;

    this.get_invstat = function(){
        let str = [];
        
        //str.push(`pstats: ${pstats}`);
        let wst = "";
        for (let i in this.packf.pack_used)
        {
            if (this.packf.pack_used[i])
                wst += String.fromCharCode(Number("a".charCodeAt(0)) + Number(i));//str.push(`pack${i}:${this.packf.pack_used[i]}`);
        }

        //str.push(`maxhp:${pstats.s_maxhp} exp:${pstats.s_exp} dmg:${pstats.s_dmg}`);

        //str.push(`mobs:${r.mobs.length}`);
        str.push(`pack:${wst}`);
        
        const eqc =(c)=>{
            if (!Boolean(c)) return "none_";
            return (c.o_packch == null)?"none":
            `${(c.o_damage != "0x0")?c.o_damage:c.o_arm} (${c.o_packch})${r.item.things.inv_name(c, false)}`;
        }

        str.push(`. ${eqc(cur_weapon)}`);
        str.push(`. ${eqc(cur_armor)}`);
        str.push(`R. ${eqc(cur_ring[0])}`);
        str.push(`L. ${eqc(cur_ring[1])}`);
        str.push("");
        //str.push(`armor: ${r.item.things.inv_name(cur_armor, false)} ${cur_armor.o_arm} (${cur_armor.o_packch})`);
        //str.push(`weapon: ${r.item.things.inv_name(cur_weapon, false)} ${cur_weapon.o_damage} (${cur_weapon.o_packch})`);
        //str.push(`ring_R ${r.item.things.inv_name(cur_ring[0], false)} ${cur_ring[0].o_which} (${cur_ring[0].o_packch})`);
        //str.push(`ring_L ${r.item.things.inv_name(cur_ring[1], false)} ${cur_ring[1].o_which} (${cur_ring[1].o_packch})`);
        str.push(`food_left ${food_left}`);
        str.push("");
        //str.push(`inpack ${inpack}`);
        //str.push(`amulet ${amulet}`);

        return str;
    }

    this.equip_state_check = function(ch){
        let equip_weapon = false;
        let equip_armor = false;
        let equip_ring_0 = false;
        let equip_ring_1 = false;
        
        if (Boolean(cur_weapon)){
            if ('o_packch' in cur_weapon) {
                if (ch == cur_weapon.o_packch) equip_weapon = true;
            }
        }
        if (Boolean(cur_armor)){
            if ('o_packch' in cur_armor) {
                if (ch == cur_armor.o_packch) equip_armor = true;
            }
        }
        if (Boolean(cur_ring[0])){
            if ('o_packch' in cur_ring[0]) {
                if (ch == cur_ring[0].o_packch) equip_ring_0 = true;
            }
        }
        if (Boolean(cur_ring[1])){
            if ('o_packch' in cur_ring[1]) {
                if (ch == cur_ring[1].o_packch) equip_ring_1 = true;
            }
        }
        return (equip_weapon || equip_armor ||
            equip_ring_0 || equip_ring_1);
    }

    this.get_status = function(){
        return {
            lvl: r.dungeon.get_level(),     //
            mhp: maxhp,     //
            pur: purse,     //(所持ゴールド)
            pstat: pstats,  //
            mstat: max_stats,   //
            hungs: hungry_state,//
            weap:cur_weapon,
            arm: cur_armor, //
            ring: cur_ring, //
            nocmd: no_command,  // (行動不能ターン数)
            nomov: no_move, //
            fdleft: food_left,  //
            death: to_death //
        }
    }

    this.get_purse =()=>{ return purse;}
    this.set_purse =(value)=>{ purse = value;}

    this.get_maxhp =()=>{ return maxhp;}
    this.set_maxhp =(value)=>{ maxhp = value;}

    this.get_pstat = ()=>{ return player.t_stats;}
    this.set_pstat = (stat)=>{player.t_stats = stat;}

    this.reset_inventry = function(){
        this.player.pack = r.free_list(this.player.pack);

        this.packf.reset();
        this.set_purse(0);
    }

    this.get_cur_weapon =()=>{ return cur_weapon;}
    this.set_cur_weapon =(th)=>{ cur_weapon = th;}

    this.get_cur_armor =()=>{ return cur_armor;}
    this.set_cur_armor =(th)=>{ cur_armor = th;}

    this.get_cur_ring =(number)=>{return cur_ring[number];}
    this.set_cur_ring =(number, th)=>{ cur_ring[number] = th;}

    this.get_pstats  = ()=>{ return pstats;}
    this.set_pstats  = (rs)=>{ pstats = rs;}

    this.get_max_stats = ()=>{ return max_stats;}
    this.set_max_stats = (rs)=>{max_stats = rs;}

    this.get_no_command = ()=>{ return no_command;}
    this.set_no_command = (num)=>{ no_command = num;}

    //this.packf = new packf(r);
    //this.misc  = new miscf(r);

    //プレイヤーの初期ステータス、食料、初期装備（リングメイル、食料、武器など）を設定します。
    this.init_player = function(){
        step_ok = r.dungeon.step_ok;

        let obj; //THING *obj;

        player = new t.thing(); 
        player.t_stats = new t.stats(d.INIT_STATS);
        pstats = player.t_stats; 
        pack   = player.t_pack;
        proom  = player.t_room;
        hero   = player.t_pos; 
        maxhp  = player.t_stats.s_maxhp;

        this.player = player;

        //player = new t.thing();
        //this.player = player;
        //pstats 
        player.t_stats.init(d.INIT_STATS);	/* The maximum for the player */

        food_left = d.HUNGERTIME;
        /*
        * Give him some food
        */
        obj = r.item.new_item();
        obj.o_type = d.FOOD;
        obj.o_count = 1;
        this.packf.add_pack(obj, true);
        /*
        * And his suit of armor
        */
        obj = r.item.new_item();
        obj.o_type = d.ARMOR;
        obj.o_which = d.RING_MAIL;
        obj.o_arm = r.item.a_class[d.RING_MAIL] - 1;
        obj.o_flags |= d.ISKNOW;
        obj.o_count = 1;
        cur_armor = obj;
        this.packf.add_pack(obj, true);
        /*
        * Give him his weaponry.  First a mace.
        */
        obj = r.item.new_item();
        r.item.init_weapon(obj, d.MACE);
        obj.o_hplus = 1;
        obj.o_dplus = 1;
        obj.o_flags |= d.ISKNOW;
        this.packf.add_pack(obj, true);
        cur_weapon = obj;
        /*
        * Now a +1 bow
        */
        obj = r.item.new_item();
        r.item.init_weapon(obj, d.BOW);
        obj.o_hplus = 1;
        obj.o_flags |= d.ISKNOW;
        this.packf.add_pack(obj, true);
        /*
        * Now some arrows
        */
        obj = r.item.new_item();
        r.item.init_weapon(obj, d.ARROW);
        obj.o_count = r.rnd(15) + 25;
        obj.o_flags |= d.ISKNOW;
        this.packf.add_pack(obj, true);
        /*
        * Give him some food
        */
        obj = r.item.new_item();
        obj.o_type = d.FOOD;
        obj.o_count = 1;
        this.packf.add_pack(obj, true);
        /*
        * Give him some food
        */
        obj = r.item.new_item();
        obj.o_type = d.FOOD;
        obj.o_count = 1;
        this.packf.add_pack(obj, true);

        r.UI.comment("init_player");
    }
    //プレイヤーの空腹状態を管理し、食料の消化を行い、飢餓による影響を処理します。
    this.stomach = function(){
        //daemon
        let oldfood; //register int oldfood;
        let orig_hungry = hungry_state;	//int orig_hungry = hungry_state;

        if (food_left <= 0)
        {
            if (food_left-- < -d.STARVETIME)
                r.death('s');
            /*
            * the hero is fainting
            */
            if (no_command || r.rnd(5) != 0)
                return;
            no_command += r.rnd(8) + 4;
            hungry_state = 3;
            if (!terse)
                r.UI.addmsg(choose_str("the munchies overpower your motor capabilities.  ",
                        "you feel too weak from lack of food.  "));
            r.UI.msg(choose_str("You freak out", "You faint"));
        }
        else
        {
            oldfood = food_left;
            food_left -= r.item.rings.ring_eat(d.LEFT) + r.item.rings.ring_eat(d.RIGHT) + 1 - (amulet?1:0);

            if (food_left < d.MORETIME && oldfood >= d.MORETIME)
            {
                hungry_state = 2;
                r.UI.msg(choose_str("the munchies are interfering with your motor capabilites",
                    "you are starting to feel weak"));
            }
            else if (food_left < 2 * d.MORETIME && oldfood >= 2 * d.MORETIME)
            {
                hungry_state = 1;
                if (terse)
                    r.UI.msg(choose_str("getting the munchies", "getting hungry"));
                else
                    r.UI.msg(choose_str("you are getting the munchies",
                        "you are starting to get hungry"));
            }
        }
        if (hungry_state != orig_hungry) { 
            player.t_flags &= ~d.ISRUN; 
            r.running = false; 
            to_death = false; 
            count = 0; 
        } 
        //r.UI.comment("d-stomach");
    }
    /*	Choose the first or second string depending on whether it the
    *	player is tripping
    */
    //char *
    // -> PlayerManager, fight.js (function)
    function choose_str(ts, ns)
    {
        return (on(player, d.ISHALU) ? ts : ns);
    }

    /*
    * doctor:
    *	A healing daemon that restors hit points after rest
    *　プレイヤーのHPを回復させるヒーリングデーモンです。
    */
    this.doctor = function(){
        //daemon
        let lv, ohp;	//register int lv, ohp;

        lv = pstats.s_lvl;
        ohp = pstats.s_hpt;
        quiet++;
        if (lv < 8)
        {
            if (quiet + (lv << 1) > 20)
                pstats.s_hpt++;
        }
        else
        if (quiet >= 3)
            pstats.s_hpt += rnd(lv - 7) + 1;
        if (ISRING(d.LEFT, d.R_REGEN))
            pstats.s_hpt++;
        if (ISRING(d.RIGHT, d.R_REGEN))
            pstats.s_hpt++;
        if (ohp != pstats.s_hpt)
        {
            if (pstats.s_hpt > maxhp)
                pstats.s_hpt = maxhp;
            quiet = 0;
        }
        //r.UI.comment("d-doctor");
    }
    /*
    *　visuals()
    *　プレイヤーが幻覚状態のときに画面上のオブジェクトやモンスターの表示をランダムに変更します。
    */ 
    this.visuals = function(){
        //daemon
        let tp;	//register THING *tp;
        let seemonst;	//register bool seemonst;

        if (!r.after || (r.running && r.jump))
            return;
        /*
        * change the things
        */
        for (tp = r.dungeon.lvl_obj; tp != null; tp = tp.l_next)
        if (cansee(tp.o_pos.y, tp.o_pos.x))
            r.UI.mvaddch(tp.o_pos.y, tp.o_pos.x, rnd_thing());

        /*
        * change the stairs
        */
        //if (!seenstairs && cansee(stairs.y, stairs.x))
        //    r.UI.mvaddch(stairs.y, stairs.x, rnd_thing());

        /*
        * change the monsters
        */
        seemonst = on(player, d.SEEMONST);
        for (tp = r.dungeon.mlist; tp != null; tp = tp.l_next)
        {
            r.UI.move(tp.t_pos.y, tp.t_pos.x);
            if (r.player.see_monst(tp))
            {
                if (tp.t_type == 'X' && tp.t_disguise != 'X')
                    r.UI.addch(rnd_thing());
                else
                    r.UI.addch(String.fromCharCode(rnd(26) + 'A'.charCodeAt(0)));
            }
            else if (seemonst)
            {
                //standout();
                r.UI.addch(String.fromCharCode(rnd(26) + 'A'.charCodeAt(0)));
                //standend();
            }
        }
    }

    /*
    * add_pack:
    *	Pick up an object and add it to the pack.  If the argument is
    *	non-null use it as the linked_list pointer instead of gettting
    *	it off the ground.
    * オブジェクトをプレイヤーのパックに追加します。スケアモンスターのスクロールの特殊処理、同じタイプのスタック可能なアイテムのまとめ、
    * モンスターのターゲットが拾われたアイテムだった場合の処理、Amulet of Yendorが拾われた場合のフラグ設定などを行います。
    */
    //this.add_pack = this.packf.add_pack;
    
    /*
	* floor_ch:
	*	Return the appropriate floor character for her room
	* プレイヤーの部屋の適切な床文字を返します。
	*/
	this.floor_ch = function()
	{
        let proom = r.player.player.t_room;
		if (proom.r_flags & d.ISGONE)
			return d.PASSAGE;
		return (this.show_floor() ? d.FLOOR : ' ');
	}
    
    /*
    * show_floor:
    *	Should we show the floor in her room at this time?
    * 部屋の床を表示するかどうかを判定します。
    */
    this.show_floor = function()
    {
        let proom = r.player.player.t_room;
        if ((proom.r_flags & (d.ISGONE|d.ISDARK)) == d.ISDARK && !on(player, d.ISBLIND))
            return see_floor;
        else
            return true;
    }

    /*
	* move_msg:
	*	Print out the message if you are just moving onto an object
	* オブジェクトの上に移動したときのメッセージを表示します。
	*/
    this.move_msg = function(obj)
	{
		if (!terse)
		r.UI.addmsg("you ");
		r.UI.msg(`moved onto ${r.item.things.inv_name(obj, true)}`);
	}
    /*
    * enter_room:
    *	Code that is executed whenver you appear in a room
    * 
    */
    this.enter_room = function(cp){
        return r.dungeon.roomf.enter_room(cp);
    }

    /*
    * see_monst:
    *	Return TRUE if the hero can see the monster
    * プレイヤーが特定のモンスターを見ることができるかどうかを判定します。
    */
    //bool
    //see_monst(THING *mp)
    this.see_monst = function(mp){

        const dist = (y1, x1, y2, x2)=>{ return ((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)); }
        //console.log("see_monst p")
        
        let y, x;

        if (on(player, d.ISBLIND))
            return false;
        if (on(mp, d.ISINVIS) && !on(player, d.CANSEE))
            return false;
        y = mp.t_pos.y;
        x = mp.t_pos.x;
        if (dist(y, x, hero.y, hero.x) < d.LAMPDIST)
        {
            //console.log(`${dist(y, x, hero.y, hero.x)} < ${d.LAMPDIST}`);
            if (y != hero.y && x != hero.x &&
                !step_ok(r.dungeon.chat(y, hero.x)) && !step_ok(r.dungeon.chat(hero.y, x)))
                ;//return false; 
            return true;
        }
        if (mp.t_room != player.t_room)
            return false;
        return (!(mp.t_room.r_flags & d.ISDARK));
    }

    /*
    * dist:
    *	Calculate the "distance" between to points.  Actually,
    *	this calculates d^2, not d, but that's good enough for
    *	our purposes, since it's only used comparitively.
    */
    function dist(y1, x1, y2, x2)
    {
        return ((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }
    
    //this.do_move = function(y, x){
    //    hero.x += x;
    //    hero.y += y;
    //}
    
    let nh = {};//coord nh;

    //| **move.c** | `do_move()` | `no_move` (行動不能ターン数), `firstmove` (初動フラグ), `runch` (走行方向文字), `level` (現在の階層), `pstats` (プレイヤーの統計情報), `cur_armor` (装備中の防具) | |
    //| | `rust_armor()` | `to_death` (戦死フラグ), `terse` (メッセージ表示オプション) | |

    /*
    * do_run:
    *	Start the hero running
    *プレイヤーを走らせるコマンド処理を開始します。
    */
    this.do_run = function(ch)
    {
        running = true;
        after = false;
        runch = ch;
    }

    /*
    * do_move:
    *	Check to see that a move is legal.  If it is handle the
    * consequences (fighting, picking up, etc.)
    * プレイヤーの移動が合法であるかをチェックし、その結果（戦闘、アイテム収集、罠の作動など）を処理します。
    * 混乱状態での移動、画面端や対角移動のチェックを含みます。
    */
    this.do_move = function(dy, dx)
    {
        
        if (hero.x + dx < 0 || hero.x + dx >= d.NUMCOLS || hero.y + dy <= 0 || hero.y + dy >= d.NUMLINES - 1){
            //console.log("overscreen do_move");
            return;
        }
        //if (!r.after){
        //    r.after = true;
        //    return;
        //}

        hit_bound =()=>{
            if (r.passgo && r.running && (proom.r_flags & d.ISGONE)
            && !on(player, d.ISBLIND))
            {
                let	b1, b2;
                switch (runch)
                {
                    case 'h':
                    case 'l':
                        b1 = (hero.y != 1 && turn_ok(hero.y - 1, hero.x));
                        b2 = (hero.y != d.NUMLINES - 2 && turn_ok(hero.y + 1, hero.x));
                        if (!(b1 ^ b2))
                            break;
                        if (b1)
                        {
                            runch = 'k';
                            dy = -1;
                        }
                        else
                        {
                            runch = 'j';
                            dy = 1;
                        }
                        dx = 0;
                        turnref();

                        nh.y = hero.y + dy;
                        nh.x = hero.x + dx;
                        break;
                    case 'j':
                    case 'k':
                        b1 = (hero.x != 0 && turn_ok(hero.y, hero.x - 1));
                        b2 = (hero.x != d.NUMCOLS - 1 && turn_ok(hero.y, hero.x + 1));
                        if (!(b1 ^ b2))
                            break;
                        if (b1)
                        {
                            runch = 'h';
                            dx = -1;
                        }
                        else
                        {
                            runch = 'l';
                            dx = 1;
                        }
                        dy = 0;
                        turnref();
                        nh = {y: hero.y + dy, x: hero.x + dx}

                        //nh.y = hero.y + dy;
                        //nh.x = hero.x + dx;
                        break;
                }
            }
        }
        const move_stuff =()=>{
            r.UI.mvaddch(hero.y, hero.x, this.floor_at());
            if ((fl & d.F_PASS) && r.dungeon.chat(r.oldpos.y, r.oldpos.x) == d.DOOR)
                r.dungeon.roomf.leave_room(nh);
            hero = nh;
            r.player.player.t_pos = hero;//nh;
        }

        let ch, fl;

        firstmove = false;
        if (no_move)
        {
            no_move--;
            r.UI.msg("you are still stuck in the bear trap");
            return;
        }
        /*
        * Do a confused move (maybe)
        */
        if (on(player, d.ISHUH) && r.rnd(5) != 0)
        {
            nh = this.rndmove(player);
            if ((nh.x == hero.x)&&(nh.y == hero.y))
                {
                    r.after = false;
                    r.running = false;
                    to_death = false;
                    return;
                }
        }
        else
        {
            nh.y = hero.y + dy;
            nh.x = hero.x + dx;
            //nh = {y: hero.y + dy, x: hero.x + dx}
        }

        /*
        * Check if he tried to move off the screen or make an illegal
        * diagonal move, and stop him if he did.
        */
        if (nh.x < 0 || nh.x >= d.NUMCOLS || nh.y < 0 || nh.y >= d.NUMLINES - 1){
            hit_bound();
            //r.running = false;
            //r.after = false;

            //nh.y -= dy;
            //nh.x -= dx;
        }   
        if (!this.diag_ok(hero, nh))
        {
            r.after = false;
            r.running = false;
            return;
        }
        if (r.running && ((nh.x == hero.x)&&(nh.y == hero.y)))
            r.after = r.running = false;
        fl = r.dungeon.flat(nh.y, nh.x);
        ch = r.dungeon.winat(nh.y, nh.x); //console.log(ch);
        if (!(fl & d.F_REAL) && ch == d.FLOOR)
        {
            if (!on(player, d.ISLEVIT))
            {
                r.dungeon.chat(nh.y, nh.x) = ch = d.TRAP;
                r.dungeon.flat(nh.y, nh.x) |= d.F_REAL;
            }
        }
        else if (on(player, d.ISHELD) && ch != 'F')
        {
            r.UI.msg("you are being held");
            //動作異常の為、解除
            //return;
        }
        //現状移動系の状態変化/異常は無効とする(混乱/高速移動/浮遊/拘束)2025/11/01

        switch (ch)
        {
            case ' ':
            case '|':
            case '-':
                hit_bound()
                r.running = false;
                r.after = false;

                nh.y -= dy;
                nh.x -= dx;

                break;
            case d.DOOR:
                r.running = false;
                //console.log((r.dungeon.flat(hero.y, hero.x) & d.F_PASS))
                if (r.dungeon.flat(hero.y, hero.x) & d.F_PASS)
                    this.enter_room(nh);
                move_stuff();
                //console.log("door");
                break;
            case d.TRAP:
                ch = be_trapped(nh);
                if (ch == d.T_DOOR || ch == d.T_TELEP)
                    return;
                move_stuff();
                break;
            case d.PASSAGE:
                /*
                * when you're in a corridor, you don't know if you're in
                * a maze room or not, and there ain't no way to find out
                * if you're leaving a maze room, so it is necessary to
                * always recalculate proom.
                */
                proom = r.dungeon.roomin(hero);
                move_stuff();
                //console.log("passage");
                break;
            case d.FLOOR:
                if (!(fl & d.F_REAL))
                be_trapped(hero);
                move_stuff();
                //console.log("floor");
                break;
            case d.STAIRS:
                seenstairs = true;
                //console.log("stairs");
                /* FALLTHROUGH */
                break;
            default:
                r.running = false;
                if (isupper(ch) || r.dungeon.moat(nh.y, nh.x)){
                    //battle

                    r.UI.battleEffect("+",
                        nh.x, nh.y
                    )

                    r.monster.battle.fight(nh, cur_weapon, false);

                    r.running = false;
                    r.after = false;

                    nh.y -= dy;
                    nh.x -= dx;
                }
                else
                {
                    if (ch != d.STAIRS)
                        take = ch;
                    move_stuff();
                }
        }
        return ch;
    }

    /*
    * turn_ok:
    *	Decide whether it is legal to turn onto the given space
    *指定されたマスに曲がることが合法であるかを判定します。
    */
    this.turn_ok = function(y, x)
    {
        let pp;//PLACE *pp;

        pp = r.dungeon.INDEX(y, x);
        return (pp.p_ch == d.DOOR
        || (pp.p_flags & (d.F_REAL|d.F_PASS)) == (d.F_REAL|d.F_PASS));
    }

    /*
    * turnref:
    *	Decide whether to refresh at a passage turning or not
    * 通路の曲がり角での画面更新を決定します。
    */
    this.turnref = function()
    {
        let pp;//PLACE *pp;

        pp = r.dungeon.INDEX(hero.y, hero.x);
        if (!(pp.p_flags & d.F_SEEN))
        {
        if (jump)
        {
            leaveok(stdscr, true);
            refresh();
            leaveok(stdscr, false);
        }
        pp.p_flags |= d.F_SEEN;
        }
    }

    /*
    * door_open:
    *	Called to illuminate a room.  If it is dark, remove anything
    *	that might move.
    *部屋を照らし、暗い部屋のモンスターを画面から消去します。
    */
    this.door_open = function(rp) //struct room *rp)
    {
        let y, x;

        if (!(rp.r_flags & d.ISGONE))
        for (y = rp.r_pos.y; y < rp.r_pos.y + rp.r_max.y; y++)
            for (x = rp.r_pos.x; x < rp.r_pos.x + rp.r_max.x; x++)
                if (isupper(r.dungeon.winat(y, x)))
                    {r.monster.wake_monster(y, x);};
        r.UI.comment("door_open");

    }

    /*
    * be_trapped:
    *	The guy stepped on a trap.... Make him pay.
    *プレイヤーが罠にかかったときの処理を行います（テレポート、行動不能、ダメージ、防具の錆びなど）。
    */
    this.be_trapped = function(tc) //coord *tc)
    {
        let pp;//PLACE *pp;
        let arrow;//THING *arrow;
        let tr;

        if (on(player, d.ISLEVIT))
            return d.T_RUST;	/* anything that's not a door or teleport */
        running = false;
        count = false;
        pp = r.dungeon.INDEX(tc.y, tc.x);
        pp.p_ch = d.TRAP;
        tr = pp.p_flags & d.F_TMASK;
        pp.p_flags |= d.F_SEEN;
        switch (tr)
        {
        case d.T_DOOR:
            let level = r.dungeon.get_level();
            r.dungeon.set_level(++level);
            r.dungeon.new_level();
            r.UI.msg("you fell into a trap!");
            break;
        case d.T_BEAR:
            no_move += d.BEARTIME;
            r.UI.msg("you are caught in a bear trap");
            break;
        case d.T_MYST:
            switch(r.rnd(11))
            {
                case 0: r.UI.msg("you are suddenly in a parallel dimension");    break;
                case 1: r.UI.msg("the light in here suddenly seems %s", rainbow[rnd(cNCOLORS)]);break;
                case 2: r.UI.msg("you feel a sting in the side of your neck");   break;
                case 3: r.UI.msg("multi-colored lines swirl around you, then fade"); break;
                case 4: r.UI.msg("a %s light flashes in your eyes", rainbow[rnd(cNCOLORS)]); break;
                case 5: r.UI.msg("a spike shoots past your ear!");   break;
                case 6: r.UI.msg("%s sparks dance across your armor", rainbow[rnd(cNCOLORS)]);break;
                case 7: r.UI.msg("you suddenly feel very thirsty");break;
                case 8: r.UI.msg("you feel time speed up suddenly");break;
                case 9: r.UI.msg("time now seems to be going slower");break;
                case 10: r.UI.msg("you pack turns %s!", rainbow[rnd(cNCOLORS)]);break;
            }
            break;
        case d.T_SLEEP:
            no_command += d.SLEEPTIME;
            player.t_flags &= ~d.ISRUN;
            r.UI.msg("a strange white mist envelops you and you fall asleep");
            break;
        case d.T_ARROW:
            if (swing(pstats.s_lvl - 1, pstats.s_arm, 1))
            {
            pstats.s_hpt -= r.roll(1, 6);
            if (pstats.s_hpt <= 0)
            {
                r.UI.msg("an arrow killed you");
                r.death('a');
            }
            else
                r.UI.msg("oh no! An arrow shot you");
            }
            else
            {
                arrow = new_item();
                init_weapon(arrow, d.ARROW);
                arrow.o_count = 1;
                arrow.o_pos = hero;
                fall(arrow, false);
                r.UI.msg("an arrow shoots past you");
            }
            break;
        case d.T_TELEP:
            /*
            * since the hero's leaving, look() won't put a TRAP
            * down for us, so we have to do it ourself
            */
            teleport();
            mvaddch(tc.y, tc.x, d.TRAP);
            break;
        case d.T_DART:
            if (!swing(pstats.s_lvl+1, pstats.s_arm, 1))
                r.UI.msg("a small dart whizzes by your ear and vanishes");
            else
            {
            pstats.s_hpt -= r.roll(1, 4);
            if (pstats.s_hpt <= 0)
            {
                r.UI.msg("a poisoned dart killed you");
                r.death('d');
            }
            if (!ISWEARING(d.R_SUSTSTR) && !save(d.VS_POISON))
                player.misc.chg_str(-1);
            r.UI.msg("a small dart just hit you in the shoulder");
            }
            break;
        case d.T_RUST:
            r.UI.msg("a gush of water hits you on the head");
            rust_armor(cur_armor);
            break;
        }
        //flush_type();

        r.UI.comment("be_trapped");

        return tr;
    }

    /*
    * rndmove:
    *	Move in a random direction if the monster/person is confused
    * 混乱状態のモンスター/プレイヤーがランダムな方向に移動します。
    */

    this.rndmove = function(who) //THING *who)
    {
        let obj; //THING *obj;
        let x, y;
        let ch;
        let ret = {}; //static coord ret;  /* what we will be returning */

        y = ret.y = who.t_pos.y + r.rnd(3) - 1;
        x = ret.x = who.t_pos.x + r.rnd(3) - 1;
        /*
        * Now check to see if that's a legal move.  If not, don't move.
        * (I.e., bump into the wall or whatever)
        */
        if (y == who.t_pos.y && x == who.t_pos.x)
            return ret;
        if (!this.diag_ok(who.t_pos, ret))
        {
            ret = who.t_pos;
            return ret;
        }
        else
        {
            ch = r.dungeon.winat(y, x);
            if (!step_ok(ch)){
                ret = who.t_pos;
                return ret;
            }
            if (ch ==d.SCROLL)
            {
                for (obj = r.dungeon.lvl_obj; obj != null; obj = obj.l_next)
                if (y == obj.o_pos.y && x == obj.o_pos.x)
                    break;
                if (obj != null && obj.o_which == d.S_SCARE){
                    ret = who.t_pos;
                    return ret;
                }
            }
        }
        return ret;
    }

    /*
    * rust_armor:
    *	Rust the given armor, if it is a legal kind to rust, and we
    *	aren't wearing a magic ring.
    *防具を錆びさせます。
    */
    this.rust_armor = function(arm) //THING *arm)
    {
        if (arm == null || arm.o_type != d.ARMOR || arm.o_which == d.LEATHER ||
        arm.o_arm >= 9)
            return;

        if ((arm.o_flags & d.ISPROT) || ISWEARING(d.R_SUSTARM))
        {
            if (!to_death)
                r.UI.msg("the rust vanishes instantly");
        }
        else
        {
            arm.o_arm++;
            //if (!terse)
                r.UI.msg("your armor appears to be weaker now. Oh my!");
            //else
            //    msg("your armor weakens");
        }
    }
    /*
    * diag_ok:
    *	Check to see if the move is legal if it is diagonal
    */
    this.diag_ok = function(sp, ep) //coord *sp, coord *ep)
    {
        if (ep.x < 0 || ep.x >= d.NUMCOLS || ep.y <= 0 || ep.y >= d.NUMLINES - 1)
            return false;
        if (ep.x == sp.x || ep.y == sp.y)
            return true;
        return (step_ok(r.dungeon.chat(ep.y, sp.x)) && step_ok(r.dungeon.chat(sp.y, ep.x)));
    }
    /*
    * floor_at:
    *	Return the character at hero's position, taking see_floor
    *	into account
    */
    this.floor_at = function()
    {
        let ch;

        ch = r.dungeon.chat(hero.y, hero.x);
        if (ch == d.FLOOR)
        ch = this.floor_ch();
        return ch;
    }

    // deamons 
    /*
    * unconfuse:
    *	Release the poor player from his confusion
    */
    this.unconfuse = function()
    {
        player.t_flags &= ~d.ISHUH;
        r.UI.msg(`you feel less ${choose_str("trippy", "confused")} now`);
    }

    /*
    * unsee:
    *	Turn off the ability to see invisible
    */
    //void
    this.unsee = function()
    {
        let th; //register THING *th;

        for (th = r.dungeon.mlist; th != null; th = th.l_next)
        if (on(th, d.ISINVIS) && this.see_monst(th))
            r.UI.mvaddch(th.t_pos.y, th.t_pos.x, th.t_oldch);
        player.t_flags &= ~d.CANSEE;
    }

    /*
    * sight:
    *	He gets his sight back
    */
    //void
    this.sight = function()
    {
        if (on(player, d.ISBLIND))
        {
            r.daemon.extinguish(this.sight);
            player.t_flags &= ~d.ISBLIND;
            if (!(proom.r_flags & d.ISGONE))
                this.enter_room(hero);
            r.UI.msg(choose_str("far out!  Everything is all cosmic again",
                    "the veil of darkness lifts"));
        }
    }

    /*
    * nohaste:
    *	End the hasting
    */
    //void
    this.nohaste = function()
    {
        player.t_flags &= ~d.ISHASTE;
        r.UI.msg("you feel yourself slowing down");
    }

	/*
	* eat:
	*	She wants to eat something, so let her try
	*/
	this.eat = function(obj) //
	{
		const fruit = "slime-mold";
		//let obj; //THING *obj;

		//if ((obj = r.player.packf.get_item("eat", d.FOOD)) == null)
			//return;
		if (obj.o_type != d.FOOD)
		{
			if (!terse)
				r.UI.msg("ugh, you would get ill if you ate that");
			else
				r.UI.msg("that's Inedible!");
			return;
		}
		if (food_left < 0)
			food_left = 0;
		if ((food_left += d.HUNGERTIME - 200 + r.rnd(400)) > d.STOMACHSIZE)
			food_left = d.STOMACHSIZE;
		hungry_state = 0;
		if (obj == cur_weapon)
			cur_weapon = null;
		if (obj.o_which == 1)
			r.UI.msg(`my, that was a yummy ${fruit}`);
		else
		if (r.rnd(100) > 70)
		{
			pstats.s_exp++;
			r.UI.msg(`${choose_str("bummer", "yuk")}, this food tastes awful`);
			r.player.misc.check_level();
		}
		else
			r.UI.msg(`${choose_str("oh, wow", "yum")}, that tasted good`);
		r.player.packf.leave_pack(obj, false, false);
	}

    /*
    * come_down:
    *	Take the hero down off her acid trip.
    */
    //void
    this.come_down = function()
    {
        let tp;	//register THING *tp;
        let seemonst;	//register bool seemonst;

        if (!on(player, d.ISHALU))
            return;

        r.daemon.kill_daemon(this.visuals);
        player.t_flags &= ~d.ISHALU;

        if (on(player, d.ISBLIND))
            return;

        /*
        * undo the things
        */
        for (tp = lvl_obj; tp != null; tp = tp.l_next )
        if (this.cansee(tp.o_pos.y, tp.o_pos.x))
            r.UI.mvaddch(tp.o_pos.y, tp.o_pos.x, tp.o_type);

        /*
        * undo the monsters
        */
        seemonst = on(player, d.SEEMONST);
        for (tp = mlist; tp != null; tp = tp.l_next)
        {
        r.UI.move(tp.t_pos.y, tp.t_pos.x);
        if (this.cansee(tp.t_pos.y, tp.t_pos.x))
            if (!on(tp, d.ISINVIS) || on(player, d.CANSEE))
                r.UI.addch(tp.t_disguise);
            else
                r.UI.addch(chat(tp.t_pos.y, tp.t_pos.x));
        else if (seemonst)
        {
            //standout();
            r.UI.addch(tp.t_type);
            //standend();
        }
        }
        r.UI.msg("Everything looks SO boring now.");
    }

    /*
    * land:
    *	Land from a levitation potion
    */
    //void
    this.land = function()
    {
        player.t_flags &= ~d.ISLEVIT;
        r.UI.msg(choose_str("bummer!  You've hit the ground",
            "you float gently to the ground"));
    }

    /*
    * cansee:
    *	Returns true if the hero can see a certain coordinate.
    */
    //bool
    this.cansee = function(y, x)//int y, int x)
    {
        const dist =(y1, x1, y2, x2)=>
        {
            return ((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        }

        let rer;	//register struct room *rer;
        let tp = {};		//static coord tp;

        if (on(player, d.ISBLIND))
            return false;
        if (dist(y, x, hero.y, hero.x) < d.LAMPDIST)
        {
            if (r.dungeon.flat(y, x) & d.F_PASS)
                if (y != hero.y && x != hero.x &&
                !r.dungeon.step_ok(r.dungeon.chat(y, hero.x)) && !r.dungeon.step_ok(r.dungeon.chat(hero.y, x)))
                    return false;
            return true;
        }
        /*
        * We can only see if the hero in the same room as
        * the coordinate and the room is lit or if it is close.
        */
        tp.y = y;
        tp.x = x;
        return ((rer = r.dungeon.roomin(tp)) == proom && !(rer.r_flags & d.ISDARK));	//(bool)
    }

    /*
    * save_throw:
    *	See if a creature save against something
    */
    //int
    function save_throw(which, tp)//THING tp)
    {
        let need;

        need = 14 + which - tp.t_stats.s_lvl / 2;
        return (r.roll(1, 20) >= need);
    }

    /*
    * save:
    *	See if he saves against various nasty things
    */
    //int
    this.save = function(which)
    {
        //r.player.

        if (which == d.VS_MAGIC)
        {
        if (ISRING(d.LEFT, d.R_PROTECT))
            which -= cur_ring[LEFT].o_arm;
        if (ISRING(d.RIGHT, d.R_PROTECT))
            which -= cur_ring[d.RIGHT].o_arm;
        }
        return save_throw(which, player);
    }

}
