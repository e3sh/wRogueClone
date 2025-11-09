/*
 * Special wizard command mode
 */
function quick_storage(r){

    const d = r.define;
    const t = r.types;

	const weap_info = r.globalValiable.weap_info;
	const arm_info 	= r.globalValiable.arm_info;
	const scr_info	= r.globalValiable.scr_info
	const pot_info	= r.globalValiable.pot_info;
	const ws_info	= r.globalValiable.ws_info;
	const ring_info = r.globalValiable.ring_info;

    this.save = function(){

        let scr_know = [];
        let pot_know = [];
        let ws_know = [];
        let ring_know = [];

        for (let i in scr_info) scr_know[i] = scr_info[i].oi_know;
        for (let i in pot_info) pot_know[i] = pot_info[i].oi_know;
        for (let i in ws_info) ws_know[i]  = ws_info[i].oi_know;
        for (let i in ring_info) ring_know[i] = ring_info[i].oi_know;

        let sl = [];
        for (let i in r.mobs){
            if (r.mobs[i].location == d.PLOBJ || r.mobs[i].location == d.PACK_P){
                r.mobs[i].equiped = r.player.equip_state_check(r.mobs[i].o_packch);

                sl.push(r.mobs[i]);
            }
        }
        let jsontext = JSON.stringify(sl, (key, value)=>{
            //custum
            const rejectKeys = ["_t" ,"_o" ,"l_next" ,"l_prev" ,"t_pack", "t_room"];
            if (rejectKeys.includes(key)) return null; 
            return value;
        });

        let savedata = {
            level: r.dungeon.get_level(),
            scr: scr_know,
            pot: pot_know,
            ws: ws_know,
            ring: ring_know,
            food_left: r.player.get_food_left(),
            purse: r.player.get_purse(),
        }

        let svd = JSON.stringify(savedata);

        localStorage.setItem("rogue.Save", true);
        localStorage.setItem("rogue.PlayerObjects", jsontext);
        localStorage.setItem("rogue.ParamItems", svd);

        r.UI.comment("quick_save");
    }

    this.reset = function(){
        localStorage.removeItem("rogue.Save");
        localStorage.removeItem("rogue.PlayerObjects");
        localStorage.removeItem("rogue.ParamItems");

        r.UI.comment("quick_remove");
    }

    this.check = function(){
        return (Boolean(localStorage.getItem("rogue.Save")));
    }

    this.load = function(){

        let mobs;
        let insp;

        if (Boolean(localStorage.getItem("rogue.Save"))){
            //localStorage.removeItem("rogue.Save");

            if (Boolean(localStorage.getItem("rogue.PlayerObjects"))) {
                mobs = JSON.parse(localStorage.getItem("rogue.PlayerObjects"));
                r.UI.comment("pobj_load comp");

            }
            if (Boolean(localStorage.getItem("rogue.ParamItems"))) {
                insp = JSON.parse(localStorage.getItem("rogue.ParamItems"));
                r.UI.comment("param_load comp");
            }

            r.dungeon.set_level(insp.level);
            r.player.set_food_left(insp.food_left);
            r.player.set_purse(insp.purse);

            for (let i in mobs){
                if (mobs[i].location == d.PLOBJ){
                    let pl = r.new_item();
                    let m = mobs[i];
                    pl.location = m.location;
                    pl.t_stats = m.t_stats;

                    r.player.set_new_player(pl);
                    //r.UI.comment("PLOBJ setup"); 
                    break;
                }
            }

            for (let i in mobs){
                if (mobs[i].location == d.PACK_P){
                    let pl = r.new_item();
                    let m = mobs[i];
                    pl.location = m.location;
                    pl.o_type = m.o_type;
                    pl.o_which = m.o_which;
                    pl.o_hplus = m.o_hplus;
                    pl.o_dplus = m.o_dplus;
                    pl.o_damage = m.o_damage;
                    pl.o_hurldmg = m.o_hurldmg;
                    pl.o_damage = m.o_damage;
                    pl.o_arm = m.o_arm;
                    pl.o_charge = m.o_arm;
                    pl.o_goldval = m.o_arm;
                    pl.o_flags = m.o_flags;
                    pl.o_count = m.o_count;

                    if (m.equiped){
                        switch(pl.o_type){
                            case d.WEAPON:
                                r.player.set_cur_weapon(pl);
                            break;
                            case d.ARMOR:
                                r.player.set_cur_armor(pl);
                            break;
                            case d.RING:
                                if (r.player.get_cur_ring(d.LEFT) == null){
                                    r.player.set_cur_ring(d.LEFT, pl);
                                } else {
                                    r.player.set_cur_ring(d.RIGHT, pl);
                                }
                            break;
                        }
                    }
                    r.player.packf.add_pack(pl, true);
                    //r.UI.comment("PACK_M add"); 
                }
            }
            r.UI.comment("quick_load");
        }else{
            r.UI.comment("quick_load(nodata)");
        }
    }

    //save_player
    //player
    //r.mobs PLOBJ
    //r.mobs PACK_P
    //
    //max_stats
    // inspectitem status

    //load_player
    //
    //r.mobs PACK_P add_pack
    // inspect_items ow_know
   //max_stats

}