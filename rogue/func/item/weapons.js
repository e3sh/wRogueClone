/*
 * Functions for dealing with problems brought about by weapons
  */

function weapons(r){

    const d = r.define;
    //const f = r.func;
    const t = r.types;
    const v = r.globalValiable;

    const NO_WEAPON = -1;

    const ce = (a, b)=>{ return (a.x == b.x && a.y == b.y)};
	const on = (thing,flag)=>{return ((thing.t_flags & flag) != 0)};

    let group = 2;

    //static struct init_weaps {
    //    char *iw_dam;	/* Damage when wielded */
    //    char *iw_hrl;	/* Damage when thrown */
    //    char iw_launch;	/* Launching weapon */
    //    int iw_flags;	/* Miscellaneous flags */
    //} 
    const init_dam = v.init_dam;//[MAXWEAPONS] = 

    /*
    * missile:
    *	Fire a missile in a given direction
    */
    //void
    function missile(ydelta, xdelta)
    {
        let obj;    //THING *obj;
        /*
        * Get which thing we are hurling
        */
        if ((obj = get_item("throw", d.WEAPON)) == null)
            return;
        if (!dropcheck(obj) || is_current(obj))
            return;
        obj = leave_pack(obj, true, false);
        do_motion(obj, ydelta, xdelta);
        /*
        * AHA! Here it has hit something.  If it is a wall or a door,
        * or if it misses (combat) the monster, put it on the floor
        */
        if (moat(obj.o_pos.y, obj.o_pos.x) == null ||
        !this.hit_monster(obj.o_pos.y, obj.o_pos.x, obj))
            fall(obj, true);
    }

    /*
    * do_motion:
    *	Do the actual motion on the screen done by an object traveling
    *	across the room
    */
    //void
    this.do_motion = function(obj, ydelta, xdelta)//THING *obj, int ydelta, int xdelta)
    {
		const player = r.player.player;
		const proom = player.t_room;
		const pstats = player.t_stats;
		const hero = player.t_pos;

        let ch;
        /*
        * Come fly with us ...
        */
        obj.o_pos = hero;
        for (;;)
        {
            /*
            * Erase the old one
            */
            if (!ce(obj.o_pos, hero) && r.player.cansee(obj.o_pos.y, obj.o_pos.x)) //&& !terse)
            {
                ch = r.dungeon.chat(obj.o_pos.y, obj.o_pos.x);
                if (ch == d.FLOOR && !r.UI.show_floor())
                ch = ' ';
                r.UI.mvaddch(obj.o_pos.y, obj.o_pos.x, ch);
            }
            /*
            * Get the new position
            */
            obj.o_pos.y += ydelta;
            obj.o_pos.x += xdelta;
            if (step_ok(ch = winat(obj.o_pos.y, obj.o_pos.x)) && ch != DOOR)
            {
                /*
                * It hasn't hit anything yet, so display it
                * If it alright.
                */
                if (cansee(unc(obj.o_pos)) && !terse)
                {
                    mvaddch(obj.o_pos.y, obj.o_pos.x, obj.o_type);
                    refresh();
                }
                continue;
            }
            break;
        }
    }

    /*
    * fall:
    *	Drop an item someplace around here.
    */
    //void
    function fall(obj, pr)//THING *obj, bool pr)
    {
        let pp;     //PLACE *pp;
        let fpos;   //static coord fpos;

        if (fallpos(obj.o_pos, fpos))
        {
            pp = INDEX(fpos.y, fpos.x);
            pp.p_ch = obj.o_type;
            obj.o_pos = fpos;
            if (cansee(fpos.y, fpos.x))
            {
                if (pp.p_monst != null)
                    pp.p_monst.t_oldch = obj.o_type;
                else
                    mvaddch(fpos.y, fpos.x, obj.o_type);
            }
            attach(lvl_obj, obj);
            return;
        }
        if (pr)
        {
            if (has_hit)
            {
                endmsg();
                has_hit = false;
            }
            msg("the %s vanishes as it hits the ground",
                weap_info[obj.o_which].oi_name);
        }
        discard(obj);
    }

    //init_weapon -> r.item

    /*
    * hit_monster:
    *	Does the missile hit the monster?
    */
    //int
    this.hit_monster = function(y, x, obj)//int y, int x, THING *obj)
    {
        let mp; //static coord mp;

        mp.y = y;
        mp.x = x;
        return r.monster.fight(mp, obj, true);
    }

    /*
    * num:
    *	Figure out the plus number for armor/weapons
    */
    //char *
    function num(n1, n2, type)
    {
        let numbuf;//static char numbuf[10];

        sprintf(numbuf, n1 < 0 ? "%d" : "+%d", n1);
        if (type == d.WEAPON)
            sprintf(numbuf[strlen(numbuf)], n2 < 0 ? ",%d" : ",+%d", n2);
        return numbuf;
    }

    /*
    * wield:
    *	Pull out a certain weapon
    */
    //void
    this.wield = function(obj)
    {
        let oweapon;//THING *obj, *oweapon;
        let sp;

        const is_current =(obj)=>//THING *obj)
        {
            if (obj == null)
                return false;
            if (obj == r.player.get_cur_armor() || obj == r.player.get_cur_weapon() || obj == r.player.get_cur_ring(d.LEFT)
            || obj == r.player.get_cur_ring(d.RIGHT))
            {
                //if (!terse)
                    r.UI.addmsg("That's already ");
                r.UI.msg("in use");
                return true;
            }
            return false;
        }

        oweapon = r.player.get_cur_weapon();
        if (!r.item.things.dropcheck(r.player.get_cur_weapon()))
        {
            r.player.set_cur_weapon(oweapon);
            return;
        }
        cur_weapon = oweapon;
        //if ((obj = get_item("wield", d.WEAPON)) == null)
        //{
        //bad:
        //    after = false;
        //    return;
        //}
        if (!Boolean(obj)) return;
        if (obj == null) return;

        if (obj.o_type == d.ARMOR)
        {
            r.UI.msg("you can't wield armor");
            return;//goto bad;
        }
        if (is_current(obj))
            ;//goto bad;

        sp = r.item.things.inv_name(obj, true);
        r.player.set_cur_weapon(obj);
        //if (!terse)
            r.UI.addmsg("you are now ");
        r.UI.msg(`wielding ${sp} (${obj.o_packch})`);//%s (%c)", sp, obj.o_packch);
    }

    /*
    * fallpos:
    *	Pick a random position around the give (y, x) coordinates
    */
    //bool
    function fallpos(pos, newpos)//coord *pos, coord *newpos)
    {
        let y, x, cnt, ch;

        cnt = 0;
        for (y = pos.y - 1; y <= pos.y + 1; y++)
            for (x = pos.x - 1; x <= pos.x + 1; x++)
            {
                /*
                * check to make certain the spot is empty, if it is,
                * put the object there, set it in the level list
                * and re-draw the room if he can see it
                */
                if (y == hero.y && x == hero.x)
                    continue;
                if (((ch = chat(y, x)) == d.FLOOR || ch == d.PASSAGE)
                            && rnd(++cnt) == 0)
                {
                    newpos.y = y;
                    newpos.x = x;
                }
            }
        return (cnt != 0);
    }
}