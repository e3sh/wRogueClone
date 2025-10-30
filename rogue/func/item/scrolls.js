/*
 * Read a scroll and let it happen
 */
function scroll(r){

	const d = r.define;
    const t = r.types;

	const rainbow = r.globalValiable.rainbow;
	const scr_info = r.globalValiable.scr_info;

	const on = (thing,flag)=>{return ((thing.t_flags & flag) != 0)};
	/*
	* pick_color:
	*	If he is halucinating, pick a random color name and return it,
	*	otherwise return the given color.
	*/
	const pick_color =(col)=>
	{
		//const rainbow = r.globalValiable.rainbow;
		return (on(r.player.player, d.ISHALU) ? rainbow[r.rnd(d.NCOLORS)] : col);
	}

    function choose_str(ts, ns)
    {
        return (on(player, d.ISHALU) ? ts : ns);
    }

	/*
	* read_scroll:
	*	Read a scroll from the pack and do the appropriate thing
	*/
	//void
	this.read_scroll = function(obj)
	{
		//const scr_info = r.globalValiable.scr_info;

		const player = r.player.player;
		const hero = player.t_pos;

		//let obj;	//THING *obj;
		let pp;	//PLACE *pp;
		let y, x;
		let ch;
		let i;
		let discardit = false;
		let cur_room;	//struct room *cur_room;
		let orig_obj;	//THING *orig_obj;
		let mp = {};	//static coord mp;

		//obj = get_item("read", SCROLL);
		if (obj == null)
			return;
		if (obj.o_type != d.SCROLL)
		{
			//if (!terse)
				r.UI.msg("there is nothing on it to read");
			//else
			//	r.UI.msg("nothing to read");
			return;
		}
		/*
		* Calculate the effect it has on the poor guy.
		*/
		if (obj == r.player.get_cur_weapon())
			r.player.set_cur_weapon(null);
		/*
		* Get rid of the thing
		*/
		discardit = (obj.o_count == 1);
		r.player.packf.leave_pack(obj, false, false);
		orig_obj = obj;

		switch (Number(obj.o_which))
		{
		case d.S_CONFUSE:
			/*
			* Scroll of monster confusion.  Give him that power.
			*/
			player.t_flags |= d.CANHUH;
			r.UI.msg(`your hands begin to glow ${pick_color("red")}`);
			break; 
		case d.S_ARMOR:
			if (r.player.get_cur_armor() != null)
			{
				let cur_armor = r.player.get_cur_armor();
				cur_armor.o_arm--;
				cur_armor.o_flags &= ~d.ISCURSED;
				r.UI.msg(`your armor glows ${pick_color("silver")} for a moment`);
				r.player.set_cur_armor(cur_armor);
			}
			break; 
		case d.S_HOLD:
			/*
			* Hold monster scroll.  Stop all monsters within two spaces
			* from chasing after the hero.
			*/
			ch = 0;
			for (x = hero.x - 2; x <= hero.x + 2; x++)
			if (x >= 0 && x < d.NUMCOLS)
				for (y = hero.y - 2; y <= hero.y + 2; y++)
				if (y >= 0 && y <= d.NUMLINES - 1)
					if ((obj = r.dungeon.moat(y, x)) != null && on(obj, d.ISRUN))
					{
						obj.t_flags &= ~d.ISRUN;
						obj.t_flags |= d.ISHELD;
						ch++;
					}
			if (ch)
			{
				r.UI.addmsg("the monster");
				if (ch > 1)
					r.UI.addmsg("s around you");
				r.UI.addmsg(" freeze");
				if (ch == 1)
					r.UI.addmsg("s");
				r.UI.endmsg("");
				scr_info[d.S_HOLD].oi_know = true;
			}
			else
				r.UI.msg("you feel a strange sense of loss");
			break; 
		case d.S_SLEEP:
			/*
			* Scroll which makes you fall asleep
			*/
			scr_info[S_SLEEP].oi_know = true;
			no_command += r.rnd(d.SLEEPTIME) + 4;
			player.t_flags &= ~d.ISRUN;
			r.UI.msg("you fall asleep");
			break; 
		case d.S_CREATE:
			/*
			* Create a monster:
			* First look in a circle around him, next try his room
			* otherwise give up
			*/
			i = 0;
			for (y = hero.y - 1; y <= hero.y + 1; y++)
			for (x = hero.x - 1; x <= hero.x + 1; x++)
				/*
				* Don't put a monster in top of the player.
				*/
				if (y == hero.y && x == hero.x)
					continue;
				/*
				* Or anything else nasty
				*/
				else if (r.dungeon.step_ok(ch = r.dungeon.winat(y, x)))
				{
					let fo = r.dungeon.find_obj(y, x);
					if (fo != null){
						if (ch == d.SCROLL
							&& fo.o_which == d.S_SCARE)
							continue;
						else if (r.rnd(++i) == 0)
						{
							mp.y = y;
							mp.x = x;
						}
					}
				}
			if (i == 0)
				r.UI.msg("you hear a faint cry of anguish in the distance");
			else
			{
				obj = r.item.new_item();
				r.monster.new_monster(obj, r.monster.randmonster(false), mp);
			}
			break; 
		case d.S_ID_POTION:
		case d.S_ID_SCROLL:
		case d.S_ID_WEAPON:
		case d.S_ID_ARMOR:
		case d.S_ID_R_OR_S:
		{
			const id_type =[//[S_ID_R_OR_S + 1] =
			0, 0, 0, 0, 0, d.POTION, d.SCROLL, d.WEAPON, d.ARMOR, d.R_OR_S 
			];
			/*
			* Identify, let him figure something out
			*/
			scr_info[obj.o_which].oi_know = true;
			r.UI.msg(`this scroll is an ${scr_info[obj.o_which].oi_name} scroll`);
			whatis(true, id_type[obj.o_which]); //whatis identify commands
		}
		break; 
		case d.S_MAP:

			const def = ()=>{
				if (pp.p_flags & d.F_PASS)
					pass();//goto pass;
				ch = ' ';
			}
			const pass = ()=>{
				if (!(pp.p_flags & d.F_REAL))
					pp.p_ch = d.PASSAGE;
				pp.p_flags |= (d.F_SEEN|d.F_REAL);
				ch = d.PASSAGE;
			}

			/*
			* Scroll of magic mapping.
			*/
			scr_info[d.S_MAP].oi_know = true;
			r.UI.msg("oh, now this scroll has a map on it");
			/*
			* take all the things we want to keep hidden out of the window
			*/
			for (y = 1; y < NUMLINES - 1; y++)
			for (x = 0; x < NUMCOLS; x++)
			{
				pp = r.dungeon.INDEX(y, x);
				switch (ch = pp.p_ch)
				{
				case d.DOOR:
				case d.STAIRS:
					break;

				case '-':
				case '|':
					if (!(pp.p_flags & d.F_REAL))
					{
						ch = pp.p_ch = d.DOOR;
						pp.p_flags |= d.F_REAL;
					}
					break;

				case ' ':
					if (pp.p_flags & d.F_REAL)
						def();//goto def;
					pp.p_flags |= d.F_REAL;
					ch = pp.p_ch = d.PASSAGE;
					/* FALLTHROUGH */

				case PASSAGE:
	pass:			pass();
					//if (!(pp.p_flags & d.F_REAL))
					//pp.p_ch = d.PASSAGE;
					//pp.p_flags |= (d.F_SEEN|d.F_REAL);
					//ch = d.PASSAGE;
					break;

				case FLOOR:
					if (pp.p_flags & d.F_REAL)
					ch = ' ';
					else
					{
						ch = d.TRAP;
						pp.p_ch = d.TRAP;
						pp.p_flags |= (d.F_SEEN|d.F_REAL);
					}
					break;

				default:
	def:			def();
					
				//if (pp.p_flags & d.F_PASS)
				//		;//goto pass;
				//	ch = ' ';
				}
				if (ch != ' ')
				{
					if ((obj = pp.p_monst) != null)
						obj.t_oldch = ch;
					if (obj == null || !on(player, d.SEEMONST))
						r.UI.mvaddch(y, x, ch);
				}
			}
		case d.S_FDET:
			/*
			* Potion of gold detection
			*/
			ch = false;
			//r.UI.clear();
			for (let ob = r.dungeon.lvl_obj; ob != null; ob = ob.l_next)
			if (ob.o_type == d.FOOD)
			{
				ch = true;
				r.UI.move(ob.o_pos.y, ob.o_pos.x);
				r.UI.addch(d.FOOD);
			}
			if (ch)
			{
				scr_info[d.S_FDET].oi_know = true;
				r.UI.msg("Your nose tingles and you smell food.");
			}
			else
				r.UI.msg("your nose tingles");
			break; 
		case d.S_TELEP:
			/*
			* Scroll of teleportation:
			* Make him dissapear and reappear
			*/
			{
				cur_room = player.t_room;
				teleport();
				if (cur_room != proom)
					scr_info[d.S_TELEP].oi_know = true;
			}
			break; 
		case d.S_ENCH:
			let cur_weapon = r.player.get_cur_weapon();
			const weap_info = r.globalValiable.weap_info

			if (cur_weapon == null || cur_weapon.o_type != d.WEAPON)
				r.UI.msg("you feel a strange sense of loss");
			else
			{
				cur_weapon.o_flags &= ~d.ISCURSED;
				if (r.rnd(2) == 0)
					cur_weapon.o_hplus++;
				else
					cur_weapon.o_dplus++;
				r.UI.msg(`your ${weap_info[cur_weapon.o_which].oi_name} glows ${pick_color("blue")} for a moment`);
				r.player.set_cur_weapon(cur_weapon);
			}
			break; 
		case d.S_SCARE:
			/*
			* Reading it is a mistake and produces laughter at her
			* poor boo boo.
			*/
			r.UI.msg("you hear maniacal laughter in the distance");
			break; 
		case d.S_REMOVE:
			let car = r.player.get_cur_armor();
			let cwe = r.player.get_cur_weapon();
			let crl = r.player.get_cur_ring(d.LEFT);
			let crr = r.player.get_cur_ring(d.RIGHT);

			uncurse(car);
			uncurse(cwe);
			uncurse(crr);
			uncurse(crl);

			r.UI.msg(choose_str("you feel in touch with the Universal Onenes",
				"you feel as if somebody is watching over you"));
			break; 
		case d.S_AGGR:
			/*
			* This scroll aggravates all the monsters on the current
			* level and sets them running towards the hero
			*/
			r.monster.aggravate();
			r.UI.msg("you hear a high pitched humming noise");
			break; 
		case d.S_PROTECT:
			if (r.player.get_cur_armor() != null)
			{
				let arm = r.player.get_cur_armor();
				arm.o_flags |= d.ISPROT;
				r.player.set_cur_armor(arm);
				r.UI.msg(`your armor is covered by a shimmering ${pick_color("gold")} shield`);
			}
			else
				r.UI.msg("you feel a strange sense of loss");
			break; 
		default:
			r.UI.msg("what a puzzling scroll!");
			return;
		}
		obj = orig_obj;
		r.UI.look(true);	/* put the result of the scroll on the screen */
		r.UI.status();

		r.player.misc.call_it(scr_info[obj.o_which]);

		if (discardit)
			r.discard(obj);
	}

	/*
	* uncurse:
	*	Uncurse an item
	*/
	//void
	function uncurse(obj)//THING *obj)
	{
		if (obj != null)
		obj.o_flags &= ~d.ISCURSED;
	}

	/*
	* telport:
	*	Bamf the hero someplace else
	*/
	//void
	function teleport()
	{
		const player = r.player.player;
		const hero = player.t_pos;

		let c = {};

		r.UI.mvaddch(hero.y, hero.x, r.player.floor_at());
		r.dungeon.roomf.find_floor(null, NULL, c, false, true);
		if (r.dungeon.roomin(c) != proom)
		{
			r.dungeon.roomf.leave_room(hero);
			hero = c;
			r.player.enter_room(hero);
		}
		else
		{
			hero = c;
			r.UI.look(true);
		}
		r.UI.mvaddch(hero.y, hero.x, d.PLAYER);
		/*
		* turn off ISHELD in case teleportation was done while fighting
		* a Flytrap
		*/
		if (on(player, d.ISHELD)) {
			const monsters =  r.globalValiable.monsters;

			player.t_flags &= ~ISHELD;
			vf_hit = 0;
			monsters['F'.charCodeAt(0)-'A'.charCodeAt(0)].m_stats.s_dmg = "000x0";
		}
		no_move = 0;
		count = 0;
		running = false;
		//flush_type();
	}

	/*
	* whatis:
	*	What a certin object is
	*/
	//void
	function whatis(insist, type)
	{
		const pack = r.player.player.t_pack;
		const v =  r.globalValiable;

		let obj;//THING *obj;
		let n_objs;
		let list;

		if (pack == null)
		{
			r.UI.msg("you don't have anything in your pack to identify");
			return;
		}

		n_objs = 0;

		for (obj = pack; obj != null; obj = obj.l_next)
		{
			if (type && type != obj.o_type && 
				!(type == d.R_OR_S && (obj.o_type == d.RING || obj.o_type == d.STICK)))
					continue;

			switch (obj.o_type)
			{
				case d.SCROLL:
					set_know(obj, scr_info);
					break; 
				case d.POTION:
					set_know(obj, v.pot_info);
					break; 
				case d.STICK:
					set_know(obj, v.ws_info);
					break; 
				case d.WEAPON:
				case d.ARMOR:
					obj.o_flags |= d.ISKNOW;
					break; 
				case d.RING:
					set_know(obj, v.ring_info);
			}
			n_objs++;
			r.UI.msg(r.item.inv_name(obj, false));
		}
		if (insist)
		{
			if (n_objs == 0)
				return;
			else if (obj == null)
				r.UI.msg("you must identify something");
			else if (type && obj.o_type != type &&
			!(type == d.R_OR_S && (obj.o_type == d.RING || obj.o_type == d.STICK)) )
				r.UI.msg(`you must identify a ${type_name(type)}`);
		}
	}
	/*
	* set_know:
	*	Set things up when we really know what a thing is
	*/
	//void
	function set_know(obj, info)//THING *obj, struct obj_info *info)
	{
		//let guess; // char **guess;

		info[obj.o_which].oi_know = true;
		obj.o_flags |= d.ISKNOW;
		//guess = info[obj.o_which].oi_guess;
	}
	/*
	* type_name:
	*	Return a pointer to the name of the type
	*/
	//char *
	function type_name(type)
	{
		const tlist = [
			{h_ch: d.POTION	, h_desc:"potion"	,h_print:false},
			{h_ch: d.SCROLL	, h_desc:"scroll"	,h_print:false},
			{h_ch: d.FOOD	, h_desc:"food"		,h_print:false},
			{h_ch: d.R_OR_S	, h_desc:"ring, wand or staff",h_print:false},
			{h_ch: d.RING	, h_desc:"ring"		,h_print:false},
			{h_ch: d.STICK	, h_desc:"wand or staff",h_print:false},
			{h_ch: d.WEAPON	, h_desc:"weapon"	,h_print:false},
			{h_ch: d.ARMOR	, h_desc:"suit of armor",h_print:false},
		];

		for (let hp of tlist)
		if (type == hp.h_ch)
			return hp.h_desc;
		/* NOTREACHED */
		return 0;
	}

}