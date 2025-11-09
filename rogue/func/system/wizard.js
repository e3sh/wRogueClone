/*
 * Special wizard command mode
 */
function wizard(r, g){

    const d = r.define;
    const t = r.types;

	const msg = r.UI.msg;

	const weap_info = r.globalValiable.weap_info;
	const arm_info 	= r.globalValiable.arm_info;
	const scr_info	= r.globalValiable.scr_info
	const pot_info	= r.globalValiable.pot_info;
	const ws_info	= r.globalValiable.ws_info;
	const ring_info = r.globalValiable.ring_info;

	const a_class = r.globalValiable.a_class;

	let col = 0, curw = 0;

	let type = 1;
	let which = 1;
	let bless = 0;

	let cumax; 
	
	const itemsdb =[
		{i_name:"weapon", i_type:d.WEAPON, i_which:weap_info},
		{i_name:"armor" , i_type:d.ARMOR , i_which:arm_info },
		{i_name:"scroll", i_type:d.SCROLL, i_which:scr_info },
		{i_name:"potion", i_type:d.POTION, i_which:pot_info },
		{i_name:"wand and staff", i_type:d.STICK, i_which:ws_info},
		{i_name:"ring"  , i_type:d.RING  , i_which:ring_info},
	]

	//command
	this.command = function(){
        let ki = r.UI.readchar();

		if (ki.includes("KeyE")){
			create_obj();
		};		


        if (ki.includes("ArrowDown")||ki.includes("ArrowUp")){
			col +=((ki.includes("ArrowDown"))?1:-1);
		}

        if (ki.includes("ArrowRight")||ki.includes("ArrowLeft")){
			curw +=((ki.includes("ArrowRight"))?1:-1);
		}

		//wizardmenu();
		create_obj_menu();

		if (r.UI.wait_for("KeyQ")) {
			let io = g.task.read("io");
			io.overlapview = null;
			col = 0;
			curw = 0;
			r.setScene(d.MAINR);
		}
 	}

	/**
	 * player hp recovory (wizard)
	 */
	this.hp_recovery = function(){

		let pstats = r.player.get_pstats();
		pstats.s_hpt = r.player.get_maxhp();
		r.player.set_pstats(pstats);

		msg("wizard: hp_recover");
	}
	/**
	 * player food_supply (wizard)
	 */
	this.food_supply = function(){

		r.player.set_food_left(1500);
		msg("wizard: food_supply");
	}

	/*
	* whatis: (wizard)
	*	What a certin object is
	*/
	//void
	this.whatis = function(obj)//thing
	{
		if (obj == null)
			return;

		switch (obj.o_type)
		{
			case d.SCROLL:
				set_know(obj, scr_info);
				break; 
			case d.POTION:
				set_know(obj, pot_info);
				break; 
			case d.STICK:
				set_know(obj, ws_info);
				break; 
			case d.WEAPON:
			case d.ARMOR:
				obj.o_flags |= d.ISKNOW;
				break; 
			case d.RING:
				set_know(obj, ring_info);
		}
		msg(`wizard: whatis ${r.item.inv_name(obj, false)}`);
	}

	/*
	* set_know:
	*	Set things up break; case we really know what a thing is
	*/

	//void
	function set_know(obj, info)//THING *obj, struct obj_info *info)
	{
		let guess; //char **guess;

		info[obj.o_which].oi_know = true;
		obj.o_flags |= d.ISKNOW;
		guess = info[obj.o_which].oi_guess;
	}

	/*
	* create_obj:
	*	wizard command for getting anything he wants
	*/
	//void
	function create_obj()
	{
		let obj;//THING *obj;
		//let ch//, //bless; //char

		obj = r.new_item();
		obj.o_type = itemsdb[type].i_type;//readchar();
		//mpos = 0;
		//msg("which %c do you want? (0-f)", obj.o_type);
		obj.o_which = which;//(isdigit((ch = readchar())) ? ch - '0' : ch - 'a' + 10);
		obj.o_group = 0;
		obj.o_count = 1;
		//mpos = 0;
		if (obj.o_type == d.WEAPON || obj.o_type == d.ARMOR)
		{
			//msg("blessing? (+,-,n)");
			//bless = bless;//readchar();
			//mpos = 0;
			if (bless < 0)//== '-')
				obj.o_flags |= d.ISCURSED;
			if (obj.o_type == d.WEAPON)
			{
				r.item.init_weapon(obj, obj.o_which);
				if (bless < 0)//== '-')
				obj.o_hplus -= r.rnd(3)+1;
				if (bless > 0)//== '+')
				obj.o_hplus += r.rnd(3)+1;
			}
			else
			{
				obj.o_arm = a_class[obj.o_which];
				if (bless < 0)//== '-')
				obj.o_arm += r.rnd(3)+1;
				if (bless > 0)//== '+')
				obj.o_arm -= r.rnd(3)+1;
			}
		}
		else if (obj.o_type == d.RING)
		switch (obj.o_which)
		{
			case d.R_PROTECT:
			case d.R_ADDSTR:
			case d.R_ADDHIT:
			case d.R_ADDDAM:
				//msg("blessing? (+,-,n)");
				//bless = readchar();
				//mpos = 0;
				if (bless < 0)//== '-')
					obj.o_flags |= d.ISCURSED;
				obj.o_arm = (bless < 0) ? -1 : r.rnd(2) + 1;
				break; 
			case d.R_AGGR:
			case d.R_TELEPORT:
				obj.o_flags |= d.ISCURSED;
		}
		else if (obj.o_type == d.STICK)
			r.item.fix_stick(obj);
		else if (obj.o_type == d.GOLD)
		{
			msg("how much?");
			obj.o_goldval = 1;
		}
		r.player.packf.add_pack(obj, false);
	}

	function create_obj_menu(){

		switch(col)
		{
			case 2:
				type = curw;
				if (type < 0) type = 0;  
				if (type >= itemsdb.length-1) type = itemsdb.length-1; //curw = itemsdb.length-1 } 
				cumax = itemsdb.length-1;
				break;
			case 3:
				which = curw;
				if (which < 0) {which = 0;}
				if (which >= itemsdb[type].i_which.length-1) {
					which = itemsdb[type].i_which.length-1;	
				}
				cumax = itemsdb[type].i_which.length-1;
				break;
			case 4:
				bless = curw;
				break;
			default:
				break;
		}

		//type
		if (type < 0) {type = 0;}  
		if (type >= itemsdb.length-1) { type = itemsdb.length-1;} //curw = itemsdb.length-1 } 
		
		//which
		if (which < 0) {which = 0;}
		if (which >= itemsdb[type].i_which.length-1) {
			which = itemsdb[type].i_which.length-1;
		}

		if (col < 2) col = 2; else if (col >4) col = 4;
		if (col !=4) if (curw < 0) curw = 0; else if (curw > cumax) curw = cumax;

		//bress
		const menu = [
			"wizard: Create Object",
			"",
			`type of item:${itemsdb[type].i_name}`,
			`which:${itemsdb[type].i_which[which].oi_name}`,
			`blessing? (+,-,n):${bless}`,
			"",
			"E:Execute",
			"Q:Quit",
		]

		let io = g.task.read("io");
		io.overlapview = true;

		r.UI.clear(6);
		for (let i in menu){
			r.UI.submvprintw(i, 0, `${(col == i && (col >=2 && col <=4))?">":" "} ${menu[i]}`, true);
		}
	}

	this.help_menu = function(){
        let ki = r.UI.readchar();

		//wizardmenu();
		help_menu_draw();

		if (r.UI.wait_for("KeyQ")) {
			let io = g.task.read("io");
			io.overlapview = null;
			col = 0;
			curw = 0;
			r.setScene(d.MAINR);
		}
	}

	function help_menu_draw(){
		const menu = [
			"wizard: Help",
			"DigitKey information)",
			"1: Create Object",
			"2: hp_recovery (hp = max_hp)",
			"3: food_supply (food_left = 1500)",
			"4: inspectItem (selected item)",
			"5: mapCheckTest",
			"6: monsterViewTest",
			"7: r.dungeon.show_map() (cls)",
			"8:",
			"9:",
			"0: Help (this menu)",
			"",
			"Q:Quit",
		]

		let io = g.task.read("io");
		io.overlapview = true;

		r.UI.clear(6);
		for (let i in menu){
			r.UI.submvprintw(i, 0, `${menu[i]}`, true);
		}
	}
}
