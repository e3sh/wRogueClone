/*
 * All the fighting gets done here
 */
function battle(r){

	const EQSTR = (a, b) => { return (a == b) };

	const h_names = [		/* strings for hitting */
		" scored an excellent hit on ",
		" hit ",
		" have injured ",
		" swing and hit ",
		" scored an excellent hit on ",
		" hit ",
		" has injured ",
		" swings and hits "
	];

	const m_names = [		/* strings for missing */
		" miss",
		" swing and miss",
		" barely miss",
		" don't hit",
		" misses",
		" swings and misses",
		" barely misses",
		" doesn't hit",
	];

	/*
	* adjustments to hit probabilities due to strength
	*/
	const str_plus = [//static int str_plus[] = {
		-7, -6, -5, -4, -3, -2, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1,
		1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3,
	];

	/*
	* adjustments to damage done due to strength
	*/
	const add_dam = [//static int add_dam[] = {
		-7, -6, -5, -4, -3, -2, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 3,
		3, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6
	];

	const d = r.define;
    const t = r.types;

	const monsters =  r.globalValiable.monsters;

	const terse = false; //
	const on = (thing,flag)=>{return ((thing.t_flags & flag) != 0)};
	const isupper =(ch)=> { return ch === ch.toUpperCase() && ch !== ch.toLowerCase(); }

	/*	Choose the first or second string depending on whether it the
    *	player is tripping
    */
    //char *
    function choose_str(ts, ns)
    {
        return (on(r.player.player, d.ISHALU) ? ts : ns);
    }
	/*
	* fight:
	*	The player attacks the monster.
	*/
	this.fight = function(mp, weap, thrown)//coord *mp, THING *weap, bool thrown)
	{
		const player = r.player.player;

		let tp;	//register THING *tp;
		let did_hit = true;	//register bool did_hit = TRUE;
		let mname, ch;	//register char *mname, ch;

		/*
		* Find the monster we want to fight
		*/
	//#ifdef MASTER
		if ((tp = r.dungeon.moat(mp.y, mp.x)) == null)
			r.UI.debug(`Fight what @ y:${mp.y},x:${mp.x}`);
	//#else
		tp = r.dungeon.moat(mp.y, mp.x);
	//#endif
		/*
		* Since we are fighting, things are not quiet so no healing takes
		* place.
		*/
		count = 0;
		quiet = 0;
		r.monster.runto(mp);
		/*
		* Let him know it was really a xeroc (if it was one).
		*/
		ch = '\0';
		if (tp.t_type == 'X' && tp.t_disguise != 'X' && !on(player, d.ISBLIND))
		{
			tp.t_disguise = 'X';
			if (on(player, ISHALU)) {
				ch = String.fromCharCode(r.rnd(26) + Number('A'.charCodeAt(0)));
				r.UI.mvaddch(tp.t_pos.y, tp.t_pos.x, ch);
			}
			r.UI.msg(choose_str("heavy!  That's a nasty critter!",
					"wait!  That's a xeroc!"));
			if (!thrown)
				return false;
		}
		mname = this.set_mname(tp);
		did_hit = false;
		has_hit = (terse && !r.to_death);
		if (roll_em(player, tp, weap, thrown))
		{
			did_hit = false;
			if (thrown)
				thunk(weap, mname, terse);
			else
				hit(null, mname, terse);//(char *) NULL
			if (on(player, d.CANHUH))
			{
				did_hit = true;
				tp.t_flags |= d.ISHUH;
				player.t_flags &= ~d.CANHUH;
				r.UI.endmsg();
				has_hit = false;
				r.UI.msg(`your hands stop glowing ${pick_color("red")}`);
			}
			if (tp.t_stats.s_hpt <= 0)
				killed(tp, true);
			else if (did_hit && !on(player, d.ISBLIND))
				r.UI.msg(`${mname} appears confused`);
			did_hit = true;
		}
		else
		if (thrown)
			bounce(weap, mname, terse);
		else
			miss(null, mname, terse); //(char *) NULL
		return did_hit;
	}

	/*
	* attack:
	*	The monster attacks the player
	*/
	//int
	this.attack = function(mp)//THING *mp)
	{
		let mname;	//register char *mname;
		let oldhp;	//register int oldhp;
		/*
		* Since this is an attack, stop running and any healing that was
		* going on at the time.
		*/
		running = FALSE;
		count = 0;
		quiet = 0;
		if (to_death && !on(mp, ISTARGET))
		{
			to_death = FALSE;
			kamikaze = FALSE;
		}
		if (mp.t_type == 'X' && mp.t_disguise != 'X' && !on(player, ISBLIND))
		{
			mp.t_disguise = 'X';
			if (on(player, ISHALU))
				mvaddch(mp.t_pos.y, mp.t_pos.x, rnd(26) + 'A');
		}
		mname = set_mname(mp);
		oldhp = pstats.s_hpt;
		if (roll_em(mp, player, NULL, FALSE))//(THING *) NULL
		{
		if (mp.t_type != 'I')
		{
			if (has_hit)
			addmsg(".  ");
			hit(mname, null, false); //(char *) NULL
		}
		else
			if (has_hit)
			endmsg();
		has_hit = FALSE;
		if (pstats.s_hpt <= 0)
			death(mp.t_type);	/* Bye bye life ... */
		else if (!kamikaze)
		{
			oldhp -= pstats.s_hpt;
			if (oldhp > max_hit)
			max_hit = oldhp;
			if (pstats.s_hpt <= max_hit)
			to_death = FALSE;
		}
		if (!on(mp, ISCANC))
			switch (mp.t_type)
			{
			case 'A':
				/*
				* If an aquator hits, you can lose armor class.
				*/
				rust_armor(cur_armor);
				break; 
			case 'I':
				/*
				* The ice monster freezes you
				*/
				player.t_flags &= ~ISRUN;
				if (!no_command)
				{
				addmsg("you are frozen");
				if (!terse)
					addmsg(" by the %s", mname);
				endmsg();
				}
				no_command += rnd(2) + 2;
				if (no_command > BORE_LEVEL)
				death('h');
				break; 
			case 'R':
				/*
				* Rattlesnakes have poisonous bites
				*/
				if (!save(VS_POISON))
				{
				if (!ISWEARING(R_SUSTSTR))
				{
					chg_str(-1);
					if (!terse)
					msg("you feel a bite in your leg and now feel weaker");
					else
					msg("a bite has weakened you");
				}
				else if (!to_death)
				{
					if (!terse)
					msg("a bite momentarily weakens you");
					else
					msg("bite has no effect");
				}
				}
				break; 
			case 'W':
			case 'V':
				/*
				* Wraiths might drain energy levels, and Vampires
				* can steal max_hp
				*/
				if (rnd(100) < (mp.t_type == 'W' ? 15 : 30))
				{
					let fewer;	//register int fewer;

					if (mp.t_type == 'W')
					{
						if (pstats.s_exp == 0)
							death('W');		/* All levels gone */
						if (--pstats.s_lvl == 0)
						{
							pstats.s_exp = 0;
							pstats.s_lvl = 1;
						}
						else
							pstats.s_exp = e_levels[pstats.s_lvl-1]+1;
						fewer = roll(1, 10);
					}
					else
						fewer = roll(1, 3);
					pstats.s_hpt -= fewer;
					max_hp -= fewer;
					if (pstats.s_hpt <= 0)
						pstats.s_hpt = 1;
					if (max_hp <= 0)
						death(mp.t_type);
					msg("you suddenly feel weaker");
				}
				break; 
			case 'F':
				/*
				* Venus Flytrap stops the poor guy from moving
				*/
				player.t_flags |= ISHELD;
				sprintf(monsters['F'-'A'].m_stats.s_dmg,"%dx1", ++vf_hit);
				if (--pstats.s_hpt <= 0)
				death('F');
			break; 
			case 'L':
			{
				/*
				* Leperachaun steals some gold
				*/
				let lastpurse;//register int lastpurse;

				lastpurse = purse;
				purse -= GOLDCALC;
				if (!save(VS_MAGIC))
				purse -= GOLDCALC + GOLDCALC + GOLDCALC + GOLDCALC;
				if (purse < 0)
				purse = 0;
				remove_mon(mp.t_pos, mp, FALSE);
						mp=NULL;
				if (purse != lastpurse)
				msg("your purse feels lighter");
			}
			break; 
			case 'N':
			{
				let obj, steal;//register THING *obj, *steal;
				let nobj;	//register int nobj;

				/*
				* Nymph's steal a magic item, look through the pack
				* and pick out one we like.
				*/
				steal = NULL;
				for (nobj = 0, obj = pack; obj != NULL; obj = next(obj))
				if (obj != cur_armor && obj != cur_weapon
					&& obj != cur_ring[LEFT] && obj != cur_ring[RIGHT]
					&& is_magic(obj) && rnd(++nobj) == 0)
					steal = obj;
				if (steal != NULL)
				{
					remove_mon(mp.t_pos, moat(mp.t_pos.y, mp.t_pos.x), FALSE);
								mp=NULL;
					leave_pack(steal, FALSE, FALSE);
					msg("she stole %s!", inv_name(steal, TRUE));
					discard(steal);
				}
			}
			break;
			default:
				break;
			}
		}
		else if (mp.t_type != 'I')
		{
		if (has_hit)
		{
			addmsg(".  ");
			has_hit = FALSE;
		}
		if (mp.t_type == 'F')
		{
			pstats.s_hpt -= vf_hit;
			if (pstats.s_hpt <= 0)
			death(mp.t_type);	/* Bye bye life ... */
		}
		miss(mname, NULL, FALSE); //(char *) NULL
		}
		if (fight_flush && !to_death)
		flush_type();
		count = 0;
		status();
		if (mp == NULL)
			return(-1);
		else
			return(0);
	}

	/*
	* set_mname:
	*	return the monster name for the given monster
	*/
	//char *
	this.set_mname = function(tp)//THING *tp)
	{
		const player = r.player.player;

		let ch;	//int ch;
		let st;
		let mname;	//char *mname;
		//static char tbuf[MAXSTR] = { 't', 'h', 'e', ' ' };
		let tbuf = "the ";

		if (!r.player.see_monst(tp) && !on(player, d.SEEMONST))
			return (terse ? "it" : "something");
		else if (on(player, d.ISHALU))
		{
			r.UI.move(tp.t_pos.y, tp.t_pos.x);
			st = r.UI.inch();
			//ch = st.charCodeAt(0); //toascii(inch());
			if (!isupper(st))//ch
				ch = r.rnd(26);
			else
				ch -= Number('A'.charCodeAt(0));
			mname = monsters[ch].m_name;
		}
		else
			mname = monsters[Number(tp.t_type.charCodeAt(0)) - Number('A'.charCodeAt(0))].m_name;
		tbuf += mname;
		//console.log(tbuf);
		return tbuf;
	}

	/*
	* swing:
	*	Returns true if the swing hits
	*/
	//int
	function swing(at_lvl, op_arm, wplus)//int at_lvl, int op_arm, int wplus)
	{
		let res = r.rnd(20); //int res = rnd(20);
		let need = (20 - at_lvl) - op_arm;//int need = (20 - at_lvl) - op_arm;

		return (res + wplus >= need);
	}

	/*
	* roll_em:
	*	Roll several attacks
	*/
	//bool
	function roll_em(thatt, thdef, weap, hurl)//THING *thatt, THING *thdef, THING *weap, bool hurl)
	{
		const ISRING = (h,r)=>  {cur_ring[h] != null && cur_ring[h].o_which == r} ;

		const pst = r.player.get_status();

		const cur_ring = pst.ring;
		const cur_armor = pst.arm;
		const cur_weapon = pst.weap;

		const pstats = r.player.player.t_stats;
		
		let att, def;	//register struct stats *att, *def;
		let cp;	//register char *cp;
		let ndice, nsides, def_arm;	//register int ndice, nsides, def_arm;
		let did_hit = false;//register bool did_hit = FALSE;
		let hplus;	//register int hplus;
		let dplus;	//register int dplus;
		let damage;	//register int damage;

		att = thatt.t_stats;
		def = thdef.t_stats;
		if (weap == null)
		{
			cp = att.s_dmg;
			dplus = 0;
			hplus = 0;
		}
		else
		{
			hplus = (weap == null ? 0 : weap.o_hplus);
			dplus = (weap == null ? 0 : weap.o_dplus);
			if (weap == cur_weapon)
			{
				if (ISRING(d.LEFT, d.R_ADDDAM))
					dplus += cur_ring[d.LEFT].o_arm;
				else if (ISRING(d.LEFT, d.R_ADDHIT))
					hplus += cur_ring[d.LEFT].o_arm;
				if (ISRING(d.RIGHT, d.R_ADDDAM))
					dplus += cur_ring[d.RIGHT].o_arm;
				else if (ISRING(d.RIGHT, d.R_ADDHIT))
					hplus += cur_ring[d.RIGHT].o_arm;
			}
			cp = weap.o_damage;
			if (hurl)
			{
				if ((weap.o_flags&d.ISMISL) && cur_weapon != null &&
				cur_weapon.o_which == weap.o_launch)
				{
					cp = weap.o_hurldmg;
					hplus += cur_weapon.o_hplus;
					dplus += cur_weapon.o_dplus;
				}
				else if (weap.o_launch < 0)
					cp = weap.o_hurldmg;
			}
		}
		/*
		* If the creature being attacked is not running (alseep or held)
		* then the attacker gets a plus four bonus to hit.
		*/
		if (!on(thdef, d.ISRUN))
		hplus += 4;
		def_arm = def.s_arm;
		if (def == pstats)
		{
			if (cur_armor != null)
				def_arm = cur_armor.o_arm;
			if (ISRING(d.LEFT, d.R_PROTECT))
				def_arm -= cur_ring[d.LEFT].o_arm;
			if (ISRING(d.RIGHT, d.R_PROTECT))
				def_arm -= cur_ring[d.RIGHT].o_arm;
		}

		let rolldmg = cp;
		//for (let i=0; i < cp.length; i++)
		//while(cp != null && cp != '\0')
		{
			cp = rolldmg.substring(0,0);
			ndice = Number(cp); //atoi(cp);
			//if ((cp = strchr(cp, 'x')) == null)
			//	break;
			nsides = Number(rolldmg.substring(2,2));//atoi(++cp);
			if (swing(att.s_lvl, def_arm, hplus + str_plus[att.s_str]))
			{
				let proll; //int proll;

				proll = r.roll(ndice, nsides);
	//	#ifdef MASTER
				if (ndice + nsides > 0 && proll <= 0)
					console.log(
					`Damage for ${ndice}x${nsides} came out ${proll}, dplus = ${dplus}, add_dam = ${add_dam[att.s_str]}, def_arm = ${def_arm}`);
	//	#endif
				damage = dplus + proll + add_dam[att.s_str];
				def.s_hpt -= Math.max([0, damage]);
				did_hit = true;
			}
			//if ((cp = strchr(cp, '/')) == NULL)
			//	break;
			//cp++;
		}
		return did_hit;
	}

	/*
	* prname:
	*	The print name of a combatant
	*/
	//char *
	function prname(mname, upper)//char *mname, bool upper)
	{
		let tbuf;//static char tbuf[MAXSTR];

		tbuf = ' ';
		if (mname == null)
			tbuf = "you"; 
		else
			tbuf = mname;
		if (upper)
			;tbuf // = (char) toupper(*tbuf);
		//console.log(tbuf);
		return tbuf;
	}

	/*
	* thunk:
	*	A missile hits a monster
	*/
	//void
	function thunk(weap, mname, noend)//THING *weap, char *mname, bool noend)
	{
		if (to_death)
			return;
		if (weap.o_type == d.WEAPON)
			addmsg(`the ${weap_info[weap.o_which].oi_name} hits ` );
		else
			addmsg("you hit ");
		addmsg(`${mname}`);
		if (!noend)
			endmsg();
	}

	/*
	* hit:
	*	Print a message to indicate a succesful hit
	*/
	//void
	function hit(er, ee, noend)//char *er, char *ee, bool noend)
	{
		let i;
		let s;
		//h_names = []//extern char *h_names[];

		if (r.to_death)
			return;
		r.UI.addmsg(`${prname(er, false)}`);
		if (terse)
			s = " hit";
		else
		{
			i = r.rnd(4);
			if (er != null)
				i += 4;
			s = h_names[i];
		}
		r.UI.addmsg(s);
		if (!terse)
			r.UI.addmsg(` ${prname(ee, false)}`);
		if (!noend)
			r.UI.endmsg();
	}

	/*
	* miss:
	*	Print a message to indicate a poor swing
	*/
	//void
	function miss(er, ee, noend)//char *er, char *ee, bool noend)
	{
		let i;
		//m_names = [];

		if (r.to_death)
			return;
		r.UI.addmsg(`${prname(er, false)}`);
		if (terse)
			i = 0;
		else
			i = r.rnd(4);
		if (er != null)
			i += 4;
		r.UI.addmsg(m_names[i]);
		if (!terse)
			r.UI.addmsg(` ${prname(ee, false)}`);
		if (!noend)
			r.UI.endmsg();
	}

	/*
	* bounce:
	*	A missile misses a monster
	*/
	//void
	function bounce(weap, mname, noend)//THING *weap, char *mname, bool noend)
	{
		if (to_death)
			return;
		if (weap.o_type == d.WEAPON)
			r.UI.addmsg(`the ${weap_info[weap.o_which].oi_name} misses `);
		else
			r.UI.addmsg("you missed ");
		r.UI.addmsg(mname);
		if (!noend)
			r.UI.endmsg();
	}

	/*
	* remove_mon:
	*	Remove a monster from the screen
	*/
	//void
	function remove_mon(mp,tp, waskill)//coord *mp, THING *tp, bool waskill)
	{
		let obj, nexti;	//register THING *obj, *nexti;

		for (obj = tp.t_pack; obj != NULL; obj = nexti)
		{
			nexti = next(obj);
			obj.o_pos = tp.t_pos;
			detach(tp.t_pack, obj);
			if (waskill)
				fall(obj, FALSE);
			else
				discard(obj);
		}
		moat(mp.y, mp.x) = NULL;
		mvaddch(mp.y, mp.x, tp.t_oldch);
		detach(mlist, tp);
		if (on(tp, ISTARGET))
		{
			kamikaze = FALSE;
			to_death = FALSE;
			if (fight_flush)
				flush_type();
		}
		discard(tp);
	}

	/*
	* killed:
	*	Called to put a monster to death
	*/
	//void
	function killed(tp, pr)//THING *tp, bool pr)
	{
		let mname; //char *mname;

		pstats.s_exp += tp.t_stats.s_exp;

		/*
		* If the monster was a venus flytrap, un-hold him
		*/
		switch (tp.t_type)
		{
			case 'F':
				player.t_flags &= ~ISHELD;
				vf_hit = 0;
				strcpy(monsters['F'-'A'].m_stats.s_dmg, "000x0");
				break; 
			case 'L':
			{
				let gold;	//THING *gold;

				if (fallpos(tp.t_pos, tp.t_room.r_gold) && level >= max_level)
				{
				gold = new_item();
				gold.o_type = GOLD;
				gold.o_goldval = GOLDCALC;
				if (save(VS_MAGIC))
					gold.o_goldval += GOLDCALC + GOLDCALC
							+ GOLDCALC + GOLDCALC;
				attach(tp.t_pack, gold);
				}
			}
		}
		/*
		* Get rid of the monster.
		*/
		mname = set_mname(tp);
		remove_mon(tp.t_pos, tp, TRUE);
		if (pr)
		{
			if (has_hit)
			{
				addmsg(".  Defeated ");
				has_hit = FALSE;
			}
			else
			{
				if (!terse)
				addmsg("you have ");
				addmsg("defeated ");
			}
			msg(mname);
		}
		/*
		* Do adjustments if he went up a level
		*/
		check_level();
		if (fight_flush)
		flush_type();
	}
}