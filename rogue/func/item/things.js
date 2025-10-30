/*
 * Contains functions for dealing with things like potions, scrolls,
 * and other items.
 */
function thingsf(r){

	const d = r.define;
    const t = r.types;

	const terse = false;
	/*
	* vowelstr:
	*      For printfs: if string starts with a vowel, return "n" for an
	*	"an".
	*/
	//char *
	const vowelstr =(str)=>
	{
		switch (str)
		{
			case 'a': case 'A':
			case 'e': case 'E':
			case 'i': case 'I':
			case 'o': case 'O':
			case 'u': case 'U':
				return "n";
			default:
				return "";
		}
	}
	/*
	* inv_name:
	*	Return the name of something as it would appear in an
	*	inventory.
	*/
	this.inv_name = function(obj, drop)//THING *obj, bool drop)
	{
		if (!Boolean(obj)) return "none";

		res = r.item.get_itemparam();

		const p_colors	= res.P_COLOR;
		const r_stones	= res.RING_ST;
		const ws_type	= res.WS_TYPE;
		const ws_made	= res.WS_MADE;
		const ws_info	= res.WANDSTAFF;
		const scr_info	= res.SCROLL;
		const weap_info = res.WEAPON;
		const arm_info	= res.ARM;
		const a_class	= res.AC;
		const pot_info	= res.POD;
		const ring_info = res.RING;
		const s_names 	= res.SC_NAME;

		const fruit = "slime-mold";

		/*
		* num:
		*	Figure out the plus number for armor/weapons
		*/
		//char *
		//const num =(int n1, int n2, char type)
		const num =(n1, n2, type)=>
		{
			let numbuf;

			numbuf = (n1 < 0) ? `${n1}` : `+${n1}`;
			if (type == d.WEAPON)
				numbuf += (n2 < 0) ? `,${n2}` : `,+${n2}`;

			return numbuf;
		}

		let pb;
		let op;	//struct obj_info *op;
		let sp;
		let which;

		pb = "";

		which = obj.o_which;
		switch (obj.o_type)
		{
			case d.POTION:
				pb = nameit(obj, "potion", p_colors[which], pot_info[which], ()=>{return "";});
				break; 
			case d.RING:
				pb = nameit(obj, "ring", r_stones[which], ring_info[which], r.item.rings.ring_num);
				break; 
			case d.STICK:
				pb = nameit(obj, ws_type[which], ws_made[which], ws_info[which], r.item.sticks.charge_str);//charge_str ,file :sticks
				break; 
			case d.SCROLL:
				if (obj.o_count == 1)
				{
					pb = "A scroll ";
				}
				else
				{
					pb = `${obj.o_count} scrolls `;
				}
				op = scr_info[which];
				if (op.oi_know)
					pb = pb + `of ${op.oi_name}`;
				else if (op.oi_guess)
					pb = pb + `called ${op.oi_guess}`;
				else
					pb = pb + `titled '${s_names[which]}'`;
				break; 
			case d.FOOD:
				if (which == 1)
					if (obj.o_count == 1)
						pb = `A${vowelstr(fruit)} ${fruit}`;
					else
						pb = `${obj.o_count} ${fruit}`;
					else
					if (obj.o_count == 1)
						pb = pb + "Some food";
					else
						pb = pb + `${obj.o_count} rations of food`;
				break; 
			case d.WEAPON:
					sp = weap_info[which].oi_name;
					if (obj.o_count > 1)
						pb = obj.o_count + " ";
					else
						pb = `A${vowelstr(sp)} `;

					if (obj.o_flags & d.ISKNOW)
						pb = pb + `${num(obj.o_hplus,obj.o_dplus,d.WEAPON)} ${sp}`;
					else
						pb = pb + `${pb} ${sp}`;
					if (obj.o_count > 1)
						pb = pb + "s";
					if (obj.o_label != null)
					{
						pb = pb + ` called ${obj.o_label}`;
					}
				break; 
			case d.ARMOR:
				sp = arm_info[which].oi_name;
				if (obj.o_flags & d.ISKNOW)
				{
					pb = `${num(a_class[which] - obj.o_arm, 0, d.ARMOR)} ${sp}`;
					if (!terse)
						;//pb = pb + " protection ";
					//pb = pb + `${10 - obj.o_arm}]`;
				}
				else
					pb = pb + sp;
				if (obj.o_label != null)
				{
					pb = pb + " called " + obj.o_label;
				}
				break; 
			case d.AMULET:
				pb = "The Amulet of Yendor";
				break; 
			case d.GOLD:
				pb = `${obj.o_goldval} Gold pieces`;
	//#ifdef MASTER
				break; 
			default:
				r.UI.debug(`Picked up something funny ${obj.o_type}`);
				pb = "none";//`Something bizarre ${obj.o_type}`;
	//#endif
		}
		let inv_describe = false;
		if (inv_describe)
		{
			if (obj == cur_armor)
				pb = pb +  " (being worn)";
			if (obj == cur_weapon)
				pb = pb + " (weapon in hand)";
			if (obj == cur_ring[d.LEFT])
				pb = pb + " (on left hand)";
			else if (obj == cur_ring[d.RIGHT])
				pb = pb + " (on right hand)";
		}
		//if (drop && isupper(prbuf[0]))
		//	prbuf[0] = tolower(prbuf[0]);
		//else if (!drop && islower(prbuf))
		//	prbuf = toupper(prbuf);
		//prbuf[MAXSTR-1] = '\0';
		return pb;//prbuf;
	}

	/*
	* drop:
	*	Put something down
	*/
	//void
	this.drop = function(obj)
	{
		const ISMULT = (type)=> {return (type == d.POTION || type == d.SCROLL || type == d.FOOD)};
		const hero = r.player.player.t_pos;

		let ch;
		//let obj;	//THING *obj;

		ch = r.dungeon.chat(hero.y, hero.x);
		if (ch != d.FLOOR && ch != d.PASSAGE)
		{
			r.after = false;
			r.UI.msg("there is something there already");
			return;
		}
		if (obj == null)
			return;
		if (!this.dropcheck(obj))
			return;
		obj = r.player.packf.leave_pack(obj, true, !ISMULT(obj.o_type));
		/*
		* Link it into the level object list
		*/
		r.dungeon.lvl_obj = r.attach(r.dungeon.lvl_obj, obj);
		r.dungeon.places[hero.y][hero.x].p_ch = obj.o_type;
		r.dungeon.places[hero.y][hero.x].p_flags |= d.F_DROPPED;
		obj.o_pos = {x:hero.x, y:hero.y};

		if (obj.o_type == d.AMULET)
			r.player.amulet = false;
		r.UI.msg(`dropped ${this.inv_name(obj, true)}`);
	}

	/*
	* dropcheck:
	*	Do special checks for dropping or unweilding|unwearing|unringing
	*/
	//bool
	this.dropcheck = function(obj)//THING *obj)
	{
		let cur_weapon = r.player.get_cur_weapon();
		let cur_armor = r.player.get_cur_armor();
		let cur_ring = [];
		cur_ring[d.LEFT] = r.player.get_cur_ring(d.LEFT);
		cur_ring[d.RIGHT] = r.player.get_cur_ring(d.RIGHT);

		if (obj == null)
			return true;
		if (obj != cur_armor && obj != cur_weapon
		&& obj != cur_ring[d.LEFT] && obj != cur_ring[d.RIGHT])
			return true;
		if (obj.o_flags & d.ISCURSED)
		{
			r.UI.msg("you can't.  It appears to be cursed");
			return false;
		}
		if (obj == cur_weapon){
			cur_weapon = null;
			r.player.set_cur_weapon(null);
		}
		else if (obj == cur_armor)
		{
			r.item.armor.waste_time(); //armor
			cur_armor = null;
			r.player.set_cur_armor(null);
		}
		else
		{
			cur_ring[obj == cur_ring[d.LEFT] ? d.LEFT : d.RIGHT] = null;
			r.player.set_cur_ring(d.LEFT) = cur_ring[d.LEFT];
			r.player.set_cur_ring(d.RIGHT) = cur_ring[d.RIGHT];

			switch (Number(obj.o_which))
			{
				case d.R_ADDSTR:
					player.misc.chg_str(-obj.o_arm);
					break;
				case d.R_SEEINVIS:
					r.player.unsee();
					r.daemon.extinguish(r.player.unsee);
					break;
			}
		}
		return true;
	}

	/*
	* new_thing:
	*	Return a new thing
	*/
	//-> ItemManager.js
	/*
	* pick_one:
	*	Pick an item out of a list of nitems possible objects
	*/
	//-> ItemManager.js
	/*
	* discovered:
	*	list what the player has discovered in this game of a certain type
	*/
	let line_cnt = 0;
	let newpage = false;//FALSE;
	let lastfmt, lastarg;

	//void
	function discovered()
	{
		let ch;
		let disc_list;

		do {
			disc_list = FALSE;
			if (!terse)
				addmsg("for ");
			addmsg("what type");
			if (!terse)
				addmsg(" of object do you want a list");
			msg("? (* for all)");
			ch = readchar();
			switch (ch)
			{
			case ESCAPE:
				msg("");
				return;
			case POTION:
			case SCROLL:
			case RING:
			case STICK:
			case '*':
				disc_list = TRUE;
				break;
			default:
				if (terse)
					msg("Not a type");
				else
					msg("Please type one of %c%c%c%c (ESCAPE to quit)", POTION, SCROLL, RING, STICK);
			}
		} while (!disc_list);
		if (ch == '*')
		{
			print_disc(POTION);
			add_line("", NULL);
			print_disc(SCROLL);
			add_line("", NULL);
			print_disc(RING);
			add_line("", NULL);
			print_disc(STICK);
			end_line();
		}
		else
		{
			print_disc(ch);
			end_line();
		}
	}

	/*
	* print_disc:
	*	Print what we've discovered of type 'type'
	*/
	const MAX4 =(a,b,c,d)=>{return (a > b ? (a > c ? (a > d ? a : d) : (c > d ? c : d)) : (b > c ? (b > d ? b : d) : (c > d ? c : d)))}

	//void
	function print_disc(type)
	{
		let info = NULL;//struct obj_info *info = NULL;
		let i, maxnum = 0, num_found;
		let obj;	//static THING obj;
		let order = [];//static int order[MAX4(MAXSCROLLS, MAXPOTIONS, MAXRINGS, MAXSTICKS)];

		switch (type)
		{
		case SCROLL:
			maxnum = MAXSCROLLS;
			info = scr_info;
			break;
		case POTION:
			maxnum = MAXPOTIONS;
			info = pot_info;
			break;
		case RING:
			maxnum = MAXRINGS;
			info = ring_info;
			break;
		case STICK:
			maxnum = MAXSTICKS;
			info = ws_info;
			break;
		}
		set_order(order, maxnum);
		obj.o_count = 1;
		obj.o_flags = 0;
		num_found = 0;
		for (i = 0; i < maxnum; i++)
		if (info[order[i]].oi_know || info[order[i]].oi_guess)
		{
			obj.o_type = type;
			obj.o_which = order[i];
			add_line("%s", this.inv_name(obj, FALSE));
			num_found++;
		}
		if (num_found == 0)
		add_line(nothing(type), NULL);
	}

	/*
	* set_order:
	*	Set up order for list
	*/
	//void
	function set_order(order, numthings)
	{
		let i, r, t;

		for (i = 0; i< numthings; i++)
			order[i] = i;

		for (i = numthings; i > 0; i--)
		{
			r = rnd(i);
			t = order[i - 1];
			order[i - 1] = order[r];
			order[r] = t;
		}
	}

	/*
	* add_line:
	*	Add a line to the list of discoveries
	*/
	/* VARARGS1 */
	//char
	function add_line(fmt, arg)
	{
		let tw, sw;	//WINDOW *tw, *sw;
		let x, y;
		const prompt = "--Press space to continue--";
		let maxlen = -1;

		if (line_cnt == 0)
		{
			wclear(hw);
			if (inv_type == d.INV_SLOW)
			mpos = 0;
		}
		if (inv_type == d.INV_SLOW)
		{
			if (fmt != '\0')
				if (msg(fmt, arg) == d.ESCAPE)
				return d.ESCAPE;
			line_cnt++;
		}
		else
		{
			if (maxlen < 0)
				maxlen = strlen(prompt);
			if (line_cnt >= LINES - 1 || fmt == NULL)
			{
				if (inv_type == INV_OVER && fmt == NULL && !newpage)
				{
				msg("");
				refresh();
				tw = newwin(line_cnt + 1, maxlen + 2, 0, COLS - maxlen - 3);
				sw = subwin(tw, line_cnt + 1, maxlen + 1, 0, COLS - maxlen - 2);
						for (y = 0; y <= line_cnt; y++) 
						{ 
							wmove(sw, y, 0); 
							for (x = 0; x <= maxlen; x++) 
								waddch(sw, mvwinch(hw, y, x)); 
						} 
				wmove(tw, line_cnt, 1);
				waddstr(tw, prompt);
				/*
				* if there are lines below, use 'em
				*/
				if (LINES > NUMLINES)
				{
					if (NUMLINES + line_cnt > LINES)
					mvwin(tw, LINES - (line_cnt + 1), COLS - maxlen - 3);
					else
					mvwin(tw, NUMLINES, 0);
				}
				touchwin(tw);
				wrefresh(tw);
				wait_for(' ');
						if (md_hasclreol())
				{
					werase(tw);
					leaveok(tw, TRUE);
					wrefresh(tw);
				}
				delwin(tw);
				touchwin(stdscr);
				}
				else
				{
				wmove(hw, LINES - 1, 0);
				waddstr(hw, prompt);
				wrefresh(hw);
				wait_for(' ');
				clearok(curscr, TRUE);
				wclear(hw);
				touchwin(stdscr);
				}
				newpage = TRUE;
				line_cnt = 0;
				maxlen = strlen(prompt);
			}
			if (fmt != NULL && !(line_cnt == 0 && fmt == '\0'))
			{
				mvwprintw(hw, line_cnt++, 0, fmt, arg);
				getyx(hw, y, x);
				if (maxlen < x)
				maxlen = x;
				lastfmt = fmt;
				lastarg = arg;
			}
		}
		return ~ESCAPE;
	}

	/*
	* end_line:
	*	End the list of lines
	*/
	//void
	function end_line()
	{
		if (inv_type != INV_SLOW)
		{
			if (line_cnt == 1 && !newpage)
			{
				mpos = 0;
				msg(lastfmt, lastarg);
			}
			else
				add_line(NULL, NULL);
		}
		line_cnt = 0;
		newpage = FALSE;
	}

	/*
	* nothing:
	*	Set up prbuf so that message for "nothing found" is there
	*/
	//char *
	function nothing(type)
	{
		let sp, tystr = NULL;

		if (terse)
			sprintf(prbuf, "Nothing");
		else
			sprintf(prbuf, "Haven't discovered anything");
		if (type != '*')
		{
			sp = prbuf[strlen(prbuf)];
			switch (type)
			{
				case POTION: tystr = "potion";
				break; case SCROLL: tystr = "scroll";
				break; case RING: tystr = "ring";
				break; case STICK: tystr = "stick";
			}
			sprintf(sp, " about any %ss", tystr);
		}
		return prbuf;
	}

	/*
	* nameit:
	*	Give the proper name to a potion, stick, or ring
	*/
	//void
	function nameit(obj, type, which, op, prfunc)//THING *obj, char *type, char *which, struct obj_info *op,
		//char *(*prfunc)(THING *))
	{
		let pb;

		if (op.oi_know || op.oi_guess)
		{
			if (obj.o_count == 1)
				pb = `A ${type}`;
			else
				pb = `${obj.o_count} ${type}`;
			if (op.oi_know)
				pb = pb + `of ${op.oi_name}${prfunc(obj)}(${which})`;
			else if (op.oi_guess)
				pb = pb + `called ${op.oi_guess}${prfunc(obj)}(${which})`;
		}
		else if (obj.o_count == 1)
				pb = `A${vowelstr(which)} ${which} ${type}`;
			else
				pb = `${obj.o_count} ${which} ${type}`;

		return pb;
	}

	/*
	* nullstr:
	*	Return a pointer to a null-length string
	*/
	//char *
	function nullstr(ignored)//THING *ignored)
	{
		NOOP(ignored);
		return "";
	}

	//# ifdef	MASTER
	/*
	* pr_list:
	*	List possible potions, scrolls, etc. for wizard.
	*/
	//void
	function pr_list()
	{
		let ch;

		if (!terse)
			addmsg("for ");
		addmsg("what type");
		if (!terse)
			addmsg(" of object do you want a list");
		msg("? ");
		ch = readchar();
		switch (ch)
		{
		case POTION:
			pr_spec(pot_info, MAXPOTIONS);
		break; case SCROLL:
			pr_spec(scr_info, MAXSCROLLS);
		break; case RING:
			pr_spec(ring_info, MAXRINGS);
		break; case STICK:
			pr_spec(ws_info, MAXSTICKS);
		break; case ARMOR:
			pr_spec(arm_info, MAXARMORS);
		break; case WEAPON:
			pr_spec(weap_info, MAXWEAPONS);
		break; default:
			return;
		}
	}

	/*
	* pr_spec:
	*	Print specific list of possible items to choose from
	*/
	//void
	function pr_spec(info, nitems)//struct obj_info *info, int nitems)
	{
		let endp;	//struct obj_info *endp;
		let i, lastprob;

		endp = info[nitems];
		lastprob = 0;
		for (i = '0'; info < endp; i++)
		{
			if (i == '9' + 1)
				i = 'a';
			sprintf(prbuf, "%c: %%s (%d%%%%)", i, info.oi_prob - lastprob);
			lastprob = info.oi_prob;
			add_line(prbuf, info.oi_name);
			info++;
		}
		end_line();
	}
	//# endif	/* MASTER */
}