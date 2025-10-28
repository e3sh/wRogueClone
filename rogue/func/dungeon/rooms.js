/*
 * Create the layout for the new level
 */
function rooms_f(r, dg){
    
    const d = r.define;
    const t = r.types;

	const proom = r.player.player.t_room;
	
	const rooms = dg.rooms;
	//const level = dg.level;
	const places = dg.places;
	const max_level = dg.max_level;
	//const lvl_obj = dg.lvl_obj;


	const isupper =(ch)=> { return ch === ch.toUpperCase() && ch !== ch.toLowerCase(); }
	const on = (thing,flag)=>{ return ((thing.t_flags & flag) != 0)};

	const GOLDCALC =()=> { return Math.floor(Math.random() * (50 + 10 * dg.level)) + 2};
	const step_ok = dg.step_ok;

	let ffresult = {x:0, y:0};
	this.get_findfloor_result =()=> {
		//console.log(ffresult);
		let rx = ffresult.x;
		let ry = ffresult.y;
		
		return { x:rx, y:ry };
	}

	/*
	* do_rooms:
	*	Create rooms and corridors with a connectivity graph
	*/
	this.do_rooms = function()
	{
		const level = dg.get_level();
		let lvl_obj = dg.lvl_obj;	

		let rp; //struct room *rp;
		//let tp; //THING *tp;
		let left_out;
		let top	= {}; //static coord top;
		let bsze = {}; //coord bsze;				/* maximum room size */
		let mp = {}; //coord mp;

		bsze.x = Math.floor(d.NUMCOLS / 3 );
		bsze.y = Math.floor(d.NUMLINES / 3);
		/*
		* Clear things for a new level
		*/
		rp = rooms;
		for (let i in rp){
			rp[i].r_goldval = 0;
			rp[i].r_nexits = 0;
			rp[i].r_flags = 0;
		}
		/*
		* Put the gone rooms, if any, on the level
		*/
		left_out = r.rnd(4);
		for (let i = 0; i < left_out; i++)
			rooms[dg.rnd_room()].r_flags |= d.ISGONE;
		/*
		* dig and populate all the rooms on the level
		*/
		rp = rooms;
		for (let i in rp){
		/*
		* Find upper left corner of box that this room goes in
		*/
			top.x = (i % 3) * bsze.x + 1;
			top.y = Math.floor(i / 3) * bsze.y;
			if (rp[i].r_flags & d.ISGONE)
			{
				/*
				* Place a gone room.  Make certain that there is a blank line
				* for passage drawing.
				*/
				do
				{
					rp[i].r_pos.x = top.x + r.rnd(bsze.x - 2) + 1;
					rp[i].r_pos.y = top.y + r.rnd(bsze.y - 2) + 1;
					rp[i].r_max.x = - d.NUMCOLS;
					rp[i].r_max.y = - d.NUMLINES;
				} while(!(rp[i].r_pos.y > 0 && rp[i].r_pos.y < d.NUMLINES-1));
				continue;
			}
			/*
			* set room type
			*/
			if (r.rnd(10) < level - 1)
			{
				rp[i].r_flags |= d.ISDARK;		/* dark room */
				if (r.rnd(15) == 0)
				rp[i].r_flags = d.ISMAZE;		/* maze room */
			}
			/*
			* Find a place and size for a random room
			*/
			if (rp[i].r_flags & d.ISMAZE)
			{
				rp[i].r_max.x = bsze.x - 1;
				rp[i].r_max.y = bsze.y - 1;
				if ((rp[i].r_pos.x = top.x) == 1)
					rp[i].r_pos.x = 0;
				if ((rp[i].r_pos.y = top.y) == 0)
				{
					rp[i].r_pos.y++;
					rp[i].r_max.y--;
				}
			}
			else
				do
				{
					rp[i].r_max.x = r.rnd(bsze.x - 4) + 4;
					rp[i].r_max.y = r.rnd(bsze.y - 4) + 4;
					rp[i].r_pos.x = top.x + r.rnd(bsze.x - rp[i].r_max.x);
					rp[i].r_pos.y = top.y + r.rnd(bsze.y - rp[i].r_max.y);
				} while (!(rp[i].r_pos.y != 0));
			this.draw_room(rp[i]);
			/*
			* Put the gold in
			*/
			if (r.rnd(2) == 0 && (!r.player.amulet || level >= max_level))
			{
				//let gold;
				const gold = r.new_item();
				gold.o_goldval = rp[i].r_goldval = GOLDCALC();
				this.find_floor(rp[i], rp[i].r_gold, false, false);
				rp[i].r_gold = this.get_findfloor_result();//rp[i].r_gold;
				gold.o_pos = this.get_findfloor_result();

				//chat(rp[i].r_gold.y, rp[i].r_gold.x) = d.GOLD;
				//places[rp[i].r_gold.y][rp[i].r_gold.x].p_ch = d.GOLD; 
				places[gold.o_pos.y][gold.o_pos.x].p_ch = d.GOLD; 
				gold.o_flags = d.ISMANY;
				gold.o_group = d.GOLDGRP;
				gold.o_type = d.GOLD;
				lvl_obj = r.attach(lvl_obj, gold);
			}
			/*
			* Put the monster in
			*/
			if (r.rnd(100) < (rp[i].r_goldval > 0 ? 80 : 25))
			{
				const tp = r.new_item();
				this.find_floor(rp[i], mp, false, true);
				r.monster.new_monster(tp, r.monster.randmonster(false), this.get_findfloor_result());//mp);
				r.monster.give_pack(tp);
			}
			dg.lvl_obj = lvl_obj;	
		}
	}

	/*
	* draw_room:
	*	Draw a box around a room and lay down the floor for normal
	*	rooms; for maze rooms, draw maze.
	*/
	this.draw_room = function(rp)
	{
		let y, x;

		if (rp.r_flags & d.ISMAZE)
			this.do_maze(rp);
		else
		{
		this.vert(rp, rp.r_pos.x);				/* Draw left side */
		this.vert(rp, rp.r_pos.x + rp.r_max.x - 1);	/* Draw right side */
		this.horiz(rp, rp.r_pos.y);				/* Draw top */
		this.horiz(rp, rp.r_pos.y + rp.r_max.y - 1);	/* Draw bottom */

		/*
		* Put the floor down
		*/
		for (y = rp.r_pos.y + 1; y < rp.r_pos.y + rp.r_max.y - 1; y++)
			for (x = rp.r_pos.x + 1; x < rp.r_pos.x + rp.r_max.x - 1; x++)
			//chat(y, x) = d.FLOOR;
			places[y][x].p_ch = d.FLOOR;
		}
	}

	/*
	* vert:
	*	Draw a vertical line
	*/
	this.vert = function(rp, startx) //(struct room *rp, int startx)
	{
		let y;

		for (y = rp.r_pos.y + 1; y <= rp.r_max.y + rp.r_pos.y - 1; y++)
		//chat(y, startx) = '|';
		places[y][startx].p_ch = '|';
	}

	/*
	* horiz:
	*	Draw a horizontal line
	*/
	this.horiz = function(rp, starty)//(struct room *rp, int starty)
	{
		let x;

		for (x = rp.r_pos.x; x <= rp.r_pos.x + rp.r_max.x - 1; x++)
		//chat(starty, x) = '-';
		places[starty][x].p_ch = '-';
	}

	/*
	* do_maze:
	*	Dig a maze
	*/
	let Maxy, Maxx, Starty, Startx;
	//static SPOT	maze[Math.floor(d.NUMLINES/3)+1][Math.floor(d.NUMCOLS/3)+1];
	let maze = [];
	for (let i = 0; i < Math.floor(d.NUMLINES/3)+1; i++){
		maze[i] = [];
		for (let j = 0; j < Math.floor(d.NUMCOLS/3)+1; j++){
			maze[i][j] = new t.SPOT();
		}
	}

	this.do_maze = function(rp) //(struct room *rp)
	{
		//console.log("do_maze_start");

		let sp; //SPOT *sp;
		let starty, startx;
		let pos = {}; //static coord pos;

		//for (sp = &maze[0][0]; sp <= &maze[NUMLINES / 3][NUMCOLS / 3]; sp++)
		for (let i in maze){
			for (let j in maze[i]){
				maze[i][j].used = false;
				maze[i][j].nexits = 0;
			}
		}

		Maxy = rp.r_max.y;
		Maxx = rp.r_max.x;
		Starty = rp.r_pos.y;
		Startx = rp.r_pos.x;
		starty = Math.floor(r.rnd(rp.r_max.y) / 2) * 2;
		startx = Math.floor(r.rnd(rp.r_max.x) / 2) * 2;
		pos.y = starty + Starty;
		pos.x = startx + Startx;
		r.dungeon.passf.putpass(pos); //passage
		this.dig(starty, startx);

		//console.log("do_maze_comp");
	}

	/*
	* dig:
	*	Dig out from around where we are now, if possible
	*/
	this.dig = function(y, x)
	{
		let cp; //coord *cp;
		let cnt, newy, newx, nexty = 0, nextx = 0;
		let pos = {}; //static coord pos;
		let  del =[
			{x:2, y:0}, {x:-2, y:0}, {x:0, y:2}, {x:0, y:-2}
		];
		//static coord

		for (;;)
		{
			cnt = 0;
			for (let i in del)
			{
				cp = del[i];
				newy = y + cp.y;
				newx = x + cp.x;
				if (newy < 0 || newy > Maxy || newx < 0 || newx > Maxx)
					continue;
				if (dg.flat(newy + Starty, newx + Startx) & d.F_PASS)
					continue;
				if (r.rnd(++cnt) == 0)
				{
					nexty = newy;
					nextx = newx;
				}
			}
			if (cnt == 0)
				return;
			this.accnt_maze(y, x, nexty, nextx);
			this.accnt_maze(nexty, nextx, y, x);
			if (nexty == y)
			{
				pos.y = y + Starty;
				if (nextx - x < 0)
					pos.x = nextx + Startx + 1;
				else
					pos.x = nextx + Startx - 1;
			}
			else
			{
				pos.x = x + Startx;
				if (nexty - y < 0)
					pos.y = nexty + Starty + 1;
				else
					pos.y = nexty + Starty - 1;
			}
			r.dungeon.passf.putpass(pos);
			pos.y = nexty + Starty;
			pos.x = nextx + Startx;
			r.dungeon.passf.putpass(pos);
			this.dig(nexty, nextx);
		}
	}

	/*
	* accnt_maze:
	*	Account for maze exits
	*/
	this.accnt_maze = function(y, x, ny, nx)
	{
		let sp; //SPOT *sp;
		let cp; //coord *cp;

		sp = maze[y][x];
		//for (cp = sp.exits; cp < &sp->exits[sp->nexits]; cp++){
		for (let i in sp.exits){
			cp = sp.exits[i];
			if (cp.y == ny && cp.x == nx)
				return;
		}
		cp.y = ny;
		cp.x = nx;
	}

	/*
	* rnd_pos:
	*	Pick a random spot in a room
	*/
	this.rnd_pos = function(rp, cp) //(struct room *rp, coord *cp)
	{
		//console.log(`${rp} ${cp}`);
	
		cp.x = rp.r_pos.x + r.rnd(rp.r_max.x - 2) + 1;
		cp.y = rp.r_pos.y + r.rnd(rp.r_max.y - 2) + 1;
		return cp;
	}

    /*
    * find_floor:
    *	Find a valid floor spot in this room.  If rp is NULL, then
    *	pick a new room each time around the loop.
    */
    //(struct room *rp, coord *cp, int limit, bool monst)
    this.find_floor = function(rp, cp, limit, monst)
    {
        let pp; //PLACE *pp;
        let cnt;
        let compchar = 0;
        let pickroom;

        pickroom = (rp == null);//!Boolean(rp);

        if (!pickroom)
        	compchar = ((rp.r_flags & d.ISMAZE) ? d.PASSAGE : d.FLOOR);
        cnt = limit;
        for (;;)
        {
            if (limit && cnt-- == 0)
                return false;
            if (pickroom)
            {
                rp = rooms[dg.rnd_room()];
                compchar = ((rp.r_flags & d.ISMAZE) ? d.PASSAGE : d.FLOOR);
            }
            cp = this.rnd_pos(rp, cp);
			ffresult = cp;
            pp = r.dungeon.INDEX(cp.y, cp.x);
            if (monst)
            {
                if (pp.p_monst == null && step_ok(pp.p_ch)) //step_ok msg.
                return true;
            }
            else if (pp.p_ch == compchar)
                return true;
        }
    }

	/*
	* enter_room:
	*	Code that is executed whenver you appear in a room
	*/
	this.enter_room = function(cp)//(coord *cp)
	{
		let player = r.player.player;
		
		let rp; //struct room *rp;
		let tp; //THING *tp;
		let y, x;
		let ch;

		player.t_room = r.dungeon.roomin(cp);
		rp = player.t_room;//proom;//r.dungeon.roomin(cp);
		r.player.door_open(rp);
		if (!(rp.r_flags & d.ISDARK) && !on(player, d.ISBLIND))
		for (y = rp.r_pos.y; y < rp.r_max.y + rp.r_pos.y; y++)
		{
			r.UI.move(y, rp.r_pos.x);
			for (x = rp.r_pos.x; x < rp.r_max.x + rp.r_pos.x; x++)
			{
				tp = dg.moat(y, x);
				ch = dg.chat(y, x);
				if (tp == null)
					if (r.UI.inch() != ch){
						r.UI.move(y, x);
						r.UI.addch(ch);
					}
					else
						r.UI.move(y, x + 1);
				else
				{
					tp.t_oldch = ch;
					r.UI.move(y, x);
					if 	(!r.player.see_monst(tp))
						if (on(player, d.SEEMONST))
						{
							//standout();
							r.UI.addch(tp.t_disguise);
							//standend();
						}
						else
							r.UI.addch(ch);
					else
						r.UI.addch(tp.t_disguise);
				}
			}
		}
		r.UI.comment("enter_room");
	}

	/*
	* leave_room:
	*	Code for when we exit a room
	*/
	this.leave_room = function(cp)//coord *cp)
	{
		let player = r.player.player;

		let pp; //PLACE *pp;
		let rp; //struct room *rp;
		let y, x;
		let floor;
		let ch;

		rp = player.t_room;//proom;

		if (rp.r_flags & d.ISMAZE)
			return;

		if (rp.r_flags & d.ISGONE)
			floor = d.PASSAGE;
		else if (!(rp.r_flags & d.ISDARK) || on(player, d.ISBLIND))
			floor = d.FLOOR;
		else
			floor = ' ';

		player.t_room = dg.passages[dg.flat(cp.y, cp.x) & d.F_PNUM];
		for (y = rp.r_pos.y; y < rp.r_max.y + rp.r_pos.y; y++)
			for (x = rp.r_pos.x; x < rp.r_max.x + rp.r_pos.x; x++)
			{
				r.UI.move(y, x);
				switch ( ch = r.UI.inch() )
				{
				case d.FLOOR:
					if (floor == ' ' && ch != ' ')
						r.UI.addch(' ');
					break;
				default:
					/*
					* to check for monster, we have to strip out
					* standout bit
					*/
					if (isupper(ch));//toascii(ch)))
					{
						if (on(player, d.SEEMONST))
						{
							//standout();
							r.UI.addch(ch);
							//standend();
							break;
						}
						pp = dg.INDEX(y,x);
						r.UI.addch(pp.p_ch == d.DOOR ? d.DOOR : floor);
					}
				}
			}
		r.player.door_open(rp);

		r.UI.comment("leave_room");
	}
}
