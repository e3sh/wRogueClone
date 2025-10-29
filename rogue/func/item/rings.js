/*
 * Routines dealing specifically with rings
 *
*/
function rings(r){

	const d = r.define;
    const t = r.types;
	/*
	* ring_on:
	*	Put a ring on a hand
	*/
	this.ring_on = function()
	{
		let obj;	//THING *obj;
		let ring;

		obj = get_item("put on", d.RING);
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

		if (cur_ring[d.LEFT] == null && cur_ring[d.RIGHT] == null)
		{
			if ((ring = gethand()) < 0)
				return;
		}
		else if (cur_ring[d.LEFT] == null)
			ring = d.LEFT;
		else if (cur_ring[d.RIGHT] == null)
			ring = d.RIGHT;
		else
		{
			if (!terse)
				r.UI.msg("you already have a ring on each hand");
			else
				r.UI.msg("wearing two");
			return;
		}
		cur_ring[ring] = obj;

		/*
		* Calculate the effect it has on the poor guy.
		*/
		switch (obj.o_which)
		{
		case d.R_ADDSTR:
			player.misc.chg_str(obj.o_arm);
			break;
		case d.R_SEEINVIS:
			invis_on();
			break;
		case d.R_AGGR:
			aggravate();
			break;
		}

		if (!terse)
			r.UI.addmsg("you are now wearing ");
		r.UI.msg("%s (%c)", r.item.things.inv_name(obj, TRUE), obj.o_packch);
	}

	/*
	* ring_off:
	*	take off a ring
	*/
	this.ring_off = function()
	{
		let ring;
		let obj;	//THING *obj;

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
		if ((ring = gethand()) < 0)
			return;
		mpos = 0;
		obj = cur_ring[ring];
		if (obj == null)
		{
			r.UI.msg("not wearing such a ring");
			return;
		}
		if (dropcheck(obj))
			r.UI.msg("was wearing %s(%c)", r.item.things.inv_name(obj, TRUE), obj.o_packch);
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
		switch (obj.o_which)
		{
		case d.R_PROTECT:
		case d.R_ADDSTR:
		case d.R_ADDDAM:
		case d.R_ADDHIT:
			sprintf(buf, " [%s]", num(obj.o_arm, 0, d.RING));
			break;
		default:
			return "";
		}
		return buf;
	}
}