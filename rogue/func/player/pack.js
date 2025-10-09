/*
 * Routines to deal with the pack
 */
function packf(r){

	let pack_used = Array(27);  /* Is the character used in the pack?  (インベントリ文字の使用状況)*/
	for (let i = 0; i <26; i++) pack_used[i] = false;
	//pack_used.fill(false);
	this.pack_used = pack_used;
	let inpack = 0;				/* Number of things in pack */

	let last_comm;  /* Last command typed */
    let last_dir;   /* Last direction given */
    let last_pick;  /* Last object picked in get_item() */
    let l_last_comm;    /* Last last_comm */
    let l_last_dir;     /* Last object picked in get_item() */
    let l_last_pick;    /* Last last_pick */


	let from_floor;

	const d = r.define;
    const t = r.types;

	const terse = false;

	this.move_on = false;

	const ISMULT = (type)=> {return (type == d.POTION || type == d.SCROLL || type == d.FOOD)}
	const on = (thing,flag)=>{return ((thing.t_flags & flag) != 0)};

	this.reset = ()=>{
		for (let i = 0; i <26; i++) pack_used[i] = false;
		this.pack_used = pack_used;

		inpack = 0;
 	}

	/*
	* add_pack:
	*	Pick up an object and add it to the pack.  If the argument is
	*	non-null use it as the linked_list pointer instead of gettting
	*	it off the ground.
	* オブジェクトをプレイヤーのパックに追加します。スケアモンスターのスクロールの特殊処理、同じタイプのスタック可能なアイテムのまとめ、
	* モンスターのターゲットが拾われたアイテムだった場合の処理、Amulet of Yendorが拾われた場合のフラグ設定などを行います。
	*/
	this.add_pack = function(obj, silent)
	{
		let player = r.player.player;
		let hero = player.t_pos;
		let proom = player.t_room;
		let pack = player.t_pack;

		//THING *op, *lp;
		let op, lp;
		//bool from_floor;
		//let from_floor;
		let debugstr = "";

		from_floor = false;
		if (obj == null)
		{
			obj = r.dungeon.find_obj(hero.y, hero.x);
			if (obj == null){
				r.UI.comment(".ap_0");
				return;
			}
			from_floor = true;
		}

		/*
		* Check for and deal with scare monster scrolls
		*/
		if (obj.o_type == d.SCROLL && obj.o_which == d.S_SCARE)
		if (obj.o_flags & d.ISFOUND)
		{
			r.dungeon.lvl_obj = r.detach(r.dungeon.lvl_obj, obj);
			r.UI.mvaddch(hero.y, hero.x, this.floor_ch());
			places[hero.y][hero.x].p_ch = (proom.r_flags & d.ISGONE) ? d.PASSAGE : d.FLOOR;
			r.discard(obj);
			r.UI.msg("the scroll turns to dust as you pick it up");
			return;
		}

		if (pack == null)
		{
			player.t_pack = obj;
			obj.o_packch = this.pack_char();
			//console.log(obj.o_packch);
			inpack++;

			debugstr += "packnull";
		}
		else
		{
			lp = null;
			for (let op = pack; op != null; op = op.l_next)
			{
				if (op.o_type != obj.o_type)
					lp = op;
				else
				{
					while (op.o_type == obj.o_type && op.o_which != obj.o_which)
					{
						lp = op;
						if (op.l_next == null)
							break;
						else
							op = op.l_next;
					}
					if (op.o_type == obj.o_type && op.o_which == obj.o_which)
					{
						if (ISMULT(op.o_type))
						{
							if (!this.pack_room(from_floor, obj)){
								r.UI.comment(".ap_1");
								return;
							}
							op.o_count++;
							r.discard(obj);
							obj = op;
							lp = null;
						}
						else if (obj.o_group)
						{
							lp = op;
							while (op.o_type == obj.o_type
								&& op.o_which == obj.o_which
								&& op.o_group != obj.o_group)
							{
								lp = op;
								if (op.l_next == null)
									break;
								else
									op = op.l_next;
							}
							if (op.o_type == obj.o_type
								&& op.o_which == obj.o_which
								&& op.o_group == obj.o_group)
							{
								op.o_count += obj.o_count;
								inpack--;
								if (!this.pack_room(from_floor, obj)){
									r.UI.comment(".ap_2");
									return;
								} 
								r.discard(obj);
								obj = op;
								lp = null;
							}
						}
						else
							lp = op;

						debugstr += "noting";
					}
					break;
				}
			}

			if (lp != null)
			{
				if (!this.pack_room(from_floor, obj))
					return;
				else
				{
					obj.o_packch = this.pack_char();
					obj.l_next = lp.l_next;
					obj.l_prev = lp;
					if (lp.l_next != null)
						lp.l_next.l_prev = obj;
					lp.l_next = obj;
				}
				debugstr += "lpon";
			}
		}
		obj.o_flags |= d.ISFOUND;

		/*
		* If this was the object of something's desire, that monster will
		* get mad and run at the hero.
		*/
		for (op = r.dungeon.mlist; op != null; op = op.l_next)
			if (op.t_dest == obj.o_pos)
				op.t_dest = hero;

		if (obj.o_type == d.AMULET)
			amulet = true;
		/*
		* Notify the user
		*/
		if (!silent)
		{
			let ms = "";
			if (!terse)
				ms = "you now have ";//r.UI.addmsg("you now have ");
			r.UI.msg(`${ms}${r.item.inv_name(obj, !terse)} (${obj.o_packch}`);
		}

		r.UI.comment(".add_pack" + debugstr);
	}

	/*
	* pack_room:
	*	See if there's room in the pack.  If not, print out an
	*	appropriate message
	* パックに空きがあるかをチェックします。
	*/
	this.pack_room = function(from_floor, obj)//THING *obj)
	{
		//console.log("ff" + from_floor);
		let player = r.player.player;
		let hero = player.t_pos;
		let proom = player.t_room;

		if (++inpack > d.MAXPACK)
		{
			if (!terse)
				r.UI.addmsg("there's ");
			r.UI.addmsg("no room");
			if (!terse)
				r.UI.addmsg(" in your pack");
			r.UI.endmsg();
			if (from_floor)
				this.move_msg(obj);
			inpack = d.MAXPACK;
			return false;
		}

		if (from_floor)
		{
			//console.log("get item from_floor")
			r.dungeon.lvl_obj = r.detach(r.dungeon.lvl_obj, obj);
			r.UI.mvaddch(hero.y, hero.x, this.floor_ch());

			//chat(hero.y, hero.x) = (proom.r_flags & ISGONE) ? PASSAGE : FLOOR;
			r.dungeon.places[hero.y][hero.x].p_ch = (proom.r_flags & d.ISGONE) ? d.PASSAGE : d.FLOOR;
		}

		return true;
	}

	/*
	* leave_pack:
	*	take an item out of the pack
	*/
	this.leave_pack = function(obj, newobj, all)//THING *obj, bool newobj, bool all)
	{
		let nobj;	//THING *nobj;

		inpack--;
		nobj = obj;
		if (obj.o_count > 1 && !all)
		{
			last_pick = obj;
			obj.o_count--;
			if (obj.o_group)
				inpack++;
			if (newobj)
			{
				nobj = new_item();
				nobj = obj;
				nobj.l_next = null;
				nobj.l_prev = null;
				nobj.o_count = 1;
			}
		}
		else
		{
			last_pick = null;
			this.pack_used[Number(obj.o_packch.charCodeAt(0) - 'a'.charCodeAt(0))] = false;
			pack = r.detach(pack, obj);
		}
		return nobj;
	}

	/*
	* pack_char:
	*	Return the next unused pack character.
	* 次の未使用のパック文字（'a'〜'z'）を返します
	*/
	this.pack_char = function()
	{
		let bp = -1;
		//for (bp = v.pack_used; bp; bp++)
		//	continue;
		for (let i in this.pack_used)
		{
			if (!this.pack_used[i])
			{ 
				bp = i;
				break;
			}	
		}
		this.pack_used[bp] = true;
		return (String.fromCharCode(Number('a'.charCodeAt(0)) + Number(bp)));
	}

	/*
	* inventory:
	*	List what is in the pack.  Return TRUE if there is something of
	*	the given type.
	*/
	this.inventory = function(list, type)	//THING *list, int type)
	{
		let inv_temp = "";// = [];//static char inv_temp[MAXSTR];

		n_objs = 0;
		for (; list != null; list = list.l_next)
		{
			if (type && type != list.o_type && !(type == d.CALLABLE &&
				list.o_type != d.FOOD && list.o_type != d.AMULET) &&
				!(type == d.R_OR_S && (list.o_type == d.RING || list.o_type == d.STICK)))
					continue;
			n_objs++;
			inv_temp = `${list.o_packch}) `;// ${}`"%c) %%s", list.o_packch);
			//msg_esc = true;
			inv_temp += r.item.things.inv_name(list, false);
			r.UI.submsg(inv_temp);
			//console.log(inv_temp);	
			//if (add_line(inv_temp, inv_name(list, false)) == d.ESCAPE)
			//{
			//	msg_esc = false;
			//	msg("");
			//	return true;
			//}
			//msg_esc = false;
		}
		if (n_objs == 0)
		{
			if (terse)
				r.UI.msg(type == 0 ? "empty handed" :
						"nothing appropriate");
			else
				r.UI.msg(type == 0 ? "you are empty handed" :
						"you don't have anything appropriate");
			return false;
		}
		//end_line();
		return true;
	}

	/*
	* pick_up:
	*	Add something to characters pack.
	*/
	this.pick_up = function(ch)
	{
		let player = r.player.player;
		let hero = player.t_pos;
		let proom = player.t_room;

		let obj;	//THING *obj;

		if (on(player, d.ISLEVIT))
			return;

		obj = r.dungeon.find_obj(hero.y, hero.x);
		if (this.move_on)
			this.move_msg(obj);
		else
		switch (ch)
		{
			case d.GOLD:
				if (obj == null)
					return;
				r.player.packf.money(obj.o_goldval);
				r.dungeon.lvl_obj = r.detach(r.dungeon.lvl_obj, obj);
				r.discard(obj);
				proom.r_goldval = 0;
				break;
			default:
			case d.ARMOR:
			case d.POTION:
			case d.FOOD:
			case d.WEAPON:
			case d.SCROLL:	
			case d.AMULET:
			case d.RING:
			case d.STICK:
				r.player.packf.add_pack(null, false);//(THING *) null
				break;
		}
	}

	/*
	* move_msg:
	*	Print out the message if you are just moving onto an object
	*/
	this.move_msg = function(obj)//THING *obj)
	{
		let ms = ""
		if (!terse)
			ms = "you ";//r.UI.addmsg("you ");
		r.UI.msg(`${ms}moved onto ${r.item.things.inv_name(obj, true)}`);
	}

	/*
	* picky_inven:
	*	Allow player to inventory a single item
	*/
	this.picky_inven = function()
	{
		let obj;//THING *obj;
		let mch;

		if (pack == null)
			msg("you aren't carrying anything");
		else if (next(pack) == null)
			msg("a) %s", inv_name(pack, false));
		else
		{
			msg(terse ? "item: " : "which item do you wish to inventory: ");
			mpos = 0;
			if ((mch = readchar()) == ESCAPE)
			{
				msg("");
				return;
			}
			for (obj = pack; obj != null; obj = next(obj))
				if (mch == obj.o_packch)
				{
					msg("%c) %s", mch, r.item.things.inv_name(obj, false));
					return;
				}
			msg("'%s' not in pack", unctrl(mch));
		}
	}

	/*
	* get_item:
	*	Pick something out of a pack for a purpose
	*/
	this.get_item = function(purpose, typechar)// *purpose, int type)
	{
		let player = r.player.player;
		let pack = player.t_pack;

		let obj;//THING *obj;
		let ch;

		if (pack == null)
			r.UI.msg("you aren't carrying anything");
		else if (again)
			if (last_pick)
				return last_pick;
			else
				r.UI.msg("you ran out");
		else
		{
			for (;;)
			{
				if (!terse)
					r.UI.addmsg("which object do you want to ");
				r.UI.addmsg(purpose);
				if (terse)
					r.UI.addmsg(" what");
				r.UI.msg("? (* for list): ");
				ch = readchar();
				mpos = 0;
				/*
				* Give the poor player a chance to abort the command
				*/
				if (ch == d.ESCAPE)
				{
					reset_last();
					after = false;
					r.UI.msg("");
					return null;
				}
				n_objs = 1;		/* normal case: person types one char */
				if (ch == '*')
				{
					mpos = 0;
					if (inventory(pack, type) == 0)
				{
					after = false;
					return null;
				}
				continue;
				}
				for (obj = pack; obj != null; obj = obj.l_next)
					if (obj.o_packch == ch)
						break;
				if (obj == null)
				{
					r.UI.msg("'%s' is not a valid item",unctrl(ch));
					continue;
				}
				else 
					return obj;
			}
		}
		return null;
	}

	/*
	* money:
	*	Add or subtract gold from the pack
	*/
	this.money = function(value)
	{
		let proom = r.player.player.t_room;
		let hero = r.player.player.t_pos;
		let purse = r.player.get_purse();
		//console.log(value + " " + purse);

		purse += value;
		r.UI.mvaddch(hero.y, hero.x, this.floor_ch());
		r.dungeon.places[hero.y][hero.x].p_ch = (proom.r_flags & d.ISGONE) ? d.PASSAGE : d.FLOOR;
		if (value > 0)
		{
			let ms = ""
			if (!terse)
				ms = "you found ";
			r.UI.msg(`${ms}${value} gold pieces`);
		}
		r.player.set_purse(purse);
	}

	/*
	* floor_ch:
	*	Return the appropriate floor character for her room
	*/
	this.floor_ch = function()
	{
		let proom = r.player.player.t_room;

		if (proom.r_flags & d.ISGONE)
			return d.PASSAGE;
		return (r.UI.show_floor() ? d.FLOOR : ' ');
	}

	/*
	* floor_at:
	*	Return the character at hero's position, taking see_floor
	*	into account
	*/
	this.floor_at = function()
	{
		let ch;

		ch = chat(hero.y, hero.x);
		if (ch == FLOOR)
			ch = floor_ch();
		return ch;
	}

	/*
	* reset_last:
	*	Reset the last command when the current one is aborted
	*/
	this.reset_last = function()
	{
		last_comm = l_last_comm;
		last_dir = l_last_dir;
		last_pick = l_last_pick;
	}
}