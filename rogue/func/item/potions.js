/*
 * Function(s) for dealing with potions
 */
function potions(r){
	
	const d = r.define;
    const t = r.types;
    const ms = r.messages;

	const pot_info = r.globalValiable.pot_info;

	//const player = r.player.player;
	const fruit = r.fruit;

	const on = (thing,flag)=>{return ((thing.t_flags & flag) != 0)};
	const ISRING = (h, wh)=>  {
		return (r.player.get_cur_ring(h) != null && r.player.get_cur_ring(h).o_which == wh);
	} 
	/*
	* add_str:
	*	Perform the actual add, checking upper and lower bound limits
	*/
	const add_str =(sp, amt)=>
	{
		if ((sp += amt) < 3)
			sp = 3;
		else if (sp > 31)
			sp = 31;
		return sp;
	}

	//let prbuf;

	function PACT(flag, daemon, time, high, straight)
	{
		this.pa_flags = flag; 	//int pa_flags;
		this.pa_daemon = daemon;	//void (*pa_daemon)();
		this.pa_time = time;	//int pa_time;
		this.pa_high = high;//char *pa_high, *pa_straight;
		this.pa_straight = straight;
	}

	const p_actions = [];
	p_actions.push(new PACT(d.ISHUH,	r.player.unconfuse,	d.HUHDURATION,	/* P_CONFUSE */
			ms.P_ACTION_1,
			ms.P_ACTION_2 )),
	p_actions.push(new PACT(d.ISHALU,	r.player.come_down,	d.SEEDURATION,	/* P_LSD */
			ms.P_ACTION_3,
			ms.P_ACTION_3 )),
	p_actions.push(new PACT(0,		null,	0 )),	/* P_POISON */
	p_actions.push(new PACT(0,		null,	0 )),	/* P_STRENGTH */
	p_actions.push(new PACT(d.CANSEE,	r.player.unsee,	d.SEEDURATION,		/* P_SEEINVIS */
			ms.P_ACTION_4(fruit),
			ms.P_ACTION_4(fruit) )),
	p_actions.push(new PACT(0,		null,	0 )),	/* P_HEALING */
	p_actions.push(new PACT(0,		null,	0 )),	/* P_MFIND */
	p_actions.push(new PACT(0,		null,	0 )),	/* P_TFIND  */
	p_actions.push(new PACT(0,		null,	0 )),	/* P_RAISE */
	p_actions.push(new PACT(0,		null,	0 )),	/* P_XHEAL */
	p_actions.push(new PACT(0,		null,	0 )),	/* P_HASTE */
	p_actions.push(new PACT(0,		null,	0 )),	/* P_RESTORE */
	p_actions.push(new PACT(d.ISBLIND,	r.player.sight,	d.SEEDURATION,	/* P_BLIND */
			ms.P_ACTION_5,
			ms.P_ACTION_6 )),
	p_actions.push(new PACT(d.ISLEVIT,	r.player.land,	d.HEALTIME,		/* P_LEVIT */
			ms.P_ACTION_7,
			ms.P_ACTION_8  )),

	/*
	* quaff:
	*	Quaff a potion from the pack
	*/
	//void
	this.quaff = function(obj)
	{
		const player = r.player.player;

		let tp, mp;//THING *obj, *tp, *mp;
		let discardit = false;
		let show, trip;

		const pstats = r.player.get_pstats();
		
		let max_hp = r.player.get_maxhp();	

		//obj = get_item("quaff", POTION);
		/*
		* Make certain that it is somethings that we want to drink
		*/
		if (obj == null)
			return;
		if (obj.o_type != d.POTION)
		{
			if (!terse)
				r.UI.msg("yuk! Why would you want to drink that?");
			else
				r.UI.msg("that's undrinkable");
			return;
		}
		if (obj == r.player.get_cur_weapon())
			r.player.set_cur_weapon(null);

		/*
		* Calculate the effect it has on the poor guy.
		*/
		trip = on(player, d.ISHALU);
		discardit = (obj.o_count == 1)?true: false;
		r.player.packf.leave_pack(obj, false, false);
		switch (Number(obj.o_which))
		{
		case d.P_CONFUSE:
			do_pot(d.P_CONFUSE, !trip);
			break; 
		case d.P_POISON:
			pot_info[d.P_POISON].oi_know = true;
			if (r.player.isWearing(d.R_SUSTSTR))
				r.UI.msg(ms.QUAFF_POISON_1);
			else
			{
				r.player.misc.chg_str(-(r.rnd(3) + 1));
				r.UI.msg(ms.QUAFF_POISON_2);
				r.player.come_down();
			}
			break; 
		case d.P_HEALING:
			pot_info[d.P_HEALING].oi_know = true;
			pstats.s_hpt += r.roll(pstats.s_lvl, 4);
			if (pstats.s_hpt > max_hp){//;//max_hp){
				pstats.s_hpt = ++max_hp;
				r.player.set_maxhp(max_hp);
			}
			r.player.sight();
			r.UI.msg(ms.QUAFF_HEALING);
			break; 
		case d.P_STRENGTH:
			pot_info[d.P_STRENGTH].oi_know = true;
			r.player.misc.chg_str(1);
			r.UI.msg(ms.QUAFF_STRENGTH);
			break; 
		case d.P_MFIND:
			player.t_flags |= d.SEEMONST;
			r.daemon.fuse(turn_see, true, d.HUHDURATION, d.AFTER);
			if (!turn_see(false))
				r.UI.msg(choose_str(ms.QUAFF_MFIND_1, ms.QUAFF_MFIND_2));
			break; 
		case d.P_TFIND:
			/*
			* Potion of magic detection.  Show the potions and scrolls
			*/
			const lvl_obj = r.dungeon.lvl_obj;
			const mlist = r.dungeon.mlist;

			show = false;
			if (lvl_obj != null)
			{
				//wclear(hw)
				for (tp = lvl_obj; tp != null; tp = tp.l_next)
				{
					if (is_magic(tp))
					{
						show = true;
						r.UI.move(tp.o_pos.y, tp.o_pos.x);
						r.UI.addch(d.MAGIC);
						pot_info[d.P_TFIND].oi_know = true;
					}
				}
				for (mp = mlist; mp != null; mp = mp.l_next)
				{
					for (tp = mp.t_pack; tp != null; tp = tp.l_next)
					{
						if (is_magic(tp))
						{
							show = true;
							r.UI.move(mp.t_pos.y, mp.t_pos.x);
							r.UI.addch(d.MAGIC);
						}
					}
				}
			}
			if (show)
			{
				pot_info[d.P_TFIND].oi_know = true;
				r.UI.msg(ms.QUAFF_TFIND);//--More--");
			}
			else
				r.UI.msg(choose_str(ms.QUAFF_MFIND_1, ms.QUAFF_MFIND_2));
			break; 
		case d.P_LSD:
			if (!trip)
			{
				if (on(player, d.SEEMONST))
					turn_see(false);
				r.daemon.start_daemon(r.player.visuals(), 0, d.BEFORE);
				seenstairs = seen_stairs();
			}
			do_pot(d.P_LSD, true);
			break; 
		case d.P_SEEINVIS:
			//r.UI.msg(`this potion tastes like ${fruit} juice`);
			show = on(player, d.CANSEE);
			do_pot(d.P_SEEINVIS, false);
			if (!show)
				this.invis_on();
			r.player.sight();
			break; 
		case d.P_RAISE:
			pot_info[d.P_RAISE].oi_know = true;
			r.UI.msg(ms.QUAFF_RAISE);
			raise_level();
			break; 
		case d.P_XHEAL:
			pot_info[d.P_XHEAL].oi_know = true;
			if ((pstats.s_hpt += r.roll(pstats.s_lvl, 8)) > max_hp)
			{
				if (pstats.s_hpt > max_hp + pstats.s_lvl + 1)
					++max_hp;
				pstats.s_hpt = ++max_hp;
				r.player.set_maxhp(max_hp);
			}
			r.player.sight();
			r.player.come_down();
			r.UI.msg(ms.QUAFF_XHEAL);
			break; 
		case d.P_HASTE:
			pot_info[d.P_HASTE].oi_know = true;
			after = false;
			if (r.player.misc.add_haste(true))
			r.UI.msg(ms.QUAFF_HASTE);
			break; 
		case d.P_RESTORE:
			let max_stats = r.player.get_max_stats();
			let cur_ring = [];
			cur_ring[d.LEFT]  = r.player.get_cur_ring(d.LEFT);
			cur_ring[d.RIGHT] = r.player.get_cur_ring(d.RIGHT);

			if (ISRING(d.LEFT, d.R_ADDSTR))
				add_str(pstats.s_str, -cur_ring[d.LEFT].o_arm);
			if (ISRING(d.RIGHT, d.R_ADDSTR))
				add_str(pstats.s_str, -cur_ring[d.RIGHT].o_arm);
			if (pstats.s_str < max_stats.s_str)
				pstats.s_str = max_stats.s_str;
			if (ISRING(d.LEFT, d.R_ADDSTR))
				add_str(pstats.s_str, cur_ring[d.LEFT].o_arm);
			if (ISRING(d.RIGHT, d.R_ADDSTR))
				add_str(pstats.s_str, cur_ring[d.RIGHT].o_arm);

			r.player.set_pstats(pstats);
			r.UI.msg(ms.QUAFF_RESTORE);
			break; 
		case d.P_BLIND:
			do_pot(d.P_BLIND, true);
			break; 
		case d.P_LEVIT:
			do_pot(d.P_LEVIT, true);
			break; 
		default:
			r.UI.msg(ms.QUAFF_ETC);
			r.UI.debug(`potion_type: ${obj.o_which}`);
			return;
		}
		r.player.set_pstats(pstats);
		r.UI.status();
		/*
		* Throw the item away
		*/

		r.player.misc.call_it(pot_info[obj.o_which]);

		if (discardit)
			r.discard(obj);
		return;
	}

	/*
	* is_magic:
	*	Returns true if an object radiates magic
	*/
	//bool
	function is_magic(obj)//THING *obj)
	{
		const a_class = r.globalValiable.a_class;

		switch (obj.o_type)
		{
		case d.ARMOR:
			return ((obj.o_flags&d.ISPROT) || obj.o_arm != a_class[obj.o_which]);
		case d.WEAPON:
			return (obj.o_hplus != 0 || obj.o_dplus != 0);
		case d.POTION:
		case d.SCROLL:
		case d.STICK:
		case d.RING:
		case d.AMULET:
			return true;
		}
		return false;
	}

	/*
	* invis_on:
	*	Turn on the ability to see invisible
	*/

	//void
	this.invis_on = function()
	{
		const player = r.player.player;
		let mp;

		player.t_flags |= d.CANSEE;
		for (mp = r.dungeon.mlist; mp != null; mp = mp.l_next)
		if (on(mp, d.ISINVIS) && r.player.see_monst(mp) && !on(player, d.ISHALU))
			r.UI.mvaddch(mp.t_pos.y, mp.t_pos.x, mp.t_disguise);
	}

	/*
	* turn_see:
	*	Put on or off seeing monsters on this level
	*/
	//bool
	function turn_see(turn_off)
	{
		const player = r.player.player;

		let mp;//THING *mp;
		let can_see, add_new;

		const mlist = r.dungeon.mlist;

		add_new = false;
		for (mp = mlist; mp != null; mp = mp.l_next)
		{
			r.UI.move(mp.t_pos.y, mp.t_pos.x);
			can_see = r.player.see_monst(mp);
			if (turn_off)
			{
				if (!can_see)
					r.UI.addch(mp.t_oldch);
			}
			else
			{
				if (!can_see)
					;//standout();
				if (!on(player, d.ISHALU))
					r.UI.addch(mp.t_type);
				else
					r.UI.addch(r.rnd(26) + 'A'.charCodeAt(0));
				if (!can_see)
				{
					//standend();
					add_new++;
				}
			}
		}
		if (turn_off)
			player.t_flags &= ~d.SEEMONST;
		else
			player.t_flags |= d.SEEMONST;
		return add_new;
	}

	/*
	* seen_stairs:
	*	Return true if the player has seen the stairs
	*/
	//bool
	function seen_stairs()
	{
		const player = r.player.player;

		let tp;//THING	*tp;
		let hero = r.player.player.t_pos;
		let stairs = r.dungeon.get_stairs();

		r.UI.move(stairs.y, stairs.x);
		if (r.UI.inch() == d.STAIRS)			/* it's on the map */
			return true;
		if (hero.x == stairs.x && hero.y == stairs.y)			/* It's under him */
			return true;

		/*
		* if a monster is on the stairs, this gets hairy
		*/
		if ((tp = r.dungeon.moat(stairs.y, stairs.x)) != null)
		{
		if (r.player.see_monst(tp) && on(tp, d.ISRUN))	/* if it's visible and awake */
			return true;			/* it must have moved there */

		if (on(player, d.SEEMONST)		/* if she can detect monster */
			&& tp.t_oldch == d.STAIRS)		/* and there once were stairs */
			return true;			/* it must have moved there */
		}
		return false;
	}

	/*
	* raise_level:
	*	The guy just magically went up a level.
	*/

	//void
	function raise_level()
	{
		const e_levels = r.globalValiable.e_levels;

		const pstats = r.player.get_pstats();
		pstats.s_exp = e_levels[pstats.s_lvl-1] + 1;
		r.player.misc.check_level();
		r.player.set_pstats(pstats);
	}

	/*
	* do_pot:
	*	Do a potion with standard setup.  This means it uses a fuse and
	*	turns on a flag
	*/

	//void
	function do_pot(type, knowit)//int type, bool knowit)
	{
		const player = r.player.player;
		/*
		* spread:
		*	Give a spread around a given number (+/- 20%)?
		*/
		const spread = (nm)=>{
			const twenty_percent = nm / 5; 
			const random_range_total_width = twenty_percent * 2; // nm * 0.4

			return nm + Math.floor(Math.random()*(random_range_total_width + 1) - twenty_percent);
		};

		let pp;//PACT *pp;
		let t;

		pp = p_actions[type];
		if (!pot_info[type].oi_know)
			pot_info[type].oi_know = knowit;
		t = spread(pp.pa_time);
		if (!on(player, pp.pa_flags))
		{
			player.t_flags |= pp.pa_flags;
			r.daemon.fuse(pp.pa_daemon, 0, t, d.AFTER);
			r.UI.look(false);
		}
		else
			r.daemon.lengthen(pp.pa_daemon, t);
		r.UI.msg(choose_str(pp.pa_high, pp.pa_straight));
	}
	/*
	str str:
	*	Choose the first or second string depending on whether it the
	*	player is tripping
	*/
	//char *
	function choose_str(ts, ns)//har *ts, char *ns)
	{
		const player = r.player.player;

		return (on(player, d.ISHALU) ? ts : ns);
	}
}