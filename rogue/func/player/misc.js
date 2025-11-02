/*
 * All sorts of miscellaneous routines
*/
function miscf(r){
	    
    const d = r.define;
    const t = r.types;

	//let player = r.player.player;

	const on = (thing,flag)=>{return ((thing.t_flags & flag) != 0)};
	const ISRING = (h, th)=>  {
		return (r.player.get_cur_ring(h) != null && r.player.get_cur_ring(h).o_which == th);
	} 

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
	this.chg_str = function(amt)
	{
		let pstats = r.player.get_pstat();//r.player.player.t_stats;
		let max_stats = r.player.get_max_stats();

		let cur_ring = [];
		cur_ring[d.LEFT] = r.player.get_cur_ring(d.LEFT);
		cur_ring[d.RIGHT] = r.player.get_cur_ring(d.RIGHT);

		let comp;//auto str_t comp;

		if (amt == 0)
			return;
		//add_str(pstats.s_str, amt);
		pstats.s_str += amt;
		if (pstats.s_str < 3)	
			pstats.s_str = 3;
		else if (pstats.s_str > 31)
			pstats.s_str = 31;

		comp = pstats.s_str;
		if (ISRING(d.LEFT, d.R_ADDSTR))
			add_str(comp, -cur_ring[d.LEFT].o_arm);
		if (ISRING(d.RIGHT, d.R_ADDSTR))
			add_str(comp, -cur_ring[d.RIGHT].o_arm);
		if (comp > max_stats.s_str){
			max_stats.s_str = comp;
			r.player.set_max_stats(max_stats);
		}
		r.player.set_pstat(pstats);		
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
	this.add_haste = function(potion)
	{
		let player = r.player.player;

		if (on(player, d.ISHASTE))
		{
			r.player.set_no_command(r.player.get_no_command() + r.rnd(8));
			player.t_flags &= ~(d.ISRUN|d.ISHASTE);
			r.daemon.extinguish(nohaste);
			r.UI.msg("you faint from exhaustion");
			return false;
		}
		else
		{
			player.t_flags |= d.ISHASTE;
			if (potion)
				r.daemon.fuse(r.player.nohaste, 0, r.rnd(4)+4, d.AFTER);
			return true;
		}

	}

	/*
	* aggravate:
	*	Aggravate all the monsters on this level
	*/
	//->MonsterManager.
	
	/*
	* vowelstr:
	*      For printfs: if string starts with a vowel, return "n" for an
	*	"an".
	*/
	// ->local things and rips function
	
	/* 
	* is_current:
	*	See if the object is one of the currently used items
	*/
	//bool
	// ->local rings and weapons function

	/*
	* get_dir:
	*      Set up the direction co_ordinate for use in varios "prefix"
	*	commands
	*/
	//bool
	// -> UIManager

	/*
	* sign:
	*	Return the sign of the number
	*/
	//*int
	// -> Math.sign use

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
	this.call_it = function(info)//struct obj_info *info)
	{
		if (info.oi_know)
		{
			if (info.oi_guess)
			{
				//free(info.oi_guess);
				info.oi_guess = null;
			}
		}
		else if (!info.oi_guess)
		{
			//r.UI.msg(terse ? "call it: " : "what do you want to call it? ");

			//if (get_str(prbuf, stdscr) == d.NORM)
			//{
				//if (info.oi_guess != null)
				//free(info.oi_guess);
				info.oi_guess = info.oi_name;//prbuf;
				//strcpy(info.oi_guess, prbuf);
			//}
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
	// -> PlayerCharactor, potion, scrolls, fight local function use
}