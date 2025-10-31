/*
 * Functions to implement the various sticks one might find
 * while wandering around the dungeon.
  */
function sticks(r){

	const d = r.define;
    const t = r.types;

	const ws_info = r.globalValiable.ws_info;
	
	const rainbow = r.globalValiable.rainbow;
	const pick_color =(col)=>
	{
		return (on(r.player.player, d.ISHALU) ? rainbow[r.rnd(d.NCOLORS)] : col);
	}

    const ce = (a, b)=>{ return (a.x == b.x && a.y == b.y)};
	const on = (thing,flag)=>{return ((thing.t_flags & flag) != 0)};

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
	* fix_stick:
	*	Set up a new stick
	*/
	//->ItemManager
	
	/*
	* do_zap:
	*	Perform a zap with a wand
	*/
	this.do_zap = function(obj)
	{
		const player = r.player.player;
		const proom = player.t_room;
		const pstats = player.t_stats;
		const hero = player.t_pos;

		let tp;	//THING *obj, *tp;
		let y, x;
		let name;
		let monster, oldch;
		let bolt;	//static THING bolt;

		//if ((obj = r.item.thingsf.get_item("zap with", d.STICK)) == null)
		//	return;
		if (obj.o_type != d.STICK)
		{
			r.after = false;
			r.UI.msg("you can't zap with that!");
			return;
		}
		if (obj.o_charges == 0)
		{
			r.UI.msg("nothing happens");
			return;
		}

		let delta = r.UI.get_delta();

		switch (Number(obj.o_which))
		{
		case d.WS_LIGHT:
			/*
			* Reddy Kilowat wand.  Light up the room
			*/
			ws_info[d.WS_LIGHT].oi_know = true;
			if (proom.r_flags & d.ISGONE)
				r.UI.msg("the corridor glows and then fades");
			else
			{
				proom.r_flags &= ~d.ISDARK;
				/*
				* Light the room and put the player back up
				*/
				r.player.enter_room(hero);
				r.UI.addmsg("the room is lit");
				//if (!terse)
					r.UI.addmsg(` by a shimmering ${pick_color("blue")} light`);
				r.UI.endmsg("");
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

			while (r.dungeon.step_ok(r.dungeon.winat(y, x)))
			{
				y += delta.y;
				x += delta.x;
			}
			if ((tp = r.dungeon.moat(y, x)) != null)
			{
				monster = tp.t_type;
				if (monster == 'F')
					player.t_flags &= ~d.ISHELD;
				switch (Number(obj.o_which)) {
					case d.WS_INVIS:
						tp.t_flags |= d.ISINVIS;
						if (r.player.cansee(y, x))
							r.UI.mvaddch(y, x, tp.t_oldch);
						break;
					case d.WS_POLYMORPH:
					{
						let pp;//THING *pp;

						pp = tp.t_pack;
						r.dungeon.mlist = r.detach(r.dungeon.mlist, tp);
						if (r.player.see_monst(tp))
							r.UI.mvaddch(y, x, r.dungeon.chat(y, x));
						oldch = tp.t_oldch;
						delta.y = y;
						delta.x = x;
						r.monster.new_monster(tp, monster = (r.rnd(26) + 'A'.charCodeAt(0)), delta);
						if (r.player.see_monst(tp))
							r.UI.mvaddch(y, x, monster);
						tp.t_oldch = oldch;
						tp.t_pack = pp;
						ws_info[d.WS_POLYMORPH].oi_know |= r.player.see_monst(tp);
						break;
					}
					case d.WS_CANCEL:
						tp.t_flags |= d.ISCANC;
						tp.t_flags &= ~(d.ISINVIS|d.CANHUH);
						tp.t_disguise = tp.t_type;
						if (r.player.see_monst(tp))
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
								r.dungeon.find_floor(null, new_pos, false, true);
							} while (ce(new_pos, hero));
						}
						else
						{
							new_pos.y = hero.y + delta.y;
							new_pos.x = hero.x + delta.x;
						}
						tp.t_dest = hero;
						tp.t_flags |= d.ISRUN;
						r.monster.relocate(tp, new_pos);
					}
				}
			}
			break; 
		case d.WS_MISSILE:
			ws_info[d.WS_MISSILE].oi_know = true;
			bolt = r.new_item();
			bolt.o_type = '*';
			bolt.o_hurldmg = "1x4";
			bolt.o_hplus = 100;
			bolt.o_dplus = 1;
			bolt.o_flags = d.ISMISL;
			const cw = r.player.get_cur_weapon();
			if (cw != null)
				bolt.o_launch = cw.o_which;
			r.item.weapon.do_motion(bolt, delta.y, delta.x);
			if ((tp = r.dungeon.moat(bolt.o_pos.y, bolt.o_pos.x)) != null
			&& !save_throw(VS_MAGIC, tp))
				r.item.weapon.hit_monster(bolt.o_pos.y ,bolt.o_pos.x , bolt);
			//else if (terse)
			//	r.UI.msg("missle vanishes");
			else
				r.UI.msg("the missle vanishes with a puff of smoke");
			break; 
		case d.WS_HASTE_M:
		case d.WS_SLOW_M:
			y = hero.y;
			x = hero.x;
			while (r.dungeon.step_ok(r.dungeon.winat(y, x)))
			{
				y += delta.y;
				x += delta.x;
			}
			if ((tp = r.dungeon.moat(y, x)) != null)
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
				r.monster.runto(delta);
			}
			break; 
		case d.WS_ELECT:
		case d.WS_FIRE:
		case d.WS_COLD:
			if (obj.o_which == d.WS_ELECT)
				name = "bolt";
			else if (obj.o_which == d.WS_FIRE)
				name = "flame";
			else
				name = "ice";
			this.fire_bolt(hero, delta, name);
			ws_info[obj.o_which].oi_know = true;
			break; 
		case WS_NOP:
			r.UI.msg("no operation. what a bizarre schtick!");
			break;
		default:
			r.UI.msg("what a bizarre schtick!");
		}
		obj.o_charges--;
	}

	/*
	* drain:
	*	Do drain hit points from player shtick
	*/
	//void
	function drain()
	{
		const player = r.player.player;
		const proom = player.t_room;
		const pstats = player.t_stats;
		const hero = player.t_pos;

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
		if (r.dungeon.chat(hero.y, hero.x) == d.DOOR)
			corp = r.dungeon.passages[r.dungeon.flat(hero.y, hero.x) & d.F_PNUM];
		else
			corp = null;
		inpass = (proom.r_flags & d.ISGONE);
		for (mp = r.dungeon.mlist; mp != null; mp = mp.l_next)
			if (mp.t_room == proom || mp.t_room == corp ||
				(inpass && chat(mp.t_pos.y, mp.t_pos.x) == d.DOOR &&
				passages[flat(mp.t_pos.y, mp.t_pos.x) & d.F_PNUM] == proom))
			{	
				drainee.push(mp);
			}
		if ((cnt = drainee.length) == 0)
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
		for (let i in drainee)
		{
			mp = drainee[i];
			if ((mp.t_stats.s_hpt -= cnt) <= 0)
				r.monster.battle.killed(mp, r.player.see_monst(mp));
			else
				r.monster.runto(mp.t_pos);
		}
	}

	/*
	* fire_bolt:
	*	Fire a bolt in a given direction from a specific starting place
	*/
	//void
	this.fire_bolt = function(start, dir, name)//coord *start, coord *dir, char *name)
	{
		const def =()=>{
			if (!hit_hero && (tp = moat(pos.y, pos.x)) != null)
			{
				hit_hero = true;
				changed = !changed;
				tp.t_oldch = r.dungeon.chat(pos.y, pos.x);
				if (!save_throw(d.VS_MAGIC, tp))
				{
					bolt.o_pos = pos;
					used = true;
					if (tp.t_type == 'D' && name == "flame") 
					{
						r.UI.addmsg("the flame bounces");
						//if (!terse)
						r.UI.addmsg(" off the dragon");
						r.UI.endmsg("");
					}
					else
						r.item.weapon.hit_monster(pos.y, pos.x, bolt);
				}
				else if (ch != 'M' || tp.t_disguise == 'M')
				{
					if (start == hero)
						r.monster.runto(pos);
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
				if (!r.player.save(d.VS_MAGIC))
				{
				if ((pstats.s_hpt -= r.roll(6, 6)) <= 0)
				{
					if (start == hero)
					r.death('b');
					else
					r.death(r.dungeon.moat(start.y, start.x).t_type);
				}
				used = true;
				//if (terse)
				//	r.UI.msg(`the ${name} hits`);
				//else
					r.UI.msg(`you are hit by the ${name}`);
				}
				else
					r.UI.msg(`the ${name} whizzes by you`);
			}
		}
		const player = r.player.player;
		const proom = player.t_room;
		const pstats = player.t_stats;
		const hero = player.t_pos;

		let c1, c2;	//coord *c1, *c2;
		let tp;	//THING *tp;
		let dirch = 0, ch;
		let hit_hero, used, changed;
		let pos;	//static coord pos;
		let spotpos = [];//static coord spotpos[BOLT_LENGTH];
		let bolt;	//THING bolt;

		bolt.o_type = d.WEAPON;
		bolt.o_which = d.FLAME;
		bolt.o_hurldmg = "6x6";
		bolt.o_hplus = 100;
		bolt.o_dplus = 0;
		weap_info[d.FLAME].oi_name = name;
		switch (dir.y + dir.x)
		{
			case 0: dirch = '/';
				break; 
			case 1: 
			case -1: 
				dirch = (dir.y == 0 ? '-' : '|');
				break; 
			case 2: 
			case -2: 
				dirch = '\\';
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
			ch = r.dungeon.winat(pos.y, pos.x);
			switch (ch)
			{
				case d.DOOR:
				/*
				* this code is necessary if the hero is on a door
				* and he fires at the wall the door is in, it would
				* otherwise loop infinitely
				*/
				if (ce(hero, pos))
					def();//goto def;
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
		//def:	
					def();		
			}
			r.UI.mvaddch(pos.y, pos.x, dirch);
			//refresh();
				
		}
		for (c2 = spotpos; c2 < c1; c2++)
		r.UI.mvaddch(c2.y, c2.x, r.dungeon.chat(c2.y, c2.x));
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
		//else if (terse)
		//	buf = ` [${obj.o_charges}]`;
		else
			buf = ` [${obj.o_charges} charges]`;
		return buf;
	}
}