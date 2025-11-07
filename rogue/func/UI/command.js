/*
* UIManager.command 
* command
* 参照）
* player (プレイヤーオブジェクト), has_hit (ヒットメッセージフラグ), running (走行中フラグ), 
* door_stop (ドア通過時停止フラグ), purse (所持ゴールド), count (コマンド繰り返し回数), 
* after (デーモン処理フラグ), to_death (戦死フラグ), cur_ring (装備中の指輪), 
* terse (メッセージ表示オプション), 
* last_comm, l_last_comm, last_dir, l_last_dir, last_pick, l_last_pick (直前のコマンド情報)
*/
function command(r, g)
{
    const d = r.define;
    const t = r.types;

    let mpos = 0;				/* Where cursor is on top line */
    let again;
    let count;

    let pr;     //after bgchr
    let oldc;   //before bgchr

    let sic_result = d.SIC_NOOP;

    const on = (thing,flag)=>{return ((thing.t_flags & flag) != 0)};

    //command main
    this.main = function(){

        let ki = r.UI.readchar();

        if (r.pause) {

            //ki = this.readchar();
            r.UI.pause("[Press return to continue]");
            if (r.UI.wait_for("Enter")||r.UI.wait_for("NumpadEnter")){
                let io = g.task.read("io");
                io.overlapview = false;
                r.pause = false;
                r.restart();
            }
            return;
        } 

        let player = r.player.player;
        const stat = r.player.get_status();
        const purse = stat.pur;
        const hero = player.t_pos; 
        const cur_ring = stat.ring;

        //let after = r.after;
        //let running = r.running;

        let no_command = r.player.get_no_command();
        let to_death = r.player.death;

        let ch; //,ki;
        let ntimes = 1;			/* Number of player moves */
        let fp; //*fp
        let mp; //THING *mp;
        let countch, direction, newcount = false;
        let kvf = false;
        let asleep = false;

        if (on(player, d.ISHASTE))
            ntimes++;
        /*
        * Let the daemons start up
        */
        r.daemon.do_daemons(d.BEFORE);
        r.daemon.do_fuses(d.BEFORE);

        if (sic_result != d.SIC_FREE){
            r.UI.msg(`SIC ${sic_result}`);
            sic_result = d.SIC_FREE;
        }

        while (ntimes--)
        {
            again = false;
            if (r.UI.has_hit)
            {
                r.UI.endmsg("");
                r.UI.has_hit = false;
            }
            /*
            * these are illegal things for the player to be, so if any are
            * set, someone's been poking in memeory
            */
            if (on(player, d.ISSLOW|d.ISGREED|d.ISINVIS|d.ISREGEN|d.ISTARGET))
            {
                r.UI.debug("illegal thing for the player");         
                //exit(1);
            }

            r.UI.look(true);
            if (!r.running)
                door_stop = false;
            r.UI.status();
            lastscore = purse;
            r.UI.move(hero.y, hero.x);
            //if (!((running || count) && jump))
            //    refresh();			/* Draw screen */
            take = 0;
            r.after = true;

            /*
            * Read command or continue run
            */
            //if (wizard)
            //    noscore = true;

            if (!no_command)
            {
                if (r.running || to_death)
                    ch = runch;
                else if (count)
                    ch = countch;
                else
                {
                    //ch = r.UI.readchar();
                    move_on = false;
                    if (mpos != 0)		/* Erase message if its there */
                        msg("");
                }
                asleep = false;
            }
            else
                ch = '.';
            if (no_command)
            {
                r.player.set_no_command(--no_command);
                if (no_command == 0)
                {
                    player.t_flags |= d.ISRUN;
                    r.UI.msg("you can move again");
                }
                asleep = true;
            }
            /*
            * execute a command
            */
            if (count && !r.running)
            count--;
            if (ch != 'a' && ch != d.ESCAPE && !(r.running || count || to_death))
            {
                //l_last_comm = last_comm;
                //l_last_dir = last_dir;
                //l_last_pick = last_pick;
                //last_comm = ch;
                //last_dir = '\0';
                //last_pick = null;
            }

            //ki = this.readchar();
            oldc = pr;
            let opcmdf = false; //operation command flag
            //if (!ki.includes("Space")){            
            //moving
            if (!asleep){
                if (ki.includes("Numpad4")) pr = r.player.do_move( 0,-1);
                if (ki.includes("Numpad2")) pr = r.player.do_move( 1, 0);
                if (ki.includes("Numpad8")) pr = r.player.do_move(-1, 0);
                if (ki.includes("Numpad6")) pr = r.player.do_move( 0, 1);
                if (ki.includes("Numpad7")) pr = r.player.do_move(-1,-1);
                if (ki.includes("Numpad9")) pr = r.player.do_move(-1, 1);
                if (ki.includes("Numpad1")) pr = r.player.do_move( 1,-1);
                if (ki.includes("Numpad3")) pr = r.player.do_move( 1, 1);

                //search
                if (ki.includes("Numpad5")) {
                    pr = r.player.do_move( 0, 0);
                    r.UI.search();
                    opcmdf = true;
                }
            }
            //exec
            if (ki.includes("Numpad0")) useItem();

            //selectitem
            if (ki.includes("NumpadAdd")||ki.includes("NumpadSubtract")||
                ki.includes("ArrowDown")||ki.includes("ArrowUp"))
            {
                r.player.packf.set_cur(
                    (ki.includes("NumpadAdd")||ki.includes("ArrowDown"))?1:-1
                );
                viewInventry(true);
            }else
                viewInventry();

            //inventry
            if (ki.includes("KeyI")) {
                let io = g.task.read("io");
                if (!io.overlapview) 
                    viewInventry(true)
                else
                    viewInventry();

            }
            //drop/throw
            if (ki.includes("KeyD")) dropItem(); 

            //no operation
            if (false){
                if (ki.includes("KeyR")) ;//read_scroll(); //auto_select
                if (ki.includes("KeyE")) ;//eat(); //auto_select
                if (ki.includes("KeyT")) ;//r.monster.wanderer();//take_off(); //auto_select
                if (ki.includes("KeyP")) ;//ring_on(); //auto_select
                if (ki.includes("KeyR")) ;//ring_off(); //auto_select
                if (ki.includes("KeyL")) ;//ring// select position L /
                if (ki.includes("KeyS")) ;//search(); //no operation
            }
            //if (ki.includes("KeyZ")) r.item.sticks.fire_bolt(hero,r.UI.get_delta(r.UI.delta),"fire");

            if (ki.includes("KeyM")) { //get item on/off
                r.after = false;
                r.player.packf.move_on = !(r.player.packf.move_on);
                r.UI.comment(`mv_on[${r.player.packf.move_on}]`);// ${r.after?"m":"s"}]`);
            }

            //enter/leave wizard mode    
            if (ki.includes("KeyW")) {
                r.wizard = (r.wizard)?false:true;
                r.UI.setEffect((r.wizard)?"ON":"OFF", {x:hero.x,y:hero.y} ,{x: hero.x, y: hero.y-1},90);
            }

            //inspectItem(wizard)
            const inspectItem = ()=>{
                let inkeyst = r.player.packf.get_cur();

                if (inkeyst != "") {
                    let selitem = r.player.packf.picky_inven(inkeyst);
                    if (selitem != null){
                        r.after = false;
                        r.debug.wizard.whatis(selitem);
                    }
                }
            }

            if (r.wizard){
                if (r.UI.wait_for("Digit1")) {r.setScene(d.WIZARD); break}//r.wizard.command scene;
                if (r.UI.wait_for("Digit2")) r.debug.wizard.hp_recovery();
                if (r.UI.wait_for("Digit3")) r.debug.wizard.food_supply();
                if (r.UI.wait_for("Digit4")) inspectItem();
                if (r.UI.wait_for("Digit5")) r.debug.mapcheckTest(); //debug command
                if (r.UI.wait_for("Digit6")) r.debug.monsterViewTest(); //debug command
                if (r.UI.wait_for("Digit7")) r.dungeon.show_map(); //debug command
            }
            //if (this.wait_for("ArrowDown")) r.debug.checkListsCount(); //debug command

            //} else {
            //}
            //set delta
            for (let i in ki)
                if (ki[i].includes("Numpad")){
                    let cnum = Number(ki[i].substring(6));
                    if (cnum >=1 && cnum <=9)    
                    {
                        //inkeyst = `direction: ${ki[i].substring(6).toLowerCase()}`;
                        if (cnum !=5) {
                            if (r.UI.delta != cnum) kvf = true;
                            r.UI.delta = cnum;
                        }
                        break;
                    }
                }

            if (r.after)
            {
                //r.UI.comment(`[${pr} ${oldc}`);// ${r.after?"m":"s"}]`);
                switch (pr)
                {
                    case d.DOOR:
                        //r.UI.msg(`DOOR:ROOM ${(oldc==d.PASSAGE)?"IN":"OUT"}`);
                        if (oldc==d.PASSAGE) r.dungeon.roomf.enter_room(hero);
                        if (oldc==d.FLOOR)   r.dungeon.roomf.leave_room(hero);
                        break;
                    case d.STAIRS: //r.UI.msg("STAIRS");
                        if (opcmdf) 
                            if (r.player.amulet){
                                r.dungeon.u_level();
                            }else{
                                r.dungeon.d_level();
                            }      
                        else
                            if (r.player.amulet){
                                r.UI.msg(`you find up stairs.`);//(push[5] or pad(A)key next dungeon level)`);
                            }else{
                                r.UI.msg(`you find down stairs.`);//(push[5] or pad(A)key next dungeon level)`);
                            }
                        break;
                    case d.GOLD:  
                    case d.FOOD:  
                    case d.POTION:
                    case d.SCROLL:
                    case d.WEAPON:
                    case d.ARMOR:  
                    case d.RING:   
                    case d.MAGIC:  
                    case d.STICK:  
                    case d.AMULET:
                        r.player.packf.pick_up(pr);
                        //viewInventry();
                        //r.UI.msg(`GET ITEM:${pr}/mode${r.player.packf.move_on}`); 
                        break;  
                }
                pr = "";
            }
        }

        r.daemon.do_daemons(d.AFTER);
        r.daemon.do_fuses(d.AFTER);

        const ISRING = (h,r)=>  {cur_ring[h] != null && cur_ring[h].o_which == r}

        if (ISRING(d.LEFT, d.R_SEARCH))
            r.UI.search();
        else if (ISRING(d.LEFT, d.R_TELEPORT) && r.rnd(50) == 0)
            r.item.scroll.teleport();
        if (ISRING(d.RIGHT, d.R_SEARCH))
            r.UI.search();
        else if (ISRING(d.RIGHT, d.R_TELEPORT) && r.rnd(50) == 0)
            r.item.scroll.teleport();

        r.UI.look(true);
        r.UI.status();

        let s = " ";
        for (let i in ki){s += `${ki[i]},`}
        if (kvf) r.UI.comment(`dir:${r.UI.delta} input:${s}`);//[${pr} ${oldc}]`);

    }

    //command inventory
    this.select_inv = function(){
        
        let ki = r.UI.readchar();

        //selectitem
        if (ki.includes("NumpadAdd")||ki.includes("NumpadSubtract")||
            ki.includes("ArrowDown")||ki.includes("ArrowUp")||
            ki.includes("Numpad2")  || ki.includes("Numpad8"))
        {
            let downkey = (ki.includes("NumpadAdd")||ki.includes("ArrowDown")||ki.includes("Numpad2")) 

            r.player.packf.set_cur((downkey)?1:-1);
        }

        let io = g.task.read("io");
        io.overlapview = true;
        r.UI.setHomesub(true);
        r.UI.clear(6); //centerconsole
        r.player.packf.inventory(r.player.player.t_pack, 0, true);

        if (ki.includes("Numpad4") || ki.includes("Numpad6") || ki.includes("Numpad5") ||
            ki.includes("Numpad0") || ki.includes("KeyI") || ki.includes("KeyD") ||
            ki.includes("KeyQ"))
        {
            let st = r.player.get_invstat();
            r.UI.setHomesub();
            r.UI.clear(3); //sideconsole 

            let io = g.task.read("io");
            for (let i in st){
                r.UI.submsg(st[i]);
            }
            io.overlapview = null;
            r.debug.mobslist();

            //sic_result = d.SIC_NOOP;
            if (ki.includes("Numpad0")) useItem();//sic_result = d.SIC_USE;
            if (ki.includes("KeyD"))    dropItem();//sic_result = d.SIC_DROP;

            r.setScene(d.MAINR);
        }
    }

    //inverntry view 
    function viewInventry(mode){
        //r.after = false; inventory(pack, 0);
        let st = r.player.get_invstat();
        r.UI.setHomesub();
        r.UI.clear(3); //sideconsole 
        for (let i in st){
            r.UI.submsg(st[i]);
        }

        let io = g.task.read("io");
        io.overlapview = mode;
        if (mode){
            r.UI.setHomesub(true);
            r.UI.clear(6); //centerconsole
            r.player.packf.inventory(r.player.player.t_pack, 0, true);
            r.setScene(d.INVSCE); 
        } 
        r.debug.mobslist();
    }

    //useitem
    function useItem(){

        let inkeyst = r.player.packf.get_cur();

        if (inkeyst != "") {
            //let cnum = inkeyst.charCodeAt(0);
            let ws = "";
            let useitem = r.player.packf.picky_inven(inkeyst);
            if (useitem != null){
                //ws = `Item type "${useitem.o_type}"`;
                r.after = false;

                switch(useitem.o_type)
                {
                    case d.FOOD:
                        ws = "food eat()";
                        r.player.eat(useitem);
                        break;
                    case d.WEAPON:
                        ws = "weapon wield()";
                        if (r.player.equip_state_check(inkeyst)) ws += "*";
                        r.item.weapon.wield(useitem);
                        // wield()
                        break;
                    case d.ARMOR:
                        ws = "armor wear()/takeoff()";
                        if (r.player.equip_state_check(inkeyst)) ws += "*";
                        r.item.armor.wear(useitem);/// takeoff()
                        break;                            
                    case d.RING:
                        ws = "ring ring_on/ring_off()";
                        if (r.player.equip_state_check(inkeyst)) ws += "*";
                        r.item.rings.ring_on(useitem);// ring_off()
                        break;                            
                    case d.STICK:
                        ws = "stick/wand do_zap()";
                        r.item.sticks.do_zap(useitem)//do_zap()
                        break;                            
                    case d.POTION:
                        ws = "potion quaff()";
                        r.item.potions.quaff(useitem);
                        break;                            
                    case d.SCROLL:
                        ws = "scroll read_scroll()";
                        r.item.scroll.read_scroll(useitem);
                        break;                            
                    default:
                        ws = "etc";
                        //no operation
                }
            }
            r.UI.comment(`${ws} ${inkeyst})`);
            r.player.packf.set_cur(0);
            r.UI.set_execItemuse();
            viewInventry();
        }
    }

    function dropItem(){

        let inkeyst = r.player.packf.get_cur();
        let dobj = r.player.packf.picky_inven(inkeyst);
        if (!Boolean(dobj)) return;

        if (dobj.o_type == d.WEAPON){
            let delta = r.UI.get_delta(r.UI.delta);
            r.item.weapon.missile(dobj, delta.y, delta.x);
        }else{
            r.item.things.drop(dobj);
        }
        r.player.packf.set_cur(0);
        r.UI.set_execItemuse();
        viewInventry();
    }
}