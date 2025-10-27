/*
 * Function(s) for dealing with potions
 */
function potions(r){
	
	const d = r.define;
    const t = r.types;

	const pot_info = r.globalValiable.pot_info;

	const player = r.player.player;

	const on = (thing,flag)=>{return ((thing.t_flags & flag) != 0)};
	const ISRING = (h,r)=>  {
		return (r.player.get_cur_ring(h) != null && r.player.get_cur_ring(h).o_which == r);
	} 

	let prbuf;

	function PACT(flag, deamon, time, high, straight)
	{
		this.pa_flags = flag; 	//int pa_flags;
		this.pa_daemon = deamon;	//void (*pa_daemon)();
		this.pa_time = time;	//int pa_time;
		this.pa_high = high;//char *pa_high, *pa_straight;
		this.pa_straight = straight;
	}

	const p_actions = [];
	p_actions.push(new PACT(d.ISHUH,	r.player.unconfuse,	d.HUHDURATION,	/* P_CONFUSE */
			"what a tripy feeling!",
			"wait, what's going on here. Huh? What? Who?" )),
	p_actions.push(new PACT(d.ISHALU,	r.player.come_down,	d.SEEDURATION,	/* P_LSD */
			"Oh, wow!  Everything seems so cosmic!",
			"Oh, wow!  Everything seems so cosmic!" )),
	p_actions.push(new PACT(0,		null,	0 )),	/* P_POISON */
	p_actions.push(new PACT(0,		null,	0 )),	/* P_STRENGTH */
	p_actions.push(new PACT(d.CANSEE,	r.player.unsee,	d.SEEDURATION,		/* P_SEEINVIS */
			prbuf,
			prbuf)),
	p_actions.push(new PACT(0,		null,	0 )),	/* P_HEALING */
	p_actions.push(new PACT(0,		null,	0 )),	/* P_MFIND */
	p_actions.push(new PACT(0,		null,	0 )),	/* P_TFIND  */
	p_actions.push(new PACT(0,		null,	0 )),	/* P_RAISE */
	p_actions.push(new PACT(0,		null,	0 )),	/* P_XHEAL */
	p_actions.push(new PACT(0,		null,	0 )),	/* P_HASTE */
	p_actions.push(new PACT(0,		null,	0 )),	/* P_RESTORE */
	p_actions.push(new PACT(d.ISBLIND,	r.player.sight,	d.SEEDURATION,	/* P_BLIND */
			"oh, bummer!  Everything is dark!  Help!",
			"a cloak of darkness falls around you")),
	p_actions.push(new PACT(d.ISLEVIT,	r.player.land,	d.HEALTIME,		/* P_LEVIT */
			"oh, wow!  You're floating in the air!",
			"you start to float in the air"  )),

	/*
	* quaff:
	*	Quaff a potion from the pack
	*/
	//void
	this.quaff = function(obj)
	{
		let tp, mp;//THING *obj, *tp, *mp;
		let discardit = false;
		let show, trip;



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
				r.UI.msg("you feel momentarily sick");
			else
			{
				chg_str(-(r.rnd(3) + 1));
				msg("you feel very sick now");
				come_down();
			}
			break; 
		case d.P_HEALING:
			pot_info[d.P_HEALING].oi_know = true;
			if ((pstats.s_hpt += roll(pstats.s_lvl, 4)) > max_hp)
				pstats.s_hpt = ++max_hp;
			sight();
			r.UI.msg("you begin to feel better");
			break; 
		case d.P_STRENGTH:
			pot_info[d.P_STRENGTH].oi_know = true;
			chg_str(1);
			r.UI.msg("you feel stronger, now.  What bulging muscles!");
			break; 
		case d.P_MFIND:
			player.t_flags |= d.SEEMONST;
			r.deamon.fuse(turn_see, true, d.HUHDURATION, d.AFTER);
			if (!turn_see(false))
				r.UI.msg("you have a %s feeling for a moment, then it passes",
			choose_str("normal", "strange"));
			break; 
		case d.P_TFIND:
			/*
			* Potion of magic detection.  Show the potions and scrolls
			*/
			show = false;
			if (lvl_obj != null)
			{
				wclear(hw);
				for (tp = lvl_obj; tp != null; tp = next(tp))
				{
					if (is_magic(tp))
					{
						show = true;
						wmove(hw, tp.o_pos.y, tp.o_pos.x);
						waddch(hw, d.MAGIC);
						pot_info[d.P_TFIND].oi_know = true;
					}
				}
				for (mp = mlist; mp != null; mp = next(mp))
				{
					for (tp = mp.t_pack; tp != null; tp = next(tp))
					{
						if (is_magic(tp))
						{
							show = true;
							wmove(hw, mp.t_pos.y, mp.t_pos.x);
							waddch(hw, d.MAGIC);
						}
					}
				}
			}
			if (show)
			{
				pot_info[d.P_TFIND].oi_know = true;
				show_win("You sense the presence of magic on this level.--More--");
			}
			else
				r.UI.msg("you have a %s feeling for a moment, then it passes",
			choose_str("normal", "strange"));
			break; 
		case d.P_LSD:
			if (!trip)
			{
				if (on(player, d.SEEMONST))
					turn_see(false);
				start_daemon(visuals, 0, d.BEFORE);
				seenstairs = seen_stairs();
			}
			do_pot(d.P_LSD, true);
			break; 
		case d.P_SEEINVIS:
			sprintf(prbuf, "this potion tastes like %s juice", fruit);
			show = on(player, CANSEE);
			do_pot(d.P_SEEINVIS, false);
			if (!show)
				invis_on();
			sight();
			break; 
		case d.P_RAISE:
			pot_info[d.P_RAISE].oi_know = true;
			r.UI.msg("you suddenly feel much more skillful");
			raise_level();
			break; 
		case d.P_XHEAL:
			pot_info[d.P_XHEAL].oi_know = true;
			if ((pstats.s_hpt += roll(pstats.s_lvl, 8)) > max_hp)
			{
				if (pstats.s_hpt > max_hp + pstats.s_lvl + 1)
					++max_hp;
				pstats.s_hpt = ++max_hp;
			}
			sight();
			come_down();
			r.UI.msg("you begin to feel much better");
			break; 
		case d.P_HASTE:
			pot_info[d.P_HASTE].oi_know = true;
			after = false;
			if (add_haste(true))
			r.UI.msg("you feel yourself moving much faster");
			break; 
		case d.P_RESTORE:
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
			r.UI.msg("hey, this tastes great.  It make you feel warm all over");
			break; 
		case d.P_BLIND:
			do_pot(d.P_BLIND, true);
			break; 
		case d.P_LEVIT:
			do_pot(d.P_LEVIT, true);
			break; 
		default:
			r.UI.msg("what an odd tasting potion!");
			r.UI.debug(`potion_type: ${obj.o_which}`);
			return;
		}
		r.UI.status();
		/*
		* Throw the item away
		*/

		call_it(pot_info[obj.o_which]);

		if (discardit)
			discard(obj);
		return;
	}

	/*
	* is_magic:
	*	Returns true if an object radiates magic
	*/
	//bool
	function is_magic(obj)//THING *obj)
	{
		switch (obj.o_type)
		{
		case d.ARMOR:
			return (bool)((obj.o_flags&d.ISPROT) || obj.o_arm != a_class[obj.o_which]);
		case WEAPON:
			return (bool)(obj.o_hplus != 0 || obj.o_dplus != 0);
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
	function invis_on()
	{
		let mp;

		player.t_flags |= d.CANSEE;
		for (mp = mlist; mp != null; mp = next(mp))
		if (on(mp, d.ISINVIS) && see_monst(mp) && !on(player, d.ISHALU))
			mvaddch(mp.t_pos.y, mp.t_pos.x, mp.t_disguise);
	}

	/*
	* turn_see:
	*	Put on or off seeing monsters on this level
	*/
	//bool
	function turn_see(turn_off)
	{
		let mp;//THING *mp;
		let can_see, add_new;

		add_new = false;
		for (mp = mlist; mp != null; mp = next(mp))
		{
			move(mp.t_pos.y, mp.t_pos.x);
			can_see = see_monst(mp);
			if (turn_off)
			{
				if (!can_see)
					addch(mp.t_oldch);
			}
			else
			{
				if (!can_see)
					standout();
				if (!on(player, d.ISHALU))
					addch(mp.t_type);
				else
					addch(rnd(26) + 'A');
				if (!can_see)
				{
					standend();
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
		let tp;//THING	*tp;

		move(stairs.y, stairs.x);
		if (inch() == d.STAIRS)			/* it's on the map */
		return true;
		if (ce(hero, stairs))			/* It's under him */
		return true;

		/*
		* if a monster is on the stairs, this gets hairy
		*/
		if ((tp = moat(stairs.y, stairs.x)) != null)
		{
		if (see_monst(tp) && on(tp, d.ISRUN))	/* if it's visible and awake */
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
		pstats.s_exp = e_levels[pstats.s_lvl-1] + 1;
		check_level();
	}

	/*
	* do_pot:
	*	Do a potion with standard setup.  This means it uses a fuse and
	*	turns on a flag
	*/

	//void
	function do_pot(type, knowit)//int type, bool knowit)
	{
		let pp;//PACT *pp;
		let t;

		pp = p_actions[type];
		if (!pot_info[type].oi_know)
			pot_info[type].oi_know = knowit;
		t = spread(pp.pa_time);
		if (!on(player, pp.pa_flags))
		{
			player.t_flags |= pp.pa_flags;
			fuse(pp.pa_daemon, 0, t, d.AFTER);
			look(false);
		}
		else
			lengthen(pp.pa_daemon, t);
		msg(choose_str(pp.pa_high, pp.pa_straight));
	}
}