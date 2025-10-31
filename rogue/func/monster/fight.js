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

	let fight_flush = false;
	let max_hit = 0;

	let to_death = false;

	const weap_info = r.globalValiable.weap_info;

	const terse = false; //
	const on = (thing,flag)=>{return ((thing.t_flags & flag) != 0)};
	const isupper =(ch)=> { return ch === ch.toUpperCase() && ch !== ch.toLowerCase(); }
	const GOLDCALC =()=> { return Math.floor(Math.random() * (50 + 10 * level)) + 2};

	const rainbow = r.globalValiable.rainbow;
	const pick_color =(col)=>
	{
		return (on(r.player.player, d.ISHALU) ? rainbow[r.rnd(d.NCOLORS)] : col);
	}

	const death =(en)=>{alert(`death ${en}`)};

	//const ISRING = (h,r)=>  {cur_ring[h] != null && cur_ring[h].o_which == r} //指定した手に特定のリングを着用しているか

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
			if (on(player, d.ISHALU)) {
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
		r.UI.has_hit = (terse && !r.to_death);
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
				r.UI.endmsg("");
				r.UI.has_hit = false;
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
		const player = r.player.player;
		const pstats = r.player.player.t_stats;

		let mname;	//register char *mname;
		let oldhp;	//register int oldhp;
		/*
		* Since this is an attack, stop running and any healing that was
		* going on at the time.
		*/
		running = false;
		count = 0;
		quiet = 0;
		if (to_death && !on(mp, d.ISTARGET))
		{
			to_death = false;
			r.player.kamikaze = false;
		}
		if (mp.t_type == 'X' && mp.t_disguise != 'X' && !on(player, d.ISBLIND))
		{
			mp.t_disguise = 'X';
			if (on(player, d.ISHALU))
				r.UI.mvaddch(mp.t_pos.y, mp.t_pos.x, String.fromCharCode(r.rnd(26) + 'A'.charCodeAt(0)));
		}
		mname = this.set_mname(mp);
		oldhp = pstats.s_hpt;
		if (roll_em(mp, player, null, false))//(THING *) NULL
		{
		if (mp.t_type != 'I')
		{
			if (r.UI.has_hit)
			r.UI.addmsg(".  ");
			hit(mname, null, false); //(char *) NULL
		}
		else
			if (r.UI.has_hit)
			r.UI.endmsg("");
		r.UI.has_hit = false;
		if (pstats.s_hpt <= 0)
			r.death(mp.t_type);	/* Bye bye life ... */
		else if (!r.player.kamikaze)
		{
			oldhp -= pstats.s_hpt;
			if (oldhp > max_hit)
				max_hit = oldhp;
			if (pstats.s_hpt <= max_hit)
				to_death = false;
		}
		if (!on(mp, d.ISCANC))
			switch (mp.t_type)
			{
			case 'A':
				/*
				* If an aquator hits, you can lose armor class.
				*/
				r.player.rust_armor(cur_armor);
				break; 
			case 'I':
				/*
				* The ice monster freezes you
				*/
				player.t_flags &= ~d.ISRUN;
				if (!r.player.set_no_command())
				{
					r.UI.addmsg("you are frozen");
					//if (!terse)
						r.UI.addmsg(` by the ${mname}`);
					r.UI.endmsg("");
				}
				r.player.set_no_command(r.player.get_no_command()+ r.rnd(2) + 2);
				if (r.player.set_no_command() > d.BORE_LEVEL)
				r.death('h');
				break; 
			case 'R':
				/*
				* Rattlesnakes have poisonous bites
				*/
				if (!r.player.save(d.VS_POISON))
				{
				if (!ISWEARING(d.R_SUSTSTR))
				{
					player.misc.chg_str(-1);
					//if (!terse)
					r.UI.msg("you feel a bite in your leg and now feel weaker");
					//else
					//r.UI.msg("a bite has weakened you");
				}
				else if (!to_death)
				{
					//if (!terse)
					r.UI.msg("a bite momentarily weakens you");
					//else
					//r.UI.msg("bite has no effect");
				}
				}
				break; 
			case 'W':
			case 'V':
				/*
				* Wraiths might drain energy levels, and Vampires
				* can steal max_hp
				*/
				if (r.rnd(100) < (mp.t_type == 'W' ? 15 : 30))
				{
					let fewer;	//register int fewer;

					if (mp.t_type == 'W')
					{
						if (pstats.s_exp == 0)
							r.death('W');		/* All levels gone */
						if (--pstats.s_lvl == 0)
						{
							pstats.s_exp = 0;
							pstats.s_lvl = 1;
						}
						else
							pstats.s_exp = e_levels[pstats.s_lvl-1]+1;
						fewer = r.roll(1, 10);
					}
					else
						fewer = r.roll(1, 3);
					pstats.s_hpt -= fewer;
					pstats.s_maxhp -= fewer;
					if (pstats.s_hpt <= 0)
						pstats.s_hpt = 1;
					if (pstats.s_maxhp <= 0)
						r.death(mp.t_type);
					r.UI.msg("you suddenly feel weaker");
				}
				break; 
			case 'F':
				/*
				* Venus Flytrap stops the poor guy from moving
				*/
				player.t_flags |= d.ISHELD;
				r.UI.msg(`${monsters['F'.charCodeAt(0)-'A'.charCodeAt(0)].m_stats.s_dmg} ${++vf_hit}x1`);
				if (--pstats.s_hpt <= 0)
				r.death('F');
				break; 
			case 'L':
			{
				/*
				* Leperachaun steals some gold
				*/
				let purse = r.player.get_purse();
				let lastpurse;//register int lastpurse;

				lastpurse = purse;
				purse -= GOLDCALC;
				if (!r.player.save(d.VS_MAGIC))
					purse -= GOLDCALC + GOLDCALC + GOLDCALC + GOLDCALC;
				if (purse < 0)
					purse = 0;
				remove_mon(mp.t_pos, mp, false);
				mp=null;
				if (purse != lastpurse)
					r.UI.msg("your purse feels lighter");
				r.player.set_purse(purse);
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
				steal = null;
				for (nobj = 0, obj = pack; obj != null; obj = obj.l_next)
				if (obj != r.player.get_cur_armor() && obj != r.player.get_cur_weapon()
					&& obj != r.player.get_cur_ring(d.LEFT) && obj != r.player.get_cur_ring(d.RIGHT)
					&& is_magic(obj) && r.rnd(++nobj) == 0)
					steal = obj;
				if (steal != null)
				{
					remove_mon(mp.t_pos, moat(mp.t_pos.y, mp.t_pos.x), false);
								mp=null;
					r.player.packf.leave_pack(steal, false, false);
					r.UI.msg(`she stole ${r.item.inv_name(steal, true)}`);
					r.discard(steal);
				}
			}
			break;
			default:
				break;
			}
		}
		else if (mp.t_type != 'I')
		{
			if (r.UI.has_hit)
			{
				r.UI.addmsg(".  ");
				r.UI.has_hit = false;
			}
			if (mp.t_type == 'F')
			{
				pstats.s_hpt -= vf_hit;
				if (pstats.s_hpt <= 0)
				r.death(mp.t_type);	/* Bye bye life ... */
			}
			miss(mname, null, false); //(char *) NULL
		}
		if (fight_flush && !r.player.to_death)
		//flush_type();
	
		count = 0;
		r.player.set_pstats(pstats);
		r.UI.status();
		if (mp == null)
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
		//console.log(`${cp}`);
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

		let debugstr = "";
		let rolldmg = cp.split("/");
		for (let i in rolldmg){
			let dice = rolldmg[i].split("x");
			ndice = Number(dice[0]);
			nsides = Number(dice[1]);
			if (swing(att.s_lvl, def_arm, hplus + str_plus[att.s_str]))
			{
				let proll; //int proll;
				proll = r.roll(ndice, nsides);
				debugstr = `roll:"${ndice}x${nsides}":${proll}`;
			//	#ifdef MASTER
				if (ndice + nsides > 0 && proll <= 0)
					console.log(
					`Damage for ${ndice}x${nsides} came out ${proll}, dplus = ${dplus}, add_dam = ${add_dam[att.s_str]}, def_arm = ${def_arm}`);
			//	#endif
				damage = dplus + proll + add_dam[att.s_str];
				debugstr += ` ${damage}=ac${dplus}+d${proll}+aj${add_dam[att.s_str]}`;
				def.s_hpt -= Math.max(0, damage);
				//if (Math.max(0, damage) > 0)
					r.UI.addmsg(`hit:${Math.max(0, damage)}) `);//resthp:${def.s_hpt}`);
					r.UI.comment(`${debugstr}`);
				//console.log(`hp:${def.s_hpt} hit:${Math.max(0, damage)} ${debugstr}`);
				did_hit = true;
			}else{
				//console.log(`swing false:${att.s_lvl} ${def_arm} ${hplus + str_plus[att.s_str]}`);
			}
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
			r.UI.addmsg(`the ${weap_info[weap.o_which].oi_name} hits ` );
		else
			r.UI.addmsg("you hit ");
		r.UI.addmsg(`${mname}`);
		if (!noend)
			r.UI.endmsg("");
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

		if (to_death)
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
			r.UI.addmsg(`${prname(ee, false)}`);
		if (!noend)
			r.UI.endmsg("");
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
			r.UI.endmsg("");
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
			r.UI.endmsg("");
	}

	/*
	* remove_mon:
	*	Remove a monster from the screen
	*/
	//void
	function remove_mon(mp,tp, waskill)//coord *mp, THING *tp, bool waskill)
	{
		let obj, nexti;	//register THING *obj, *nexti;

		for (obj = tp.t_pack; obj != null; obj = nexti)
		{
			nexti = obj.l_next;//next(obj.l_next);
			obj.o_pos = tp.t_pos;
			tp.t_pack = r.detach(tp.t_pack, obj);
			if (waskill)
				fall(obj, false);
			else
				r.discard(obj);
		}
		//moat(mp.y, mp.x) = NULL;
		r.dungeon.places[mp.y][mp.x].p_monst = null;
		r.UI.mvaddch(mp.y, mp.x, tp.t_oldch);
		r.dungeon.mlist = r.detach(r.dungeon.mlist, tp);
		if (on(tp, d.ISTARGET))
		{
			r.player.kamikaze = false;
			to_death = false;
			if (fight_flush)
				flush_type();
		}
		r.discard(tp);
	}

	/*
	* killed:
	*	Called to put a monster to death
	*/
	//void
	this.killed = killed;
	function killed(tp, pr)//THING *tp, bool pr)
	{
		const player = r.player.player;
		const level = r.dungeon.level;
		const max_level = r.dungeon.max_level;

		let mname; //char *mname;

		//pstats.s_exp += tp.t_stats.s_exp;
		player.t_stats.s_exp += tp.t_stats.s_exp;
		/*
		* If the monster was a venus flytrap, un-hold him
		*/
		switch (tp.t_type)
		{
			case 'F':
				player.t_flags &= ~d.ISHELD;
				vf_hit = 0;
				monsters['F'.charCodeAt(0)-'A'.charCodeAt(0)].m_stats.s_dmg = "000x0";
				break; 
			case 'L':
			{
				let gold;	//THING *gold;

				if (fallpos(tp.t_pos, tp.t_room.r_gold) && level >= max_level)
				{
					gold = r.new_item();
					gold.o_type = d.GOLD;
					gold.o_goldval = GOLDCALC();
					if (r.player.save(d.VS_MAGIC))
						gold.o_goldval += GOLDCALC() + GOLDCALC()
								+ GOLDCALC() + GOLDCALC();
					tp.t_pack = r.attach(tp.t_pack, gold);
				}
			}
		}
		/*
		* Get rid of the monster.
		*/
		mname = r.monster.battle.set_mname(tp);
		remove_mon(tp.t_pos, tp, true);
		if (pr)
		{
			if (r.UI.has_hit)
			{
				r.UI.addmsg(".  Defeated ");
				r.UI.has_hit = false;
			}
			else
			{
				if (!terse)
					r.UI.addmsg("you have ");
				r.UI.addmsg("defeated ");
			}
			r.UI.msg(mname);
		}
		/*
		* Do adjustments if he went up a level
		*/
		r.player.misc.check_level();
		if (fight_flush)
		;//flush_type();
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

}