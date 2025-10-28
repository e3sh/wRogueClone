/*
 * Functions for dealing with problems brought about by weapons
 *
 * @(#)weapons.c	4.34 (Berkeley) 02/05/99
 *
 * Rogue: Exploring the Dungeons of Doom
 * Copyright (C) 1980-1983, 1985, 1999 Michael Toy, Ken Arnold and Glenn Wichman
 * All rights reserved.
 *
 * See the file LICENSE.TXT for full copyright and licensing information.
 */

//#include <curses.h>
//#include <string.h>
//#include <ctype.h>
//#include "rogue.h"

const NO_WEAPON = -1;

let group = 2;

//static struct init_weaps {
//    char *iw_dam;	/* Damage when wielded */
//    char *iw_hrl;	/* Damage when thrown */
//    char iw_launch;	/* Launching weapon */
//    int iw_flags;	/* Miscellaneous flags */
//} 
const init_dam = //[MAXWEAPONS] = 
[
    { dam:"2x4", hrl:"1x3",	launch: NO_WEAPON,	flags:0 		},	/* Mace */
    { dam:"3x4", hrl:"1x2",	launch: NO_WEAPON,	flags:0,		},	/* Long sword */
    { dam:"1x1", hrl:"1x1",	launch: NO_WEAPON,	flags:0,		},	/* Bow */
    { dam:"1x1", hrl:"2x3",	launch: BOW,		flags:ISMANY|ISMISL,	},	/* Arrow */
    { dam:"1x6", hrl:"1x4",	launch: NO_WEAPON,	flags:ISMISL|ISMISL,	},	/* Dagger */
    { dam:"4x4", hrl:"1x2",	launch: NO_WEAPON,	flags:0,		},	/* 2h sword */
    { dam:"1x1", hrl:"1x3",	launch: NO_WEAPON,	flags:ISMANY|ISMISL,	},	/* Dart */
    { dam:"1x2", hrl:"2x4",	launch: NO_WEAPON,	flags:ISMANY|ISMISL,	},	/* Shuriken */
    { dam:"2x3", hrl:"1x6",	launch: NO_WEAPON,	flags:ISMISL,	},	/* Spear */
];

/*
 * missile:
 *	Fire a missile in a given direction
 */
//void
function missile(ydelta, xdelta)
{
    let obj;    //THING *obj;
    /*
     * Get which thing we are hurling
     */
    if ((obj = get_item("throw", WEAPON)) == NULL)
	    return;
    if (!dropcheck(obj) || is_current(obj))
	    return;
    obj = leave_pack(obj, TRUE, FALSE);
    do_motion(obj, ydelta, xdelta);
    /*
     * AHA! Here it has hit something.  If it is a wall or a door,
     * or if it misses (combat) the monster, put it on the floor
     */
    if (moat(obj.o_pos.y, obj.o_pos.x) == NULL ||
	!hit_monster(unc(obj.o_pos), obj))
	    fall(obj, TRUE);
}

/*
 * do_motion:
 *	Do the actual motion on the screen done by an object traveling
 *	across the room
 */
//void
function do_motion(obj, ydelta, xdelta)//THING *obj, int ydelta, int xdelta)
{
    let ch;
    /*
     * Come fly with us ...
     */
    obj.o_pos = hero;
    for (;;)
    {
        /*
        * Erase the old one
        */
        if (!ce(obj.o_pos, hero) && cansee(unc(obj.o_pos)) && !terse)
        {
            ch = chat(obj.o_pos.y, obj.o_pos.x);
            if (ch == FLOOR && !show_floor())
            ch = ' ';
            mvaddch(obj.o_pos.y, obj.o_pos.x, ch);
        }
        /*
        * Get the new position
        */
        obj.o_pos.y += ydelta;
        obj.o_pos.x += xdelta;
        if (step_ok(ch = winat(obj.o_pos.y, obj.o_pos.x)) && ch != DOOR)
        {
            /*
            * It hasn't hit anything yet, so display it
            * If it alright.
            */
            if (cansee(unc(obj.o_pos)) && !terse)
            {
            mvaddch(obj.o_pos.y, obj.o_pos.x, obj.o_type);
            refresh();
            }
            continue;
        }
        break;
    }
}

