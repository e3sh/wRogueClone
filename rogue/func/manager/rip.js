/*
 * File for the fun ends
 * Death or a total win
 */

function rips(r){

	const d = r.define;
    const t = r.types;

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

	const isupper =(ch = "a")=> { return ch === ch.toUpperCase() && ch !== ch.toLowerCase(); }
	
	const rip = [
		"                       __________",
		"                      /          \\",
		"                     /    REST    \\",
		"                    /      IN      \\",
		"                   /     PEACE      \\",
		"                  /                  \\",
		"                  |                  |",
		"                  |                  |",
		"                  |   killed by a    |",
		"                  |                  |",
		"                  |       1980       |",
		"                 *|     *  *  *      | *",
		"         ________)/\\\\_//(\\/(/\\)/\\//\\/|_)_______",
	];

	const tombstone = true;
	const whoami = "Player";
	const monsters = r.globalValiable.monsters;

	const startleft = 8;

	/*
	* score:
	*	Figure score and post it.
	*/
	/* VARARGS2 */
	function score(amount, flags, monst)//int amount, int flags, char monst)
	{
		return;
		
		let scp;	//SCORE *scp;
		let i;
		let sc2;	//SCORE *sc2;
		let top_ten = [], endp;	//SCORE *top_ten, *endp;
		let prflags = 0;
		//void (*fp)(int);
		let uid;
		const reason = [
			"killed",
			"quit",
			"A total winner",
			"killed with Amulet"
		];

		//start_score();

		if (flags >= 0 || wizard)
		{
			r.UI.mvaddch(d.LINES - 1, 0 , "[Press return to continue]");
			//refresh();
			//wgetnstr(stdscr,prbuf,80);
			//endwin();
			//printf("\n");
			//resetltchars();
			/*
			* free up space to "guarantee" there is space for the top_ten
			*/
			//delwin(stdscr);
			//delwin(curscr);
			//if (hw != null)
			//	delwin(hw);
		}

		top_ten = [];//new SCORE();//(SCORE *) malloc(numscores * sizeof (SCORE));
		for (let i = 0; i<d.NUMSCORES; i++)
		{	
			top_ten.push(new t.SCORE());
		}
		endp = top_ten[numscores-1];
		//for (scp = top_ten; scp < endp; scp++)
		for (let i in topten)
		{
			scp = topten[i];
			scp.sc_score = 0;
			for (i = 0; i < d.MAXSTR; i++)
				scp.sc_name[i] = r.rnd(255);
			scp.sc_flags = 0;//RN;
			scp.sc_level = 0;//RN;
			scp.sc_monster = 0;//RN;
			scp.sc_uid = 0;//RN;

		}

		if (r.wizard)
		if (prbuf == "names")
			prflags = 1;
		else if (prbuf == "edit")
			prflags = 2;
		rd_score(top_ten);
		/*
		* Insert her in list if need be
		*/
		sc2 = null;
		if (!noscore)
		{
			uid = 0;//md_getuid();
			for (scp = top_ten; scp < endp; scp++)
				if (amount > scp.sc_score)
					break;
				else if (!allscore &&	/* only one score per nowin uid */
					flags != 2 && scp.sc_uid == uid && scp.sc_flags != 2)
			scp = endp;
			if (scp < endp)
			{
				if (flags != 2 && !allscore)
				{
					for (sc2 = scp; sc2 < endp; sc2++)
					{
						if (sc2.sc_uid == uid && sc2.sc_flags != 2)
						break;
					}
					if (sc2 >= endp)
						sc2 = endp - 1;
				}
				else
					sc2 = endp - 1;
				while (sc2 > scp)
				{
					sc2 = sc2[-1]; //???
					sc2--;
				}
				scp.sc_score = amount;
				scp.sc_name = whoami;
				scp.sc_flags = flags;
				if (flags == 2)
					scp.sc_level = max_level;
				else
					scp.sc_level = level;
					scp.sc_monster = monst;
					scp.sc_uid = uid;
					sc2 = scp;
			}
		}
		/*
		* Print the list
		*/
		if (flags != -1)
			putchar('\n');
		printf(`Top ${Numname} ${allscore ? "Scores" : "Rogueists"}:\n`);
		printf("   Score Name\n");
		for (scp = top_ten; scp < endp; scp++)
		{
		if (scp.sc_score) {
			if (sc2 == scp)
				md_raw_standout();
			printf(`${scp - top_ten + 1} ${scp.sc_score} ${scp.sc_name}: ${reason[scp.sc_flags]} on level ${scp.sc_level}`);
			if (scp.sc_flags == 0 || scp.sc_flags == 3)
				printf(` by ${killname(scp.sc_monster, true)}`);
			printf(".");
			if (sc2 == scp)
				md_raw_standend();
			putchar('\n');
		}
		else
			break;
		}
		/*
		* Update the list file
		*/
		if (sc2 != null)
		{
			if (lock_sc())
			{
				wr_score(top_ten);
				unlock_sc();
			}
		}
	}

	/*
	* death:
	*	Do something really fun .break; case he dies
	*/
	this.death = function(monst)
	{
		let dp, killer;	//char **dp, *killer;
		let lt;//struct tm *lt;
		let date; //time_t
		//struct tm *localtime();
		const SL = startleft;


		let purse = r.player.get_purse();
		purse -= purse / 10;

		r.UI.clear();
		killer = killname(monst, false);

		const currentDate = new Date();//time(date);
		lt = currentDate.getFullYear();//localtime(date);
		r.UI.move(8, SL);
		dp = rip;
		for (let i in rip){
			r.UI.move(Number(i)+8, SL);
			r.UI.printw(rip[i]);
		}
		r.UI.mvaddstr(17, center(killer), killer);
		if (monst == 's' || monst == 'h')
			r.UI.mvaddch(16, 32+SL, ' ');
		else
			r.UI.mvaddstr(16, 33+SL, vowelstr(killer));
		r.UI.mvaddstr(14, center(whoami), whoami);
		prbuf = `${purse} Au`;
		r.UI.move(15, center(prbuf));
		r.UI.addstr(prbuf);
		r.UI.mvaddstr(18, 26+SL, `${lt}`);

		r.UI.move(d.LINES - 1, 0);
		score(purse, r.player.amulet ? 3 : 0, monst);
		r.UI.pause("[Press return to continue]");
		r.pause = true;

		r.player.reset_inventry();
	}

	/*
	* center:
	*	Return the index to center the given string
	*/
	function center(str)
	{
		return (28 + startleft) - Math.floor(((str.length) + 1) / 2);
	}

	/*
	* total_winner:
	*	Code for a winner
	*/
	function total_winner()
	{
		let obj;	//THING *obj;
		let op;		//struct obj_info *op;
		let worth = 0;
		let oldpurse;

		clear();
		//standout();
		addstr("                                                               \n");
		addstr("  @   @               @   @           @          @@@  @     @  \n");
		addstr("  @   @               @@ @@           @           @   @     @  \n");
		addstr("  @   @  @@@  @   @   @ @ @  @@@   @@@@  @@@      @  @@@    @  \n");
		addstr("   @@@@ @   @ @   @   @   @     @ @   @ @   @     @   @     @  \n");
		addstr("      @ @   @ @   @   @   @  @@@@ @   @ @@@@@     @   @     @  \n");
		addstr("  @   @ @   @ @  @@   @   @ @   @ @   @ @         @   @  @     \n");
		addstr("   @@@   @@@   @@ @   @   @  @@@@  @@@@  @@@     @@@   @@   @  \n");
		addstr("                                                               \n");
		addstr("     Congratulations, you have made it to the light of day!    \n");
		//standend();
		addstr("\nYou have joined the elite ranks of those who have escaped the\n");
		addstr("Dungeons of Doom alive.  You journey home and sell all your loot at\n");
		addstr("a great profit and are admitted to the Fighters' Guild.\n");
		
		mvaddstr(LINES - 1, 0, "--Press space to continue--");
		refresh();
		wait_for(' ');
		clear();
		mvaddstr(0, 0, "   Worth  Item\n");
		oldpurse = purse;
		for (obj = pack; obj != null; obj = next(obj))
		{
			switch (obj.o_type)
			{
				case FOOD:
					worth = 2 * obj.o_count;
					break; 
				case WEAPON:
					worth = weap_info[obj.o_which].oi_worth;
					worth *= 3 * (obj.o_hplus + obj.o_dplus) + obj.o_count;
					obj.o_flags |= ISKNOW;
					break; 
				case ARMOR:
					worth = arm_info[obj.o_which].oi_worth;
					worth += (9 - obj.o_arm) * 100;
					worth += (10 * (a_class[obj.o_which] - obj.o_arm));
					obj.o_flags |= ISKNOW;
					break; 
				case SCROLL:
					worth = scr_info[obj.o_which].oi_worth;
					worth *= obj.o_count;
					op = scr_info[obj.o_which];
					if (!op.oi_know)
						worth /= 2;
					op.oi_know = true;
					break; 
				case POTION:
					worth = pot_info[obj.o_which].oi_worth;
					worth *= obj.o_count;
					op = pot_info[obj.o_which];
					if (!op.oi_know)
						worth /= 2;
					op.oi_know = true;
					break; 
				case RING:
					op = ring_info[obj.o_which];
					worth = op.oi_worth;
					if (obj.o_which == R_ADDSTR || obj.o_which == R_ADDDAM ||
						obj.o_which == R_PROTECT || obj.o_which == R_ADDHIT)
					{
						if (obj.o_arm > 0)
							worth += obj.o_arm * 100;
						else
							worth = 10;
					}
					if (!(obj.o_flags & ISKNOW))
						worth /= 2;
					obj.o_flags |= ISKNOW;
					op.oi_know = true;
					break; 
				case STICK:
					op = ws_info[obj.o_which];
					worth = op.oi_worth;
					worth += 20 * obj.o_charges;
					if (!(obj.o_flags & ISKNOW))
						worth /= 2;
					obj.o_flags |= ISKNOW;
					op.oi_know = true;
					break; 
				case AMULET:
					worth = 1000;
			}
			if (worth < 0)
				worth = 0;
			printw(`${obj.o_packch}) ${worth}  ${inv_name(obj, false)}`);
			purse += worth;
		}
		printw("   %5d  Gold Pieces          ", oldpurse);
		refresh();
		score(purse, 2, ' ');
		my_exit(0);
	}

	/*
	* killname:
	*	Convert a code to a monster name
	*/
	//char *
	function killname(monst, doart)
	{
		let hp;	//struct h_list *hp;
		let sp;
		let article;
		//static struct h_list nlist[] = {
		let prbuf;
		
		nlist = [
			{ch:'a',	desc:"arrow", print:true},
			{ch:'b',	desc:"bolt",	print:		true},
			{ch:'d',	desc:"dart",	print:		true},
			{ch:'h',	desc:"hypothermia",	print:	false},
			{ch:'s',	desc:"starvation",	print:	false},
			//{ch:'\0'}
		];

		if (isupper(monst))
		{
			sp = monsters[
				Number(monst.charCodeAt(0))-Number('A'.charCodeAt(0))
				].m_name;
			article = true;
		}
		else
		{
			sp = "Wally the Wonder Badger";
			article = false;
			for (let i in nlist)
			//for (hp = nlist; hp.h_ch; hp++)
				if (nlist[i].ch == monst)
				{
					sp = nlist[i].desc;
					article = nlist[i].print;
					break;
				}
		}
		if (doart && article)
			prbuf = `a${vowelstr(sp)}`;
		else
			prbuf = "";
		prbuf += sp;
		return prbuf;
	}

	/*
	* death_monst:
	*	Return a monster appropriate for a random death.
	*/
	//char
	function death_monst()
	{
		const poss =
		[
			'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
			'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
			'Y', 'Z', 'a', 'b', 'h', 'd', 's',
			' '	/* This is provided to generate the "Wally the Wonder Badger"
				message for killer */
		];

		return poss[r.rnd(poss.length)];
	}
}