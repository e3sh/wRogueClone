/*
 * Routines dealing specifically with rings
 *
*/
function rings(r){

	const d = r.define;
    const t = r.types;

	const is_current =(obj)=>//THING *obj)
	{
		if (obj == null)
			return false;
		if (obj == r.player.get_cur_armor() || obj == r.player.get_cur_weapon() || obj == r.player.get_cur_ring(d.LEFT)
		|| obj == r.player.get_cur_ring(d.RIGHT))
		{
			//if (!terse)
				r.UI.addmsg("That's already ");
			r.UI.msg("in use");
			return true;
		}
		return false;
	}

	/*
	* ring_on:
	*	Put a ring on a hand
	*/
	this.ring_on = function(obj)
	{
		//let obj;	//THING *obj;
		let ring;
		const cur_ring = [];
		cur_ring[d.LEFT]  = r.player.get_cur_ring(d.LEFT);
		cur_ring[d.RIGHT] = r.player.get_cur_ring(d.RIGHT);

		//obj = get_item("put on", d.RING);
		/*
		* Make certain that it is somethings that we want to wear
		*/
		if (obj == null)
			return;
		if (obj.o_type != d.RING)
		{
			if (!terse)
				r.UI.msg("it would be difficult to wrap that around a finger");
			else
				r.UI.msg("not a ring");
			return;
		}
		/*
		* find out which hand to put it on
		*/
		if (is_current(obj))
			return;

		if (cur_ring[d.LEFT] == obj || cur_ring[d.RIGHT] == obj){
			this.ring_off(obj);
		}

		if (cur_ring[d.LEFT] == null && cur_ring[d.RIGHT] == null)
		{
			//if ((ring = gethand()) < 0)
			//	return;
			ring = d.LEFT;
		}
		else if (cur_ring[d.LEFT] == null)
			ring = d.LEFT;
		else if (cur_ring[d.RIGHT] == null)
			ring = d.RIGHT;
		else
		{
			//if (!terse)
				r.UI.addmsg("you already have a ring on each hand.");
			//else
				r.UI.msg("wearing two");
			return;
		}
		cur_ring[ring] = obj;

		/*
		* Calculate the effect it has on the poor guy.
		*/
		switch (Number(obj.o_which))
		{
		case d.R_ADDSTR:
			player.misc.chg_str(obj.o_arm);
			break;
		case d.R_SEEINVIS:
			r.item.potions.invis_on();
			break;
		case d.R_AGGR:
			r.monster.aggravate();
			break;
		}

		//if (!terse)
			r.UI.addmsg("you are now wearing ");
		r.UI.msg(`${r.item.things.inv_name(obj, true)} (${obj.o_packch})`);
	}

	/*
	* ring_off:
	*	take off a ring
	*/
	this.ring_off = function(obj)
	{
		let ring;
		const cur_ring = [];
		cur_ring[d.LEFT]  = r.player.get_cur_ring(d.LEFT);
		cur_ring[d.RIGHT] = r.player.get_cur_ring(d.RIGHT);
		//let obj;	//THING *obj;

		if (cur_ring[d.LEFT] == null && cur_ring[d.RIGHT] == null)
		{
			if (terse)
				r.UI.msg("no rings");
			else
				r.UI.msg("you aren't wearing any rings");
			return;
		}
		else if (cur_ring[d.LEFT] == null)
			ring = d.RIGHT;
		else if (cur_ring[d.RIGHT] == null)
			ring = d.LEFT;
		else 
			if (obj == cur_ring[d.LEFT])
				ring = d.LEFT;
			else
			if (obj == cur_ring[d.RIGHT])
				ring = d.RIGHT;
			else
				return;
		
		//if ((ring = gethand()) < 0)
		//	return;
		//mpos = 0;
		obj = cur_ring[ring];
		if (obj == null)
		{
			r.UI.msg("not wearing such a ring");
			return;
		}
		if (r.item.things.dropcheck(obj))
			r.UI.msg(`${r.item.things.inv_name(obj, true)} (${obj.o_packch})`);
	}

	/*
	* gethand:
	*	Which hand is the hero interested in?
	*/
	this.gethand = function()
	{
		let c;

		for (;;)
		{
		if (terse)
			r.UI.msg("left or right ring? ");
		else
			r.UI.msg("left hand or right hand? ");
		if ((c = readchar()) == ESCAPE)
			return -1;
		mpos = 0;
		if (c == 'l' || c == 'L')
			return d.LEFT;
		else if (c == 'r' || c == 'R')
			return d.RIGHT;
		if (terse)
			r.UI.msg("L or R");
		else
			r.UI.msg("please type L or R");
		}
	}

	/*
	* ring_eat:
	*	How much food does this ring use up?
	*/
	this.ring_eat = function(hand)
	{
		const gs = r.player.get_status();
		const cur_ring = gs.ring;

		let ring;	//THING *ring;
		let eat;
		let uses  = [
			1,	/* R_PROTECT */		 1,	/* R_ADDSTR */
			1,	/* R_SUSTSTR */		-3,	/* R_SEARCH */
			-5,	/* R_SEEINVIS */	 0,	/* R_NOP */
			0,	/* R_AGGR */		-3,	/* R_ADDHIT */
			-3,	/* R_ADDDAM */		 2,	/* R_REGEN */
			-2,	/* R_DIGEST */		 0,	/* R_TELEPORT */
			1,	/* R_STEALTH */		 1	/* R_SUSTARM */
		];
		ring = cur_ring[hand];
		if (ring == null) return 0;
		if (!Boolean(ring.o_which))
			return 0;
		eat = uses[ring.o_which];
		if (eat < 0)
			eat = (r.rnd(-eat) == 0);
		if (ring.o_which == d.R_DIGEST)
			eat = -eat;
		return eat;
	}

	/*
	* ring_num:
	*	Print ring bonuses
	*/
	this.ring_num = function(obj)//THING *obj)
	{
		let buf;

		if (!(obj.o_flags & d.ISKNOW))
			return "";
		switch (Number(obj.o_which))
		{
		case d.R_PROTECT:
		case d.R_ADDSTR:
		case d.R_ADDDAM:
		case d.R_ADDHIT:
			buf = ` [${num(obj.o_arm, 0, d.RING)}]`;
			break;
		default:
			return "";
		}
		return buf;
	}

    /*
    * num:
    *	Figure out the plus number for armor/weapons
    */
    //char *
    function num(n1, n2, type)
    {
        let numbuf;//static char numbuf[10];

        numbuf = (n1 < 0)? `${n1}`:`+${n1}`;
        if (type == d.WEAPON)
            numbuf += (n2 < 0) ? `,${n2}`:`,+${n2}`;
        return numbuf;
    }

}