/*
 * Functions to implement the various sticks one might find
 * while wandering around the dungeon.
  */
function sticks(r){

	const d = r.define;
    const t = r.types;
	/*
	* fix_stick:
	*	Set up a new stick
	*/
	this.fix_stick = function(cur)//THING *cur)
	{
		if ( ws_type[cur.o_which] == "staff")
			cur.o_damage = "2x3";
		else
			cur.o_damage = "1x1";
		cur.o_hurldmg = "1x1";

		switch (cur.o_which)
		{
		case d.WS_LIGHT:
			cur.o_charges = r.rnd(10) + 10;
		break; default:
			cur.o_charges = r.rnd(5) + 3;
		}
	}

	/*
	* do_zap:
	*	Perform a zap with a wand
	*/
	this.do_zap = function()
	{
		let obj, tp;	//THING *obj, *tp;
		let y, x;
		let name;
		let monster, oldch;
		let bolt;	//static THING bolt;

		if ((obj = r.item.thingsf.get_item("zap with", d.STICK)) == null)
			return;
		if (obj.o_type != d.STICK)
		{
			after = false;
			r.UI.msg("you can't zap with that!");
			return;
		}
		if (obj.o_charges == 0)
		{
			r.UI.msg("nothing happens");
			return;
		}
		switch (obj.o_which)
		{
		case d.WS_LIGHT:
			/*
			* Reddy Kilowat wand.  Light up the room
			*/
			ws_info[d.WS_LIGHT].oi_know = true;
			if (proom.r_flags & d.ISGONE)
				msg("the corridor glows and then fades");
			else
			{
				proom.r_flags &= ~d.ISDARK;
				/*
				* Light the room and put the player back up
				*/
				enter_room(hero);
				r.UI.addmsg("the room is lit");
				if (!terse)
					r.UI.addmsg(` by a shimmering ${pick_color("blue")} light`);
				r.UI.endmsg();
			}
			break; 
		case d.WS_DRAIN:
			/*
			* take away 1/2 of hero's hit points, then take it away
			* evenly from the monsters in the room (or next to hero
			* if he is in a passage)
			*/
			if (pstats.s_hpt < 2)
			{
				r.UI.msg("you are too weak to use it");
				return;
			}
			else
				drain();
			break; 
		case d.WS_INVIS:
		case d.WS_POLYMORPH:
		case d.WS_TELAWAY:
		case d.WS_TELTO:
		case d.WS_CANCEL:
			y = hero.y;
			x = hero.x;
			while (step_ok(winat(y, x)))
			{
				y += delta.y;
				x += delta.x;
			}
			if ((tp = moat(y, x)) != null)
			{
				monster = tp.t_type;
				if (monster == 'F')
					player.t_flags &= ~d.ISHELD;
				switch (obj.o_which) {
					case d.WS_INVIS:
						tp.t_flags |= d.ISINVIS;
						if (cansee(y, x))
							mvaddch(y, x, tp.t_oldch);
						break;
					case d.WS_POLYMORPH:
					{
						let pp;//THING *pp;

						pp = tp.t_pack;
						r.dungeon.mlist = detach(r.dungeon.mlist, tp);
						if (see_monst(tp))
							r.UI.mvaddch(y, x, chat(y, x));
						oldch = tp.t_oldch;
						delta.y = y;
						delta.x = x;
						new_monster(tp, monster = (char)(rnd(26) + 'A'), delta);
						if (see_monst(tp))
							r.UI.mvaddch(y, x, monster);
						tp.t_oldch = oldch;
						tp.t_pack = pp;
						ws_info[d.WS_POLYMORPH].oi_know |= see_monst(tp);
						break;
					}
					case d.WS_CANCEL:
						tp.t_flags |= d.ISCANC;
						tp.t_flags &= ~(d.ISINVIS|d.CANHUH);
						tp.t_disguise = tp.t_type;
						if (see_monst(tp))
							r.UI.mvaddch(y, x, tp.t_disguise);
						break;
					case d.WS_TELAWAY:
					case d.WS_TELTO:
					{
						let new_pos = {};//coord new_pos;

						if (obj.o_which == d.WS_TELAWAY)
						{
							do
							{
							find_floor(null, new_pos, false, true);
							} while (ce(new_pos, hero));
						}
						else
						{
							new_pos.y = hero.y + delta.y;
							new_pos.x = hero.x + delta.x;
						}
						tp.t_dest = hero;
						tp.t_flags |= d.ISRUN;
						relocate(tp, new_pos);
					}
				}
			}
			break; 
		case d.WS_MISSILE:
			ws_info[d.WS_MISSILE].oi_know = true;
			bolt.o_type = '*';
			bolt.o_hurldmg = "1x4";
			bolt.o_hplus = 100;
			bolt.o_dplus = 1;
			bolt.o_flags = d.ISMISL;
			if (cur_weapon != null)
				bolt.o_launch = cur_weapon.o_which;
			do_motion(bolt, delta.y, delta.x);
			if ((tp = moat(bolt.o_pos.y, bolt.o_pos.x)) != null
			&& !save_throw(VS_MAGIC, tp))
				hit_monster(unc(bolt.o_pos), bolt);
			else if (terse)
				r.UI.msg("missle vanishes");
			else
				r.UI.msg("the missle vanishes with a puff of smoke");
			break; 
		case d.WS_HASTE_M:
		case d.WS_SLOW_M:
			y = hero.y;
			x = hero.x;
			while (step_ok(winat(y, x)))
			{
				y += delta.y;
				x += delta.x;
			}
			if ((tp = moat(y, x)) != null)
			{
				if (obj.o_which == d.WS_HASTE_M)
				{
					if (on(tp, d.ISSLOW))
						tp.t_flags &= ~d.ISSLOW;
					else
						tp.t_flags |= d.ISHASTE;
				}
				else
				{
					if (on(tp, d.ISHASTE))
						tp.t_flags &= ~d.ISHASTE;
					else
						tp.t_flags |= d.ISSLOW;
					tp.t_turn = true;
				}
				delta.y = y;
				delta.x = x;
				runto(delta);
			}
		break; case d.WS_ELECT:
		case d.WS_FIRE:
		case d.WS_COLD:
			if (obj.o_which == d.WS_ELECT)
				name = "bolt";
			else if (obj.o_which == d.WS_FIRE)
				name = "flame";
			else
				name = "ice";
			fire_bolt(hero, delta, name);
			ws_info[obj.o_which].oi_know = true;
		break; case WS_NOP:
			break;
		break; default:
			r.UI.msg("what a bizarre schtick!");
		}
		obj.o_charges--;
	}

	/*
	* drain:
	*	Do drain hit points from player shtick
	*/
	//void
	this.drain = function()
	{
		let mp;	//THING *mp;
		let corp;	//struct room *corp;
		let dp;	//THING **dp;
		let cnt;
		let inpass;
		let drainee = [];//static THING *drainee[40];

		/*
		* First cnt how many things we need to spread the hit points among
		*/
		cnt = 0;
		if (chat(hero.y, hero.x) == d.DOOR)
			corp = passages[flat(hero.y, hero.x) & d.F_PNUM];
		else
			corp = null;
		inpass = (bool)(proom.r_flags & d.ISGONE);
		dp = drainee;
		for (mp = r.dungeon.mlist; mp != null; mp = next(mp))
			if (mp.t_room == proom || mp.t_room == corp ||
				(inpass && chat(mp.t_pos.y, mp.t_pos.x) == d.DOOR &&
				passages[flat(mp.t_pos.y, mp.t_pos.x) & d.F_PNUM] == proom))
				dp++; dp = mp;
		if ((cnt = (int)(dp - drainee)) == 0)
		{
			r.UI.msg("you have a tingling feeling");
			return;
		}
		dp = null;
		pstats.s_hpt /= 2;
		cnt = pstats.s_hpt / cnt;
		/*
		* Now zot all of the monsters
		*/
		for (dp = drainee; dp; dp++)
		{
			mp = dp;
			if ((mp.t_stats.s_hpt -= cnt) <= 0)
				killed(mp, see_monst(mp));
			else
				runto(mp.t_pos);
		}
	}

	/*
	* fire_bolt:
	*	Fire a bolt in a given direction from a specific starting place
	*/
	//void
	this.fire_bolt = function(start, dir, name)//coord *start, coord *dir, char *name)
	{
		let c1, c2;	//coord *c1, *c2;
		let tp;	//THING *tp;
		let dirch = 0, ch;
		let hit_hero, used, changed;
		let pos;	//static coord pos;
		let spotpos = [];//static coord spotpos[BOLT_LENGTH];
		let bolt;	//THING bolt;

		bolt.o_type = d.WEAPON;
		bolt.o_which = d.FLAME;
		strncpy(bolt.o_hurldmg,"6x6",sizeof(bolt.o_hurldmg));
		bolt.o_hplus = 100;
		bolt.o_dplus = 0;
		weap_info[d.FLAME].oi_name = name;
		switch (dir.y + dir.x)
		{
			case 0: dirch = '/';
			break; case 1: case -1: dirch = (dir.y == 0 ? '-' : '|');
			break; case 2: case -2: dirch = '\\';
		}
		pos = start;
		hit_hero = (start != hero);
		used = false;
		changed = false;
		for (c1 = spotpos; c1 <= spotpos[d.BOLT_LENGTH-1] && !used; c1++)
		{
			pos.y += dir.y;
			pos.x += dir.x;
			c1 = pos;
			ch = winat(pos.y, pos.x);
			switch (ch)
			{
				case d.DOOR:
				/*
				* this code is necessary if the hero is on a door
				* and he fires at the wall the door is in, it would
				* otherwise loop infinitely
				*/
				if (ce(hero, pos))
					;//goto def;
				/* FALLTHROUGH */
				case '|':
				case '-':
				case ' ':
				if (!changed)
					hit_hero = !hit_hero;
				changed = false;
				dir.y = -dir.y;
				dir.x = -dir.x;
				c1--;
				r.UI.msg(`he ${name} bounces`);
				break;
				default:
		def:
				if (!hit_hero && (tp = moat(pos.y, pos.x)) != null)
				{
					hit_hero = true;
					changed = !changed;
					tp.t_oldch = chat(pos.y, pos.x);
					if (!save_throw(d.VS_MAGIC, tp))
					{
						bolt.o_pos = pos;
						used = true;
						if (tp.t_type == 'D' && name == "flame") 
						{
							r.UI.addmsg("the flame bounces");
							if (!terse)
							r.UI.addmsg(" off the dragon");
							r.UI.endmsg();
						}
						else
							hit_monster(unc(pos), bolt);
					}
					else if (ch != 'M' || tp.t_disguise == 'M')
					{
						if (start == hero)
							runto(pos);
						if (terse)
							r.UI.msg(`${name} misses`);
						else
							r.UI.msg(`the ${name} whizzes past ${set_mname(tp)}`);
					}
				}
				else if (hit_hero && ce(pos, hero))
				{
					hit_hero = false;
					changed = !changed;
					if (!save(d.VS_MAGIC))
					{
					if ((pstats.s_hpt -= roll(6, 6)) <= 0)
					{
						if (start == hero)
						death('b');
						else
						death(moat(start.y, start.x).t_type);
					}
					used = true;
					if (terse)
						r.UI.msg(`the ${name} hits`);
					else
						r.UI.msg(`you are hit by the ${name}`);
					}
					else
					r.UI.msg(`the ${name} whizzes by you`);
				}
				r.UI.mvaddch(pos.y, pos.x, dirch);
				refresh();
			}
		}
		for (c2 = spotpos; c2 < c1; c2++)
		r.UI.mvaddch(c2.y, c2.x, chat(c2.y, c2.x));
	}

	/*
	* charge_str:
	*	Return an appropriate string for a wand charge
	*/
	this.charge_str = function(obj)//THING *obj)
	{
		let buf;//static char buf[20];

		if (!(obj.o_flags & d.ISKNOW))
			buf = '';
		else if (terse)
			buf = ` [${obj.o_charges}]`;
		else
			buf = ` [${obj.o_charges} charges]`;
		return buf;
	}
}