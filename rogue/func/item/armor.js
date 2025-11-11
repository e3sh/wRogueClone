/*
 * This file contains misc functions for dealing with armor
 */

function armor(r){

    const d = r.define;
    //const f = r.func;
    const t = r.types;
    //const v = r.globalValiable;
    const ms = r.messages;
    
    /*
    * wear:
    *	The player wants to wear something, so let him/her put it on.
    */
    //void
    this.wear = function(obj)
    {
        //let obj; //register THING *obj;
        let sp; //register char *sp;

        //if ((obj = get_item("wear", d.ARMOR)) == null)
        //    return;
        if (r.player.get_cur_armor() != null)
        {
            r.UI.msg(ms.WEAR_1);
            take_off();
            r.after = false;
            return;
        }
        if (obj.o_type != d.ARMOR)
        {
            r.UI.msg("you can't wear that");
            return;
        }
        this.waste_time();
        obj.o_flags |= d.ISKNOW;
        sp = r.item.things.inv_name(obj, true);
        r.player.set_cur_armor(obj);
        r.UI.msg(ms.WEAR_2(sp));
    }

    /*
    * take_off:
    *	Get the armor off of the players back
    */
    //void
    function take_off()
    {
        let obj; //register THING *obj;

        if ((obj = r.player.get_cur_armor()) == null)
        {
            after = false;
            if (terse)
                r.UI.msg("not wearing armor");
            else
                r.UI.msg("you aren't wearing any armor");
            return;
        }
        if (!r.item.things.dropcheck(r.player.get_cur_armor()))
            return;
        r.player.set_cur_armor(null);
        //if (terse)
        //    r.UI.addmsg("was");
        //else
        //    r.UI.addmsg("you used to be");
        r.UI.msg(ms.TAKEOFF_1(obj.o_packch, r.item.things.inv_name(obj, true)));
    }

    /*
    * waste_time:
    *	Do nothing but let other things happen
    */
    //void
    this.waste_time = function()
    {
        r.daemon.do_daemons(d.BEFORE);
        r.daemon.do_fuses(d.BEFORE);
        r.daemon.do_daemons(d.AFTER);
        r.daemon.do_fuses(d.AFTER);
    }
}