/*
 * fall:
 *	Drop an item someplace around here.
 */
//void
function fall(obj, pr)//THING *obj, bool pr)
{
    let pp;     //PLACE *pp;
    let fpos;   //static coord fpos;

    if (fallpos(obj.o_pos, fpos))
    {
        pp = INDEX(fpos.y, fpos.x);
        pp.p_ch = obj.o_type;
        obj.o_pos = fpos;
        if (cansee(fpos.y, fpos.x))
        {
            if (pp.p_monst != NULL)
                pp.p_monst.t_oldch = obj.o_type;
            else
                mvaddch(fpos.y, fpos.x, obj.o_type);
        }
        attach(lvl_obj, obj);
        return;
    }
    if (pr)
    {
        if (has_hit)
        {
            endmsg();
            has_hit = FALSE;
        }
        msg("the %s vanishes as it hits the ground",
            weap_info[obj.o_which].oi_name);
    }
    discard(obj);
}

/*
 * init_weapon:
 *	Set up the initial goodies for a weapon
 */
//void
function init_weapon(weap, which)//THING *weap, int which)
{
    let iwp;    //struct init_weaps *iwp;

    weap.o_type = WEAPON;
    weap.o_which = which;
    iwp = init_dam[which];
    weap.o_damage = iwp.iw_dam;
    weap.o_hurldmg = iwp.iw_hrl;
    weap.o_launch = iwp.iw_launch;
    weap.o_flags = iwp.iw_flags;
    weap.o_hplus = 0;
    weap.o_dplus = 0;
    if (which == DAGGER)
    {
        weap.o_count = rnd(4) + 2;
        weap.o_group = group++;
    }
    else if (weap.o_flags & ISMANY)
    {
        weap.o_count = rnd(8) + 8;
        weap.o_group = group++;
    }
    else
    {
        weap.o_count = 1;
        weap.o_group = 0;
    }
}

/*
 * hit_monster:
 *	Does the missile hit the monster?
 */
//int
function hit_monster(y, x, obj)//int y, int x, THING *obj)
{
    let mp; //static coord mp;

    mp.y = y;
    mp.x = x;
    return fight(mp, obj, TRUE);
}

/*
 * num:
 *	Figure out the plus number for armor/weapons
 */
//char *
function num(n1, n2, type)
{
    let numbuf;//static char numbuf[10];

    sprintf(numbuf, n1 < 0 ? "%d" : "+%d", n1);
    if (type == WEAPON)
	    sprintf(numbuf[strlen(numbuf)], n2 < 0 ? ",%d" : ",+%d", n2);
    return numbuf;
}

/*
 * wield:
 *	Pull out a certain weapon
 */
//void
function wield()
{
    let obj, oweapon;//THING *obj, *oweapon;
    let sp;

    oweapon = cur_weapon;
    if (!dropcheck(cur_weapon))
    {
        cur_weapon = oweapon;
        return;
    }
    cur_weapon = oweapon;
    if ((obj = get_item("wield", WEAPON)) == NULL)
    {
    bad:
        after = FALSE;
        return;
    }

    if (obj.o_type == ARMOR)
    {
        msg("you can't wield armor");
        //goto bad;
    }
    if (is_current(obj))
        ;//goto bad;

    sp = inv_name(obj, TRUE);
    cur_weapon = obj;
    if (!terse)
	    addmsg("you are now ");
    msg("wielding %s (%c)", sp, obj.o_packch);
}

/*
 * fallpos:
 *	Pick a random position around the give (y, x) coordinates
 */
//bool
function fallpos(pos, newpos)//coord *pos, coord *newpos)
{
    let y, x, cnt, ch;

    cnt = 0;
    for (y = pos.y - 1; y <= pos.y + 1; y++)
        for (x = pos.x - 1; x <= pos.x + 1; x++)
        {
            /*
            * check to make certain the spot is empty, if it is,
            * put the object there, set it in the level list
            * and re-draw the room if he can see it
            */
            if (y == hero.y && x == hero.x)
                continue;
            if (((ch = chat(y, x)) == FLOOR || ch == PASSAGE)
                        && rnd(++cnt) == 0)
            {
                newpos.y = y;
                newpos.x = x;
            }
        }
    return (cnt != 0);
}
