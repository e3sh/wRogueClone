/*
 * All sorts of miscellaneous routines
*/
function miscf(r){
	    
    const d = r.define;
    const t = r.types;

	/*
	* check_level:
	*	Check to see if the guy has gone up a level.
	*/
    const e_levels = [
        10,	
		20,
        40,
        80,
        160,
        320,
        640,
        1300,
        2600,
        5200,
        13000,
        26000,
        50000,
        100000,
        200000,
        400000,
        800000,
        2000000,
        4000000,
        8000000,
        0
    ];

	this.check_level = function()
	{
		let pstats = r.player.get_pstat();//r.player.player.t_stats;
		
		let i, add, olevel;

		for (i = 0; e_levels[i] != 0; i++)
			if (e_levels[i] > pstats.s_exp)
				break;
		i++;
		olevel = pstats.s_lvl;
		//console.log(`${pstats.s_exp} ${olevel} ${i}`);
		pstats.s_lvl = i;
		if (i > olevel)
		{
			add = r.roll(i - olevel, 10);

			r.player.set_maxhp( r.player.get_maxhp() + add );
			//max_hp += add;
			//console.log(add);
			pstats.s_hpt += add;
			r.UI.msg(`levelup /welcome to level ${i} maxhp ${add} up`);
		}
		r.player.set_pstat(pstats);		
	}

	/*
	* chg_str:
	*	used to modify the playes strength.  It keeps track of the
	*	highest it has been, just in case
	*/

	//void
	function chg_str(amt)
	{
		let comp;//auto str_t comp;

		if (amt == 0)
			return;
		add_str(pstats.s_str, amt);
		comp = pstats.s_str;
		if (ISRING(LEFT, R_ADDSTR))
			add_str(comp, -cur_ring[LEFT].o_arm);
		if (ISRING(RIGHT, R_ADDSTR))
			add_str(comp, -cur_ring[RIGHT].o_arm);
		if (comp > max_stats.s_str)
			max_stats.s_str = comp;
	}

	/*
	* add_str:
	*	Perform the actual add, checking upper and lower bound limits
	*/
	//void
	function add_str(sp, amt)
	{
		if ((sp += amt) < 3)
			sp = 3;
		else if (sp > 31)
			sp = 31;
	}

	/*
	* add_haste:
	*	Add a haste to the player
	*/
	//bool
	function add_haste(potion)
	{
		if (on(player, ISHASTE))
		{
			no_command += rnd(8);
			player.t_flags &= ~(ISRUN|ISHASTE);
			extinguish(nohaste);
			msg("you faint from exhaustion");
			return FALSE;
		}
		else
		{
		player.t_flags |= ISHASTE;
		if (potion)
			fuse(nohaste, 0, rnd(4)+4, AFTER);
		return TRUE;
		}
	}

	/*
	* aggravate:
	*	Aggravate all the monsters on this level
	*/

	//void
	function aggravate()
	{
		let mp;//THING mp;

		for (mp = mlist; mp != NULL; mp = next(mp))
			runto(mp.t_pos);
	}

	/*
	* vowelstr:
	*      For printfs: if string starts with a vowel, return "n" for an
	*	"an".
	*/
	//char *
	//things.js
	function vowelstr(str)
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
	* is_current:
	*	See if the object is one of the currently used items
	*/
	//bool
	function is_current(obj)//THING *obj)
	{
		if (obj == NULL)
		return FALSE;
		if (obj == cur_armor || obj == cur_weapon || obj == cur_ring[LEFT]
		|| obj == cur_ring[RIGHT])
		{
			if (!terse)
				addmsg("That's already ");
			msg("in use");
			return TRUE;
		}
		return FALSE;
	}

	/*
	* get_dir:
	*      Set up the direction co_ordinate for use in varios "prefix"
	*	commands
	*/
	//bool
	function get_dir()
	{
		let prompt;
		let gotit;
		let last_delt= {x:0,y:0};//static coord last_delt= {0,0};

		if (again && last_dir != '\0')
		{
			delta.y = last_delt.y;
			delta.x = last_delt.x;
			dir_ch = last_dir;
		}
		else
		{
			if (!terse)
				msg(prompt = "which direction? ");
			else
				prompt = "direction: ";
			do
			{
				gotit = TRUE;
				switch (dir_ch = readchar())
				{
				case 'h': case'H': delta.y =  0; delta.x = -1;
				break; case 'j': case'J': delta.y =  1; delta.x =  0;
				break; case 'k': case'K': delta.y = -1; delta.x =  0;
				break; case 'l': case'L': delta.y =  0; delta.x =  1;
				break; case 'y': case'Y': delta.y = -1; delta.x = -1;
				break; case 'u': case'U': delta.y = -1; delta.x =  1;
				break; case 'b': case'B': delta.y =  1; delta.x = -1;
				break; case 'n': case'N': delta.y =  1; delta.x =  1;
				break; case ESCAPE: last_dir = '\0'; reset_last(); return FALSE;
				otherwise:
					mpos = 0;
					msg(prompt);
					gotit = FALSE;
				}
			} while (!gotit);
			if (isupper(dir_ch))
				dir_ch = tolower(dir_ch);
			last_dir = dir_ch;
			last_delt.y = delta.y;
			last_delt.x = delta.x;
		}
		if (on(player, ISHUH) && rnd(5) == 0)
		do
		{
			delta.y = rnd(3) - 1;
			delta.x = rnd(3) - 1;
		} while (delta.y == 0 && delta.x == 0);
		mpos = 0;
		return TRUE;
	}

	/*
	* sign:
	*	Return the sign of the number
	*/
	//*int
	function sign(nm)
	{
		if (nm < 0)
		return -1;
		else
		return (nm > 0);
	}

	/*
	* spread:
	*	Give a spread around a given number (+/- 20%)
	*/
	//int
	//function spread(nm)
	//{
	//    return nm - nm / 20 + rnd(nm / 10);
	//}

	/*
	* call_it:
	*	Call an object something after use.
	*/

	//void
	function call_it(info)//struct obj_info *info)
	{
		if (info.oi_know)
		{
		if (info.oi_guess)
		{
			free(info.oi_guess);
			info.oi_guess = NULL;
		}
		}
		else if (!info.oi_guess)
		{
		msg(terse ? "call it: " : "what do you want to call it? ");
		if (get_str(prbuf, stdscr) == NORM)
		{
			if (info.oi_guess != NULL)
			free(info.oi_guess);
			info.oi_guess = malloc(strlen(prbuf) + 1);
			strcpy(info.oi_guess, prbuf);
		}
		}
	}

	/*
	* rnd_thing:
	*	Pick a random thing appropriate for this level
	*/
	//function rnd_thing()
	// -> GameManager

	/*
	str str:
	*	Choose the first or second string depending on whether it the
	*	player is tripping
	*/
	//char *
	function choose_str(ts, ns)//har *ts, char *ns)
	{
		return (on(player, ISHALU) ? ts : ns);
	}
}