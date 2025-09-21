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
    player.t_states = new t.stats(d.INIT_STATS);//[0,0,0,0,0,0,0]);
    let pstats = player.t_stats // (プレイヤーの統計情報) プレイヤーの統計情報 (Str, HPなど)
    let pack   = player.t_pack  // (プレイヤーインベントリ) プレイヤーのインベントリリスト
    let proom  = player.t_room // プレイヤーがいる部屋
    let hero   = player.t_pos; // (プレイヤー位置)
    let maxhp  = player.t_states.s_maxhp; //プレイヤーの最大HP

    let max_stats  = new t.stats(d.INIT_STATS); 

    let food_left;			/* Amount of food in hero's stomach (食料残量)*/
    let hungry_state = 0;   /* How hungry is he  (空腹状態)*/	
    let no_command = 0;	/* Number of turns asleep  (行動不能ターン数)*/
    let no_move = 0;    /* Number of turns held in place (行動不能ターン数)*/		
    let purse = 0;  /* How much gold he has  (所持ゴールド)*/
    let level = 1;  /* What level she is on (現在の階層)*/
    let see_floor = true;	/* Show the lamp illuminated floor */
    let terse = false;		/* true if we should be short (メッセージ表示オプション)*/
    let to_death = false;	/* Fighting is to the death! (戦死フラグ)*/
    
    let amulet = false; /* He found the amulet */ 

    let cur_armor = new t.thing(); 			/* What he is wearing (装備中の防具)*/
    let cur_ring = [];  // (装備中の指輪)
    cur_ring[0] = new t.thing();			/* Which rings are being worn */
    cur_ring[1] = new t.thing();			/* Which rings are being worn */
    let cur_weapon = new t.thing();			/* Which weapon he is weilding  (装備品)*/

    let inpack = 0;				/* Number of things in pack */
    let pack_used = Array(27);  /* Is the character used in the pack?  (インベントリ文字の使用状況)*/
    pack_used.fill(false);

    const GOLDCALC = (Math.floor(Math.random(50 + 10 * level)) + 2);
    const ISRING = (h,r)=>  {cur_ring[h] != null && cur_ring[h].o_which == r} //指定した手に特定のリングを着用しているか
    const ISWEARING =(r)=>  {return (ISRING(d.LEFT, r) || ISRING(d.RIGHT, r))}
    const ISMULT = (type)=> {return (type == d.POTION || type == d.SCROLL || type == d.FOOD)}

    this.player = player;
    this.amulet = amulet;
    this.to_death = to_death;

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
    const isupper =(ch)=> { return ch === ch.toUpperCase() && ch !== ch.toLowerCase(); }

    this.get_invstat = function(){
        let str = [];
        str.push("pstat:");
        str.push("pack:");
        str.push("cur_armor");
        str.push("cur_weapon");
        str.push("cur_ring");
        str.push("inpack");
        str.push("amulet");

        return str;
    }

    this.get_status = function(){
        return {
            lvl: level,     //
            mhp: maxhp,     //
            pur: purse,     //(所持ゴールド)
            pstat: pstats,  //
            mstat: max_stats,   //
            hungs: hungry_state,//
            arm: cur_armor, //
            ring: cur_ring, //
            nocmd: no_command,  // (行動不能ターン数)
            nomov: no_move, //
            fdleft: food_left,  //
            death: to_death //
        }
    }

    //プレイヤーの初期ステータス、食料、初期装備（リングメイル、食料、武器など）を設定します。
    this.init_player = function(){
        let obj; //THING *obj;

        pstats = new t.stats(d.INIT_STATS);	/* The maximum for the player */
        food_left = d.HUNGERTIME;
        /*
        * Give him some food
        */
        obj = r.item.new_item();
        obj.o_type = d.FOOD;
        obj.o_count = 1;
        this.add_pack(obj, true);
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
        this.add_pack(obj, true);
        /*
        * Give him his weaponry.  First a mace.
        */
        obj = r.item.new_item();
        r.item.init_weapon(obj, d.MACE);
        obj.o_hplus = 1;
        obj.o_dplus = 1;
        obj.o_flags |= d.ISKNOW;
        this.add_pack(obj, true);
        cur_weapon = obj;
        /*
        * Now a +1 bow
        */
        obj = r.item.new_item();
        r.item.init_weapon(obj, d.BOW);
        obj.o_hplus = 1;
        obj.o_flags |= d.ISKNOW;
        this.add_pack(obj, true);
        /*
        * Now some arrows
        */
        obj = r.item.new_item();
        r.item.init_weapon(obj, d.ARROW);
        obj.o_count = r.rnd(15) + 25;
        obj.o_flags |= d.ISKNOW;
        this.add_pack(obj, true);

        r.UI.comment("init_player");
    }
    //プレイヤーの空腹状態を管理し、食料の消化を行い、飢餓による影響を処理します。
    this.stomach = function(){
        //daemon
    }
    /*
    * doctor:
    *	A healing daemon that restors hit points after rest
    *　プレイヤーのHPを回復させるヒーリングデーモンです。
    */
    this.doctor = function(){
        //daemon
    }
    /*
    *　visuals()
    *　プレイヤーが幻覚状態のときに画面上のオブジェクトやモンスターの表示をランダムに変更します。
    */ 
    this.visuals = function(){
        //daemon

    }

    /*
    * add_pack:
    *	Pick up an object and add it to the pack.  If the argument is
    *	non-null use it as the linked_list pointer instead of gettting
    *	it off the ground.
    * オブジェクトをプレイヤーのパックに追加します。スケアモンスターのスクロールの特殊処理、同じタイプのスタック可能なアイテムのまとめ、
    * モンスターのターゲットが拾われたアイテムだった場合の処理、Amulet of Yendorが拾われた場合のフラグ設定などを行います。
    */
    this.add_pack = function(obj, silent){
		//THING *op, *lp;
		let op, lp;
		//bool from_floor;
		let from_floor;

		from_floor = false;
		if (!Boolean(obj))
		{
			obj = r.dungeon.find_obj(hero.y, hero.x);
			if (obj == null)
				return;
			from_floor = true;
		}

		/*
		* Check for and deal with scare monster scrolls
		*/
		if (obj.o_type == d.SCROLL && obj.o_which == d.S_SCARE)
		if (obj.o_flags & d.ISFOUND)
		{
			r.detach(r.dungeon.lvl_obj, obj);
			r.UI.mvaddch(v.hero.y, v.hero.x, this.floor_ch());
			r.dungeon.chat(hero.y, hero.x) = (proom.r_flags & d.ISGONE) ? d.PASSAGE : d.FLOOR;
			r.discard(obj);
			r.UI.msg("the scroll turns to dust as you pick it up");
			return;
		}

		if (!Boolean(pack))
        {
			pack = obj;
			obj.o_packch = this.pack_char();
			inpack++;
		}
		else
		{
            lp = null;
            for (let op = pack; Boolean(op); op = op.l_next)
            {
                if (op.o_type != obj.o_type)
                lp = op;
                else
                {
                    while (op.o_type == obj.o_type && op.o_which != obj.o_which)
                    {
                        lp = op;
                        if (!Boolean(op.l_next))
                            break;
                        else
                            op = op.l_next;
                    }
                    if (op.o_type == obj.o_type && op.o_which == obj.o_which)
                    {
                        if (ISMULT(op.o_type))
                        {
                            if (!this.pack_room(from_floor, obj))
                                return;
                            op.o_count++;
                            r.discard(obj);
                            obj = op;
                            lp = null;
                        }
                        else if (obj.o_group)
                        {
                            lp = op;
                            while (op.o_type == obj.o_type
                                && op.o_which == obj.o_which
                                && op.o_group != obj.o_group)
                            {
                                lp = op;
                                if (!Boolean(op.l_next))
                                break;
                                else
                                op = op.l_next;
                            }
                            if (op.o_type == obj.o_type
                                && op.o_which == obj.o_which
                                && op.o_group == obj.o_group)
                            {
                                op.o_count += obj.o_count;
                                inpack--;
                                if (!this.pack_room(from_floor, obj)) return;
                                r.discard(obj);
                                obj = op;
                                lp = null;
                            }
                        }
                        else
                            lp = op;
                    }
                    break;
                }
            }

            if (Boolean(lp))
            {
                if (!this.pack_room(from_floor, obj))
                    return;
                else
                {
                    obj.o_packch = this.pack_char();
                    obj.l_next = lp.l_next;
                    obj.l_prev = lp;
                    if (Boolean(lp.l_next))
                        lp.l_next.lprev = obj;
                    lp.l_next = obj;
                }
            }
		}
		obj.o_flags |= d.ISFOUND;

		/*
		* If this was the object of something's desire, that monster will
		* get mad and run at the hero.
		*/
		for (op = r.dungeon.mlist; Boolean(op); op = op.l_next)
            if (op.t_dest == obj.o_pos)
                op.t_dest = hero;

		if (obj.o_type == d.AMULET)
			amulet = true;
		/*
		* Notify the user
		*/
		if (!silent)
		{
            if (!terse)
                r.UI.addmsg("you now have ");
            r.UI.msg(`${inv_name(obj, !terse)} ${obj.o_packch}`);
		}
    }
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
	* pack_char:
	*	Return the next unused pack character.
	* 次の未使用のパック文字（'a'〜'z'）を返します。
	*/
	this.pack_char = function()
	{
		let bp = -1;
		//for (bp = v.pack_used; bp; bp++)
		//	continue;
		for (let i in pack_used)
		{
			if (!pack_used[i])
			{ 
				bp = i;
				break;
			}	
		}
		return (bp + 'a'.charCodeAt(0));
	}
	/*
	* pack_room:
	*	See if there's room in the pack.  If not, print out an
	*	appropriate message
	* パックに空きがあるかをチェックします。
	*/
	this.pack_room = function(from_floor, obj)
	{
		if (++inpack > d.MAXPACK)
		{
		if (!terse)
			r.UI.addmsg("there's ");
		r.UI.addmsg("no room");
		if (!v.terse)
			r.UI.addmsg(" in your pack");
    		r.UI.endmsg();
            if (from_floor)
                this.move_msg(obj);
            inpack = d.MAXPACK;
            return false;
		}

		if (from_floor)
		{
            r.detach(lvl_obj, obj);
            r.UI.mvaddch(hero.y, hero.x, floor_ch());
            r.dungeon.chat(hero.y, hero.x) = (proom.r_flags & d.ISGONE) ? d.PASSAGE : d.FLOOR;
		}

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
		r.UI.msg(`moved onto ${inv_name(obj, true)}`);
	}
    /*
    * enter_room:
    *	Code that is executed whenver you appear in a room
    * 
    */
    this.enter_room = function(cp){

        let rp; //struct room *rp;
        let tp; //THING *tp;
        let y, x;
        let ch;

        rp = r.dungeon.roomin(cp);
        player.t_room = rp; //proom
        this.door_open(rp);
        if (!(rp.r_flags & d.ISDARK) && !on(player, d.ISBLIND))
            for (y = rp.r_pos.y; y < rp.r_max.y + rp.r_pos.y; y++)
            {
                r.UI.move(y, rp.r_pos.x);
                for (x = rp.r_pos.x; x < rp.r_max.x + rp.r_pos.x; x++)
                {
                    tp = r.dungeon.moat(y, x);
                    ch = r.dungeon.chat(y, x);
                    if (tp == null)
                        //if (CCHAR(inch()) != ch)
                        //    r.UI.addch(ch);
                        //else
                            r.UI.move(y, x + 1);
                    else
                    {
                        tp.t_oldch = ch;
                        if (!this.see_monst(tp))
                        if (on(player, d.SEEMONST))
                        {
                            //standout();
                            r.UI.addch(tp.t_disguise);
                            //standend();
                        }
                        else
                            r.UI.addch(ch);
                        else
                            r.UI.addch(tp.t_disguise);
                    }
                }
            }
        r.UI.comment("enter_room");
    }
    /*
    * see_monst:
    *	Return TRUE if the hero can see the monster
    * プレイヤーが特定のモンスターを見ることができるかどうかを判定します。
    */
    //bool
    //see_monst(THING *mp)
    this.see_monst = function(mp){
        let y, x;

        if (on(player, d.ISBLIND))
            return false;
        if (on(mp, d.ISINVIS) && !on(player, d.CANSEE))
            return false;
        y = mp.t_pos.y;
        x = mp.t_pos.x;
        if (dist(y, x, hero.y, hero.x) < d.LAMPDIST)
        {
            if (y != hero.y && x != hero.x &&
                !this.step_ok(r.dungeon.chat(y, hero.x)) && !this.step_ok(r.dungeon.chat(hero.y, x)))
                return false;
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
                        nh.y = hero.y + dy;
                        nh.x = hero.x + dx;
                        break;
                }
            }
        }
        const move_stuff =()=>{
            r.UI.mvaddch(hero.y, hero.x, this.floor_at());
            if ((fl & d.F_PASS) && r.dungeon.chat(r.oldpos.y, r.oldpos.x) == d.DOOR)
                leave_room(nh);
            hero = nh;
            r.player.player.t_pos = nh;
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
                    after = false;
                    running = false;
                    to_death = false;
                    return;
                }
        }
        else
        {
            nh.y = hero.y + dy;
            nh.x = hero.x + dx;
        }

        /*
        * Check if he tried to move off the screen or make an illegal
        * diagonal move, and stop him if he did.
        */
        if (nh.x < 0 || nh.x >= d.NUMCOLS || nh.y <= 0 || nh.y >= d.NUMLINES - 1)
            hit_bound();
        if (!this.diag_ok(hero, nh))
        {
            after = false;
            running = false;
            return;
        }
        if (r.running && ((nh.x == hero.x)&&(nh.y == hero.y)))
            after = running = false;
        fl = r.dungeon.flat(nh.y, nh.x);
        ch = r.dungeon.winat(nh.y, nh.x);
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
            return;
        }
        switch (ch)
        {
            case ' ':
            case '|':
            case '-':
                hit_bound()
                running = false;
                after = false;
                break;
            case d.DOOR:
                running = false;
                if (r.dungeon.flat(hero.y, hero.x) & d.F_PASS)
                    enter_room(nh);
                move_stuff();
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
            case d.FLOOR:
                if (!(fl & d.F_REAL))
                be_trapped(hero);
                move_stuff();
                break;
            case d.STAIRS:
                seenstairs = true;
                /* FALLTHROUGH */
            default:
                running = false;
                if (isupper(ch) || r.dungeon.moat(nh.y, nh.x))
                    fight(nh, cur_weapon, false);
                else
                {
                    if (ch != d.STAIRS)
                        take = ch;
                    move_stuff();
                }
        }
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
                wake_monster(y, x);
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
            level++;
            r.dungeon.new_level();
            r.UI.msg("you fell into a trap!");
            break;
        case d.T_BEAR:
            no_move += d.BEARTIME;
            msg("you are caught in a bear trap");
            break;
        case T_MYST:
            switch(rnd(11))
            {
                case 0: msg("you are suddenly in a parallel dimension");    break;
                case 1: msg("the light in here suddenly seems %s", rainbow[rnd(cNCOLORS)]);break;
                case 2: msg("you feel a sting in the side of your neck");   break;
                case 3: msg("multi-colored lines swirl around you, then fade"); break;
                case 4: msg("a %s light flashes in your eyes", rainbow[rnd(cNCOLORS)]); break;
                case 5: msg("a spike shoots past your ear!");   break;
                case 6: msg("%s sparks dance across your armor", rainbow[rnd(cNCOLORS)]);break;
                case 7: msg("you suddenly feel very thirsty");break;
                case 8: msg("you feel time speed up suddenly");break;
                case 9: msg("time now seems to be going slower");break;
                case 10: msg("you pack turns %s!", rainbow[rnd(cNCOLORS)]);break;
            }
            break;
        case T_SLEEP:
            no_command += SLEEPTIME;
            player.t_flags &= ~ISRUN;
            msg("a strange white mist envelops you and you fall asleep");
            break;
        case T_ARROW:
            if (swing(pstats.s_lvl - 1, pstats.s_arm, 1))
            {
            pstats.s_hpt -= roll(1, 6);
            if (pstats.s_hpt <= 0)
            {
                msg("an arrow killed you");
                death('a');
            }
            else
                msg("oh no! An arrow shot you");
            }
            else
            {
            arrow = new_item();
            init_weapon(arrow, ARROW);
            arrow.o_count = 1;
            arrow.o_pos = hero;
            fall(arrow, false);
            msg("an arrow shoots past you");
            }
            break;
        case T_TELEP:
            /*
            * since the hero's leaving, look() won't put a TRAP
            * down for us, so we have to do it ourself
            */
            teleport();
            mvaddch(tc.y, tc.x, TRAP);
            break;
        case T_DART:
            if (!swing(pstats.s_lvl+1, pstats.s_arm, 1))
            msg("a small dart whizzes by your ear and vanishes");
            else
            {
            pstats.s_hpt -= roll(1, 4);
            if (pstats.s_hpt <= 0)
            {
                msg("a poisoned dart killed you");
                death('d');
            }
            if (!ISWEARING(R_SUSTSTR) && !save(VS_POISON))
                chg_str(-1);
            msg("a small dart just hit you in the shoulder");
            }
            break;
        case T_RUST:
            msg("a gush of water hits you on the head");
            rust_armor(cur_armor);
            break;
        }
        flush_type();
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
        let ret; //static coord ret;  /* what we will be returning */

        y = ret.y = who.t_pos.y + rnd(3) - 1;
        x = ret.x = who.t_pos.x + rnd(3) - 1;
        /*
        * Now check to see if that's a legal move.  If not, don't move.
        * (I.e., bump into the wall or whatever)
        */
        if (y == who.t_pos.y && x == who.t_pos.x)
            return ret;
        if (!diag_ok(who.t_pos, ret))
        {
            ret = who.t_pos;
            return ret;
        }
        else
        {
            ch = r.dungeon.winat(y, x);
            if (!this.step_ok(ch)){
                ret = who.t_pos;
                return ret;
            }
            if (ch == SCROLL)
            {
                for (obj = lvl_obj; obj != null; obj = next(obj))
                if (y == obj.o_pos.y && x == obj.o_pos.x)
                    break;
                if (obj != null && obj.o_which == S_SCARE){
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
        if (arm == null || arm.o_type != ARMOR || arm.o_which == LEATHER ||
        arm.o_arm >= 9)
            return;

        if ((arm.o_flags & ISPROT) || ISWEARING(R_SUSTARM))
        {
        if (!to_death)
            msg("the rust vanishes instantly");
        }
        else
        {
        arm.o_arm++;
        if (!terse)
            msg("your armor appears to be weaker now. Oh my!");
        else
            msg("your armor weakens");
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
        return (this.step_ok(r.dungeon.chat(ep.y, sp.x)) && this.step_ok(r.dungeon.chat(sp.y, ep.x)));
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
}
