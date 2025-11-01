/**
 * **目的:** モンスターの生成、個別のモンスターの行動決定、戦闘ロジックの一部を管理します。
 * **責務**: モンスターの生成、個別のモンスターの行動決定、戦闘ロジックの一部を管理します。 
 */
/**
 * 
 * @param {GameManager} r GameManagerインスタンス 
 */
function MonsterManager(r){
    
    const d = r.define;
    const t = r.types;
    /*
    **カプセル化するグローバル変数（例）:**
    *   `monsters[]` (モンスターの静的情報)。
    *   `mlist` (DungeonMapと共有するが、このクラスで行動に特化して操作)。
    *   `vf_hit` (Venus Flytrapのヒット回数)。
    * **カプセル化する変数**: `monsters[]` (モンスターの静的情報), 
    * `mlist` (DungeonMapと共有するが、このクラスで行動に特化して操作), 
    * `vf_hit` (Venus Flytrapのヒット回数) など。
    */

    let monsters = r.globalValiable.monsters;//  [];
    let mlist = r.dungeon.mlist;
    let vf_hit;

    let ch_ret;

    this.battle = new battle(r);

    /* 
    **関連する関数（提案されるメソッドの例）:**
    *   `randmonster()`, `new_monster()`, `wanderer()`, `give_pack()` (モンスター生成・初期化)。
    *   `move_monst()`, `do_chase()`, `chase()`, `runto()`, `rndmove()`, `aggravate()` (移動・AI)。
    *   `attack()` (モンスターがプレイヤーを攻撃)。
    *   `killed()`, `remove_mon()` (モンスター死亡処理)。
    *   `wake_monster()` (モンスターの活性化)。
    *   `set_mname()` (モンスター名の整形)。
    * **関連するメソッド**: `randMonster()`, `newMonster()`, `wanderer()`, 
    * `givePack()` (モンスター生成・初期化), `moveMonster()`, `doChase()`, 
    * `chase()`, `runTo()`, `rndMove()`, `aggravate()` (移動・AI), 
    * `attackPlayer()` (モンスターがプレイヤーを攻撃), `killed()` (モンスター死亡処理), 
    * `removeMonster()`, `wakeMonster()`, `setMonsterName()` など。
    */
    const on = (thing,flag)=>{return ((thing.t_flags & flag) != 0)};
    const next = (ptr)=>{ return ptr.l_next;}

    const ce = (a, b)=>{ return (a.x == b.x && a.y == b.y)};
    const isupper =(ch)=> { return ch === ch.toUpperCase() && ch !== ch.toLowerCase(); }

    const getChaseResult =()=>{ return { x:ch_ret.x, y:ch_ret.y}; }

    /*
    * dist_cp:
    *	Call dist() with appropriate arguments for coord pointers
    * coord *c1, coord *c2)
    */
    const dist_cp =(c1,c2)=>{ 
        if (!Boolean(c1)) console.log("warn: dc1");
        if (!Boolean(c2)) console.log("warn: dc2");
        return dist(c1.y, c1.x, c2.y, c2.x);
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
    /*
    * spread:
    *	Give a spread around a given number (+/- 20%)?
    */
    const spread = (nm)=>{
        const twenty_percent = nm / 5; 
        const random_range_total_width = twenty_percent * 2; // nm * 0.4

        return nm + Math.floor(Math.random()*(random_range_total_width + 1) - twenty_percent);
    };
    /*
    * chase.c
    * runners:
    *	Make all the running monsters move.
    */
    this.runners = function(){

        //console.log("runnners");

        const mlist = r.dungeon.mlist;
        const hero = r.player.player.t_pos;

        let tp; //register THING *tp;
        let next; //THING *next;
        let wastarget;
        let orig_pos; //static coord orig_pos;

        let cnt = 0;
        for (tp = mlist; tp != null; tp = next)
        {
            //console.log("runner_loop_in")
            /* remember this in case the monster's "next" is changed */
            next = tp.l_next;
            if (!on(tp, d.ISHELD) && on(tp, d.ISRUN))
            //if (true)
            {
                //console.log("runner_loop")

                orig_pos = tp.t_pos;
                wastarget = on(tp, d.ISTARGET);
                if (r.monster.move_monst(tp) == -1)
                    continue;
                if (on(tp, d.ISFLY) && dist_cp(hero, tp.t_pos) >= 3)
                    r.monster.move_monst(tp);
                if (wastarget && !ce(orig_pos, tp.t_pos))
                {
                    tp.t_flags &= ~d.ISTARGET;
                    r.player.to_death = false;
                }
            }
            cnt++;
        }
        //console.log(`mlist${cnt}`);
        if (r.UI.has_hit)
        {
            //r.UI.endmsg(" ");
            r.UI.has_hit = false;
        }
        //r.UI.comment("d-runners");
        //r.UI.comment("runners");
    }
    /*
    * move_monst:
    *	Execute a single turn of running for a monster
    */
    this.move_monst = function(tp)//(THING *tp)
    {
        if (!on(tp, d.ISSLOW) || tp.t_turn)
            if (this.do_chase(tp) == -1)
                return(-1);
        if (on(tp, d.ISHASTE))
            if (this.do_chase(tp) == -1)
                return(-1);
        tp.t_turn ^= true;
        //console.log("move_monst");
        return(0);
    }
    /*
    * do_chase:
    *	Make one thing chase another.
    */
    this.do_chase = function(th)//(THING *th)
    {
        const hero = r.player.player.t_pos;
        const proom = r.player.player.t_room;

        let cp; //register coord *cp;
        let rer, ree; //register struct room *rer, *ree;	/* room of chaser, room of chasee */
        let mindist = 32767, curdist;
        let stoprun = false;	/* TRUE means we are there */
        let door;
        let obj; //register THING *obj;
        let cthis; //static coord this;			/* Temporary destination for chaser */

        rer = th.t_room;		/* Find room of chaser */
        if (on(th, d.ISGREED) && rer.r_goldval == 0)
            th.t_dest = hero;	/* If gold has been taken, run after hero */
        if (th.t_dest == hero)	/* Find room of chasee */
            ree = proom;
        else
            ree = r.dungeon.roomin(th.t_dest);
        /*
        * We don't count doors as inside rooms for this routine
        */
        door = (r.dungeon.chat(th.t_pos.y, th.t_pos.x) == d.DOOR);
        /*
        * If the object of our desire is in a different room,
        * and we are not in a corridor, run to the door nearest to
        * our goal.
        */
        const over =()=>{
            let oc = 0;
            if (rer != ree)
            {
                //for (cp = rer.r_exit; cp < rer.r_exit[rer.r_nexits]; cp++)
                for (let i = 0; i<=rer.r_nexits; i++)
                {
                    oc++;
                    cp = rer.r_exit[i];
                    curdist = dist_cp(th.t_dest, cp);
                    if (curdist < mindist)
                    {
                        cthis = cp;
                        if (!Boolean(cthis) )console.log("warn: overf");

                        mindist = curdist;
                    }
                }
                if (door)
                {
                    rer = r.dungeon.passages[r.dungeon.flat(th.t_pos.y, th.t_pos.x) & d.F_PNUM];
                    door = false;
                    over();
                }
            }
            else
            {
                oc += 10;
                cthis = th.t_dest;
                if (!Boolean(cthis) )console.log("warn: overt");
                /*
                * For dragons check and see if (a) the hero is on a straight
                * line from it, and (b) that it is within shooting distance,
                * but outside of striking range.
                */
                if (th.t_type == 'D' && (th.t_pos.y == hero.y || th.t_pos.x == hero.x
                    || Math.abs(th.t_pos.y - hero.y) == Math.abs(th.t_pos.x - hero.x))
                    && dist_cp(th.t_pos, hero) <= d.BOLT_LENGTH * d.BOLT_LENGTH
                    && !on(th, d.ISCANC) && r.rnd(d.DRAGONSHOT) == 0)
                {
                    delta.y = Math.sign(hero.y - th.t_pos.y);
                    delta.x = Math.sign(hero.x - th.t_pos.x);
                    if (r.UI.has_hit)
                        r.UI.endmsg();
                    r.item.sticks.fire_bolt(th.t_pos, delta, "flame");
                    running = false;
                    count = 0;
                    quiet = 0;
                    if (r.player.to_death && !on(th, d.ISTARGET))
                    {
                        r.player.to_death = false;
                        r.player.kamikaze = false;
                    }
                    return 0;
                }
            }
            //console.log(`over${oc}`);
        }
        over();
        /*
        * This now contains what we want to run to this time
        * so we run to it.  If we hit it we either want to fight it
        * or stop running
        */
        const ce = (a, b)=>{ return (a.x == b.x && a.y == b.y)};

        //console.log(th);
        if (!Boolean(cthis) )console.log("warn: cthis");
        if (!r.monster.chase(th, cthis))
        {
            if (ce(cthis, hero))
            {
                //console.log("attack");
                r.UI.damageEffect("*",
                    hero.x,hero.y
                )
                return r.monster.battle.attack(th);
            }
            else if (ce(cthis, th.t_dest))
            {
                for (obj = r.dungeon.lvl_obj; obj != null; obj = next(obj))
                if (th.t_dest == obj.o_pos)
                {
                    r.dungeon.lvl_obj = r.detach(r.dungeon.lvl_obj, obj);
                    th.t_pack = r.attach(th.t_pack, obj);
                    r.dungeon.chat(obj.o_pos.y, obj.o_pos.x) =
                        (th.t_room.r_flags & d.ISGONE) ? d.PASSAGE : d.FLOOR;
                    th.t_dest = r.monster.find_dest(th);
                    break;
                }
                if (th.t_type != 'F')
                    stoprun = true;
            }
        }
        else
        {
            if (th.t_type == 'F')
                return 0;
        }
        this.relocate(th, ch_ret);
        /*
        * And stop running if need be
        */
        if (stoprun && ce(th.t_pos, th.t_dest))
            th.t_flags &= ~d.ISRUN;
        return 0;
    }
    /*
    * relocate:
    *	Make the monster's new location be the specified one, updating
    *	all the relevant state.
    */
    this.relocate = function(th, new_loc) //(THING *th, coord *new_loc)
    {
        const player = r.player.player;
        let oroom; //struct room *oroom;

        //ce(new_loc, th.t_pos))
        if (!(new_loc.x == th.t_pos.x && new_loc.y == th.t_pos.y))
        {
            r.UI.mvaddch(th.t_pos.y, th.t_pos.x, th.t_oldch);
            th.t_room = r.dungeon.roomin(new_loc);
            this.set_oldch(th, new_loc);
            oroom = th.t_room;
            //r.dungeon.moat(th.t_pos.y, th.t_pos.x) = null;
            r.dungeon.places[th.t_pos.y][th.t_pos.x].p_monst = null;

            if (oroom != th.t_room)
                th.t_dest = r.dungeon.find_dest(th);
            th.t_pos = new_loc;
            //r.dungeon.moat(new_loc.y, new_loc.x) = th;
            r.dungeon.places[new_loc.y][new_loc.x].p_monst = th;
        }
        r.UI.move(new_loc.y, new_loc.x);
        if (r.player.see_monst(th))
            r.UI.addch(th.t_disguise);
        else if (on(player, d.SEEMONST))
        {
            //standout();
            r.UI.addch(th.t_type);
            //standend();
        }
    }
    /*
    * find_dest:
    *	find the proper destination for the monster
    */
    //coord *
    this.find_dest = function(tp)//(THING *tp)
    {
        const proom = r.player.player.t_room;

        let obj; //register THING *obj;
        let prob;

        const hero = r.player.player.t_pos;

        if ((prob = monsters[Number(tp.t_type.charCodeAt(0)) - Number('A'.charCodeAt(0))].m_carry) <= 0 || tp.t_room == proom
        || r.player.see_monst(tp))
            return hero;
        for (obj = r.dungeon.lvl_obj; obj != null; obj = next(obj))
        {
        if (obj.o_type == d.SCROLL && obj.o_which == d.S_SCARE)
            continue;
        if (r.dungeon.roomin(obj.o_pos) == tp.t_room && r.rnd(100) < prob)
        {
            for (tp = mlist; tp != null; tp = next(tp))
            if (tp.t_dest == obj.o_pos)
                break;
                if (!Boolean(obj.o_pos)) console.log("warn: wm");
            if (tp == null)
                return obj.o_pos;
        }
        }
        return hero;
    }
    /*
    * chase:
    *	Find the spot for the chaser(er) to move closer to the
    *	chasee(ee).  Returns TRUE if we want to keep on chasing later
    *	FALSE if we reach the goal.
    */
    //bool
    this.chase = function(tp, ee) //(THING *tp, coord *ee)
    {
        const step_ok = r.dungeon.step_ok;

        const hero = r.player.player.t_pos;

        let obj; //register THING *obj;
        let x, y;
        let curdist, thisdist;
        let er = tp.t_pos; //register coord *er = &tp.t_pos;
        let ch;
        let plcnt = 1;
        let tryp = {}; //static coord tryp;

        /*
        * If the thing is confused, let it move randomly. Invisible
        * Stalkers are slightly confused all of the time, and bats are
        * quite confused all the time
        */
        if ((on(tp, d.ISHUH) && r.rnd(5) != 0) || (tp.t_type == 'P' && r.rnd(5) == 0)
        || (tp.t_type == 'B' && r.rnd(2) == 0))
        {
            /*
            * get a valid random move
            */
            ch_ret = r.player.rndmove(tp);
            curdist = dist_cp(ch_ret, ee);
            /*
            * Small chance that it will become un-confused 
            */
            if (r.rnd(20) == 0)
                tp.t_flags &= ~d.ISHUH;
        }
        /*
        * Otherwise, find the empty spot next to the chaser that is
        * closest to the chasee.
        */
        else
        {
            let ey, ex;
            /*
            * This will eventually hold where we move to get closer
            * If we can't find an empty spot, we stay where we are.
            */
            //console.log(er);
                      if (!Boolean(ee) )console.log("warn: ee");
            curdist = dist_cp(er, ee);
            ch_ret = er;

            ey = er.y + 1;
            if (ey >= d.NUMLINES - 1)
                ey = d.NUMLINES - 2;
            ex = er.x + 1;
            if (ex >= d.NUMCOLS)
                ex = d.NUMCOLS - 1;

            let roopcnt = 0; let setcnt = 0;
            for (x = er.x - 1; x <= ex; x++)
            {
                if (x < 0)
                    continue;
                tryp.x = x;
                for (y = er.y - 1; y <= ey; y++)
                {
                    roopcnt++;

                    tryp.y = y;
                    if (!r.player.diag_ok(er, tryp))
                        continue;
                    ch = r.dungeon.winat(y, x);
                    if (step_ok(ch))
                    {
                        /*
                        * If it is a scroll, it might be a scare monster scroll
                        * so we need to look it up to see what type it is.
                        */
                        if (ch == d.SCROLL)
                        {
                            for (obj = r.dungeon.lvl_obj; obj != null; obj = next(obj))
                            {
                                if (y == obj.o_pos.y && x == obj.o_pos.x)
                                break;
                            }
                            if (obj != null && obj.o_which == d.S_SCARE)
                                continue;
                        }
                        /*
                        * It can also be a Xeroc, which we shouldn't step on
                        */
                        if ((obj = r.dungeon.moat(y, x)) != null && obj.t_type == 'X')
                            continue;
                        /*
                        * If we didn't find any scrolls at this place or it
                        * wasn't a scare scroll, then this place counts
                        */
                        thisdist = dist(y, x, ee.y, ee.x);
                        if (thisdist < curdist)
                        {
                            plcnt = 1;
                            ch_ret = {x:tryp.x, y:tryp.y};

                            curdist = thisdist;
                            setcnt++;
                        }
                        else if (thisdist == curdist && r.rnd(++plcnt) == 0)
                        {
                            ch_ret = {x:tryp.x, y:tryp.y};
                            curdist = thisdist;
                            setcnt++;
                        }
                    }
                }
            }
            //console.log(`chase${roopcnt} ${setcnt}`);
        }

        ch_ret = getChaseResult();
        return (curdist != 0 && !ce(ch_ret, hero));
    }
    /*
    * set_oldch:
    *	Set the oldch character for the monster
    */
    this.set_oldch = function(tp, cp)//(THING *tp, coord *cp)
    {
        const player = r.player.player;
        const hero = player.t_pos;

        let sch;
        const see_floor = true;

        if ((tp.t_pos.x == cp.x && tp.t_pos.y == cp.y))
            return;

        sch = tp.t_oldch;
        tp.t_oldch = r.dungeon.chat(cp.y, cp.x);//r.UI.mvinch(cp.y,cp.x);//String.fromCharCode( r.UI.mvinch(cp.y,cp.x) );
        //console.log(tp.t_oldch);
        if (!on(player, d.ISBLIND))
        {
            if ((sch == d.FLOOR || tp.t_oldch == d.FLOOR) &&
            (tp.t_room.r_flags & d.ISDARK))
                tp.t_oldch = ' ';
            else if (dist_cp(cp, hero) <= d.LAMPDIST && see_floor)
                     tp.t_oldch = r.dungeon.chat(cp.y, cp.x);
        }
    }

    /*
    * List of monsters in rough order of vorpalness
    */
    //static char lvl_mons[] =  {
    const lvl_mons = [
        'K', 'E', 'B', 'S', 'H', 'I', 'R', 'O', 'Z', 'L', 'C', 'Q', 'A',
        'N', 'Y', 'F', 'T', 'W', 'P', 'X', 'U', 'M', 'V', 'G', 'J', 'D'
    ];
    //static char wand_mons[] = {
    const wand_mons = [
        'K', 'E', 'B', 'S', 'H',   0, 'R', 'O', 'Z',   0, 'C', 'Q', 'A',
        0, 'Y',   0, 'T', 'W', 'P',   0, 'U', 'M', 'V', 'G', 'J',   0
    ];
    /*
    * randmonster:
    *	Pick a monster to show up.  The lower the level,
    *	the meaner the monster.
    * 現在のレベルに適したランダムなモンスターの種類を返します
    */
    this.randmonster = function(wander)
    {
        let d;
        let mons; //char

        mons = (wander ? wand_mons : lvl_mons);
        do
        {
            d = r.dungeon.level + (r.rnd(10) - 6);
            if (d < 0)
                d = r.rnd(5);
            if (d > 25)
                d = r.rnd(5) + 21;
        } while (mons[d] == 0);
        return mons[d];

        r.UI.comment(".randmonster");
    }
    /*
    * new_monster:
    *	Pick a new monster and add it to the list
    * 新しいモンスターを生成し、リストに追加します。
    */
    this.new_monster = function(tp, type, cp)//THING *tp, char type, coord *cp))
    {
        let mp; //struct monster *mp;
        let lev_add;

        if ((lev_add = r.dungeon.level - d.AMULETLEVEL) < 0)
            lev_add = 0;
        r.dungeon.mlist = r.attach(r.dungeon.mlist, tp);
        tp.t_type = type;
        tp.t_disguise = type;
        tp.t_pos = cp;
        r.UI.move(cp.y, cp.x);//console.log(cp);
        tp.t_oldch = r.UI.inch();//CCHAR( inch() );
        tp.t_room = r.dungeon.roomin(cp); //console.log(cp);
        r.dungeon.places[cp.y][cp.x].p_monst = tp;
        mp = monsters[Number(tp.t_type.charCodeAt(0)) - Number('A'.charCodeAt(0)) ]; //console.log(mp, tp);
        //console.log(tp, mp);
        tp.t_stats.s_lvl = mp.m_stats.s_lvl + lev_add;
        tp.t_stats.s_hpt = r.roll(tp.t_stats.s_lvl, 8);
        tp.t_stats.s_maxhp = tp.t_stats.s_hpt; 
        tp.t_stats.s_arm = mp.m_stats.s_arm - lev_add;
        tp.t_stats.s_dmg = mp.m_stats.s_dmg;
        tp.t_stats.s_str = mp.m_stats.s_str;
        tp.t_stats.s_exp = mp.m_stats.s_exp + lev_add * 10 + exp_add(tp);
        tp.t_flags = mp.m_flags;
        if (r.dungeon.level > 29)
            tp.t_flags |= d.ISHASTE;
        tp.t_turn = true;
        tp.t_pack = null;
        if (r.player.isWearing(d.R_AGGR))
            this.runto(cp);
        if (type == 'X')
            tp.t_disguise = r.rnd_thing();

        r.UI.comment(".new_monster");
        return tp;
    }
    /*
    * expadd:
    *	Experience to add for this monster's level/hit points
    */
    //int
    function exp_add(tp)//THING *tp)
    {
        let mod;

        if (tp.t_stats.s_lvl == 1)
            mod = tp.t_stats.s_maxhp / 8;
        else
            mod = tp.t_stats.s_maxhp / 6;
        if (tp.t_stats.s_lvl > 9)
            mod *= 20;
        else if (tp.t_stats.s_lvl > 6)
            mod *= 4;
        return Math.floor(mod);
    }
    /*
    * wanderer:
    *	Create a new wandering monster and aim it at the player
    */
    this.wanderer = function(){
        //let tp; //THING *tp;
        let cp = {}; //static coord cp;
        const tp = r.new_item();
        do
        {
            r.dungeon.roomf.find_floor(null, cp, false, true);  // struct room *) NULL
        } while (roomin(r.dungeon.roomf.get_find_floor_result()) == proom);

        tp = this.new_monster(tp, this.randmonster(true), r.dungeon.roomf.get_find_floor_result());//cp);

        if (on(player, d.SEEMONST))
        {
            //standout();
            if (!on(player, d.ISHALU))
                r.UI.addch(tp.t_type);
            else
                r.UI.addch(String.fromCharCode(r.rnd(26) + 'A'.charCodeAt(0)));
            //standend();
        }
        this.runto(tp.t_pos);
        if (wizard)
            r.UI.msg(`started a wandering ${monsters[Number(tp.t_type.charCodeAt(0))-Number('A'.charCodeAt(0))].m_name}`);

        r.UI.comment("wanderer");

    }

    /*
    * wake_monster:
    *	What to do when the hero steps next to a monster
    */
    this.wake_monster = function(y, x){

        const player = r.player.player;
        const hero   = r.player.player.t_pos;
        const proom  = r.player.player.t_room;

        r.UI.comment("wake_monster");

        let tp; //THING *tp;
        let rp; //struct room *rp;
        let ch, mname;

        tp = r.dungeon.moat(y, x);
        if (tp == null){
            console.log("endwin();abort()");
            return; 	 	 
            //endwin(), abort(); 
        }
        ch = tp.t_type;
        /*
        * Every time he sees mean monster, it might start chasing him
        */
        if (!on(tp, d.ISRUN) && r.rnd(3) != 0 && on(tp, d.ISMEAN) && !on(tp, d.ISHELD)
             && !r.player.isWearing(d.R_STEALTH) && !on(player, d.ISLEVIT))
        //if (true)
        {
            //console.log("setrun");
            tp.t_dest = hero;
            tp.t_flags |= d.ISRUN; //| d.ISTARGET;
        }
        if (ch == 'M' && !on(player, d.ISBLIND) && !on(player, d.ISHALU)
            && !on(tp, d.ISFOUND) && !on(tp, d.ISCANC) && on(tp, d.ISRUN))
        {
            rp = proom;
            if ((rp != null && !(rp.r_flags & d.ISDARK))
                || dist(y, x, hero.y, hero.x) < d.LAMPDIST)
            {
                tp.t_flags |= d.ISFOUND;
                if (!r.player.save(d.VS_MAGIC))
                {
                    if (on(player, d.ISHUH))
                        r.deamon.lengthen(r.player.unconfuse, spread(d.HUHDURATION));
                    else
                        r.deamon.fuse(r.player.unconfuse, 0, spread(d.HUHDURATION), d.AFTER);
                    player.t_flags |= d.ISHUH;
                    mname = r.monster.battle.set_mname(tp);
                    r.UI.msg(`${mname}${(mname != "it")?"'":""}s gaze has confused you`);
                }
            }
        }
        /*
        * Let greedy ones guard gold
        */
        if (on(tp, d.ISGREED) && !on(tp, d.ISRUN))
        {
            tp.t_flags |= d.ISRUN;
            if (proom.r_goldval)
                tp.t_dest = proom.r_gold;
                if (!Boolean(tp.t_dest)) console.log("warn wm");
            else
                tp.t_dest = hero;
        }

        r.dungeon.places[y][x].p_monst = tp;

        return tp;
    }

    /*
    * give_pack:
    *	Give a pack to a monster if it deserves one
    * モンスターにアイテムをランダムに与えます。
    */
    this.give_pack = function(tp){

        if (r.dungeon.level >= r.dungeon.max_level 
            && r.rnd(100) < monsters[Number(tp.t_type.charCodeAt(0))-Number('A'.charCodeAt(0))].m_carry)
	            tp.t_pack = r.attach(tp.t_pack, r.item.new_thing());

        r.UI.comment(".give_pack");
        return tp;
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
    function save(which)
    {
        //r.player.save で作成（当クラス外ではそれを使う）

        if (which == d.VS_MAGIC)
        {
        if (ISRING(d.LEFT, d.R_PROTECT))
            which -= cur_ring[LEFT].o_arm;
        if (ISRING(d.RIGHT, d.R_PROTECT))
            which -= cur_ring[d.RIGHT].o_arm;
        }
        return save_throw(which, player);
    }

    /*
    * runto:
    *	Set a monster running after the hero.
    */
    //void
    this.runto = function(runner)//(coord *runner)
    {
        let tp;//register THING *tp;

        /*
        * If we couldn't find him, something is funny
        */
    //#ifdef MASTER
        if ((tp = r.dungeon.moat(runner.y, runner.x)) == null)
            r.UI.msg(`couldn't find monster in runto at (${runner.y},${runner.x})`);
    //#else
        tp = r.dungeon.moat(runner.y, runner.x);
    //#endif
        /*
        * Start the beastie running
        */
        tp.t_flags |= d.ISRUN;
        tp.t_flags &= ~d.ISHELD;
        tp.t_dest = this.find_dest(tp);
    }

    /*
	* aggravate:
	*	Aggravate all the monsters on this level
	*/

	//void
	this.aggravate = function()
	{
		let mp;//THING mp;

		for (mp = mlist; mp != null; mp = mp.l_next)
			this.runto(mp.t_pos);
	}

}
