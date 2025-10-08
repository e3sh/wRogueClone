/*
 * global variable initializaton
 *
 * @(#)extern.c	4.82 (Berkeley) 02/05/99
 *
 * Rogue: Exploring the Dungeons of Doom
 * Copyright (C) 1980-1983, 1985, 1999 Michael Toy, Ken Arnold and Glenn Wichman
 * All rights reserved.
 *
 * See the file LICENSE.TXT for full copyright and licensing information.
 */

function globalVariableInit(r){

    const d = r.define;
    const f = r.func;
    const t = r.types;
    const v = r.globalValiable;

    //bool after;				/* true if we want after daemons */
    //bool again;				/* Repeating the last command */
    //int  noscore;				/* Was a wizard sometime */
    //bool seenstairs;			/* Have seen the stairs (for lsd) */
    v.amulet = false;			/* He found the amulet */
    v.door_stop = false;			/* Stop running when we pass a door */
    v.fight_flush = false;		/* true if toilet input */
    v.firstmove = false;			/* First move after setting door_stop */
    v.got_ltc = false;			/* We have gotten the local tty chars */
    v.has_hit = false;			/* Has a "hit" message pending in msg */
    v.in_shell = false;			/* true if executing a shell */
    v.inv_describe = true;		/* Say which way items are being used */
    v.jump = false;			/* Show running as series of jumps */
    v.kamikaze = false;			/* to_death really to DEATH */
    v.lower_msg = false;			/* Messages should start w/lower case */
    v.move_on = false;			/* Next move shouldn't pick up items */
    v.msg_esc = false;			/* Check for ESC from msg's --More-- */
    v.passgo = false;			/* Follow passages */
    v.playing = true;			/* true until he quits */
    v.q_comm = false;			/* Are we executing a 'Q' command? */
    v.running = false;			/* true if player is running */
    v.save_msg = true;			/* Remember last msg */
    v.see_floor = true;			/* Show the lamp illuminated floor */
    v.stat_msg = false;			/* Should status() print as a msg() */
    v.terse = false;			/* true if we should be short */
    v.to_death = false;			/* Fighting is to the death! */
    v.tombstone = true;			/* Print out tombstone at end */
    v.wizard = false;			/* true if allows wizard commands */

    v.pack_used = [			/* Is the character used in the pack? */
        false, false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false
    ]; //26

    //char dir_ch;				/* Direction from last get_dir() call */
    //char file_name[MAXSTR];			/* Save file name */
    //char huh[MAXSTR];			/* The last message printed */
    //char *p_colors[MAXPOTIONS];		/* Colors of the potions */
    //char prbuf[2*MAXSTR];			/* buffer for sprintfs */
    //char *r_stones[MAXRINGS];		/* Stone settings of the rings */
    //char runch;				/* Direction player is running */
    //char *s_names[MAXSCROLLS];		/* Names of the scrolls */
    //char take;				/* Thing she is taking */
    //char whoami[MAXSTR];			/* Name of player */
    //char *ws_made[MAXSTICKS];		/* What sticks are made of */
    //char *ws_type[MAXSTICKS];		/* Is it a wand or a staff */
    //int  orig_dsusp;			/* Original dsusp char */
    v.fruit =			/* Favorite fruit */
            [ 's', 'l', 'i', 'm', 'e', '-', 'm', 'o', 'l', 'd', '\0' ];
    //char home[MAXSTR] = { '\0' };		/* User's home directory */
    v.inv_t_name = [
        "Overwrite",
        "Slow",
        "Clear"
    ];
    v.l_last_comm = '\0';		/* Last last_comm */
    v.l_last_dir = '\0';			/* Last last_dir */
    v.last_comm = '\0';			/* Last command typed */
    v.last_dir = '\0';			/* Last direction given */
    v.tr_name = [			/* Names of the traps */
        "a trapdoor",
        "an arrow trap",
        "a sleeping gas trap",
        "a beartrap",
        "a teleport trap",
        "a poison dart trap",
        "a rust trap",
        "a mysterious trap"
    ];

    //int n_objs;				/* # items listed in inventory() call */
    //int ntraps;				/* Number of traps on this level */
    v.hungry_state = 0;			/* How hungry is he */
    v.inpack = 0;				/* Number of things in pack */
    v.inv_type = 0;			/* Type of inventory to use */
    v.level = 1;				/* What level she is on */
    //int max_hit;				/* Max damage done to her in to_death */
    //int max_level;				/* Deepest player has gone */
    v.mpos = 0;				/* Where cursor is on top line */
    v.no_food = 0;			/* Number of levels without food */
    v.a_class = [		/* Armor class for each armor type */
        8,	/* LEATHER */
        7,	/* RING_MAIL */
        7,	/* STUDDED_LEATHER */
        6,	/* SCALE_MAIL */
        5,	/* CHAIN_MAIL */
        4,	/* SPLINT_MAIL */
        4,	/* BANDED_MAIL */
        3,	/* PLATE_MAIL */
    ];

    v.count = 0;				/* Number of times to repeat command */
    v.scoreboard = null;	/* File descriptor for score file */
    //int food_left;				/* Amount of food in hero's stomach */
    v.lastscore = -1;			/* Score before this turn */
    v.no_command = 0;			/* Number of turns asleep */
    v.no_move = 0;			/* Number of turns held in place */
    v.purse = 0;				/* How much gold he has */
    v.quiet = 0;				/* Number of quiet turns */
    v.vf_hit = 0;				/* Number of time flytrap has hit */

    v.dnum;				/* Dungeon number */
    v.seed;				/* Random number seed */
    v.e_levels = [
        10,
        20,
        40,
        80,
        160,
        320,
        640,
        1300,
        2600,
        5200,
        13000,
        26000,
        50000,
        100000,
        200000,
        400000,
        800000,
        2000000,
        4000000,
        8000000,
        0
    ];

    //coord delta;				/* Change indicated to get_dir() */
    //coord oldpos;				/* Position before last look() call */
    //coord stairs;				/* Location of staircase */

    v.places = Array(d.MAXLINES*d.MAXCOLS); /* level map */
    for (let i in v.places){
        v.places[i] = new t.PLACE();
    }

    v.cur_armor = new t.thing(); 			/* What he is wearing */
    v.cur_ring = [];
    v.cur_ring[0] = new t.thing();			/* Which rings are being worn */
    v.cur_ring[1] = new t.thing();			/* Which rings are being worn */
    v.cur_weapon = new t.thing();			/* Which weapon he is weilding */
    v.l_last_pick = null;		/* Last last_pick */
    v.last_pick = null;		/* Last object picked in get_item() */
    v.lvl_obj = null;			/* List of objects on this level */
    v.mlist = null;			/* List of monsters on the level */
    //v.player;				/* His stats */
                        /* restart of game */

    //WINDOW *hw = null;			/* used as a scratch window */
    //str exp lvl arm hp dmg maxhp
    d.INIT_STATS = [ 16, 0, 1, 10, 12, "1x4", 12 ];

    v.max_stats = new t.stats(d.INIT_STATS);	/* The maximum for the player */

    //struct room *oldrp;			/* Roomin(&oldpos) */
    v.rooms = Array(d.MAXROOMS);     /* One for each room -- A level */
    v.passages = Array(d.MAXPASS);	/* One for each passage */
    for (let i in v.passages){
        v.passages[i] = new t.room( {x:0, y:0}, {x:0, y:0}, {x:0, y:0}, 0, d.ISGONE|d.ISDARK, 0, [{x:0, y:0}] );
    }
    /*
    {
        { {0, 0}, {0, 0}, {0, 0}, 0, ISGONE|ISDARK, 0, {{0,0}} },
        { {0, 0}, {0, 0}, {0, 0}, 0, ISGONE|ISDARK, 0, {{0,0}} },
        { {0, 0}, {0, 0}, {0, 0}, 0, ISGONE|ISDARK, 0, {{0,0}} },
        { {0, 0}, {0, 0}, {0, 0}, 0, ISGONE|ISDARK, 0, {{0,0}} },
        { {0, 0}, {0, 0}, {0, 0}, 0, ISGONE|ISDARK, 0, {{0,0}} },
        { {0, 0}, {0, 0}, {0, 0}, 0, ISGONE|ISDARK, 0, {{0,0}} },
        { {0, 0}, {0, 0}, {0, 0}, 0, ISGONE|ISDARK, 0, {{0,0}} },
        { {0, 0}, {0, 0}, {0, 0}, 0, ISGONE|ISDARK, 0, {{0,0}} },
        { {0, 0}, {0, 0}, {0, 0}, 0, ISGONE|ISDARK, 0, {{0,0}} },
        { {0, 0}, {0, 0}, {0, 0}, 0, ISGONE|ISDARK, 0, {{0,0}} },
        { {0, 0}, {0, 0}, {0, 0}, 0, ISGONE|ISDARK, 0, {{0,0}} },
        { {0, 0}, {0, 0}, {0, 0}, 0, ISGONE|ISDARK, 0, {{0,0}} }
    };
    */
    const ___ = 1;
    const XX = 10;
    v.monsters = []; //Array(26);
    //                           Name		 CARRY	FLAG                             str, exp, lvl, amr, hpt, dmg 
    v.monsters.push(new t.monster( "aquator",      0,	d.ISMEAN,   	new t.stats([ XX, 20,   5,   2, ___, "0x0/0x0" ])) );
    v.monsters.push(new t.monster( "bat",	       0,	d.ISFLY,    	new t.stats([ XX,  1,   1,   3, ___, "1x2" ])) );
    v.monsters.push(new t.monster( "centaur",	  15,	0,          	new t.stats([ XX, 17,   4,   4, ___, "1x2/1x5/1x5" ])) );
    v.monsters.push(new t.monster( "dragon",	 100,	d.ISMEAN,   	new t.stats([ XX,5000, 10,  -1, ___, "1x8/1x8/3x10" ])) );
    v.monsters.push(new t.monster( "emu",          0,	d.ISMEAN,   	new t.stats([ XX,  2,   1,   7, ___, "1x2" ])) );
    v.monsters.push(new t.monster( "venus flytrap",0,	d.ISMEAN,   	new t.stats([ XX, 80,   8,   3, ___, "%%%x0" ])) );
        // NOTE: the damage is %%% so that xstr won't merge this 
        // string with others, since it is written on in the program 
    v.monsters.push(new t.monster( "griffin", 20,d.ISMEAN|d.ISFLY|d.ISREGEN, new t.stats([ XX,2000, 13,   2, ___, "4x3/3x5" ])) );
    v.monsters.push(new t.monster( "hobgoblin",	   0,	d.ISMEAN,   	new t.stats([ XX,  3,   1,   5, ___, "1x8" ])) );
    v.monsters.push(new t.monster( "ice monster",  0,	0       ,    	new t.stats([ XX,  5,   1,   9, ___, "0x0" ])) );
    v.monsters.push(new t.monster( "jabberwock",  70,	0       ,     	new t.stats([ XX,3000, 15,   6, ___, "2x12/2x4" ])) );
    v.monsters.push(new t.monster( "kestrel", 0,    d.ISMEAN|d.ISFLY,   new t.stats([ XX,  1,   1,   7, ___, "1x4" ])) );
    v.monsters.push(new t.monster( "leprechaun",   0,	0       ,   	new t.stats([ XX, 10,   3,   8, ___, "1x1" ])) );
    v.monsters.push(new t.monster( "medusa",	  40,	d.ISMEAN,   	new t.stats([ XX,200,   8,   2, ___, "3x4/3x4/2x5" ])) );
    v.monsters.push(new t.monster( "nymph",	     100,	0,          	new t.stats([ XX, 37,   3,   9, ___, "0x0" ])) );
    v.monsters.push(new t.monster( "orc",	      15,	d.ISGREED,      new t.stats([ XX,  5,   1,   6, ___, "1x8" ])) );
    v.monsters.push(new t.monster( "phantom",	   0,	d.ISINVIS,      new t.stats([ XX,120,   8,   3, ___, "4x4" ])) );
    v.monsters.push(new t.monster( "quagga",	   0,	d.ISMEAN,   	new t.stats([ XX, 15,   3,   3, ___, "1x5/1x5" ])) );
    v.monsters.push(new t.monster( "rattlesnake",  0,	d.ISMEAN,	    new t.stats([ XX,  9,   2,   3, ___, "1x6" ])) );
    v.monsters.push(new t.monster( "snake",	       0,	d.ISMEAN,	    new t.stats([ XX,  2,   1,   5, ___, "1x3" ])) );
    v.monsters.push(new t.monster( "troll", 50,     d.ISREGEN|d.ISMEAN, new t.stats([ XX,120,   6,   4, ___, "1x8/1x8/2x6" ])) );
    v.monsters.push(new t.monster( "black unicorn",0,	d.ISMEAN,	    new t.stats([ XX,190,   7,  -2, ___, "1x9/1x9/2x9" ])) );
    v.monsters.push(new t.monster( "vampire", 20,   d.ISREGEN|d.ISMEAN, new t.stats([ XX,350,   8,   1, ___, "1x10" ])) );
    v.monsters.push(new t.monster( "wraith",	   0,	0,      	    new t.stats([ XX, 55,   5,   4, ___, "1x6" ])) );
    v.monsters.push(new t.monster( "xeroc",	      30,	0,      	    new t.stats([ XX,100,   7,   7, ___, "4x4" ])) );
    v.monsters.push(new t.monster( "yeti",	      30,	0,      	    new t.stats([ XX, 50,   4,   6, ___, "1x6/1x6" ])) );
    v.monsters.push(new t.monster( "zombie",	   0,	d.ISMEAN,	    new t.stats([ XX,  6,   2,   8, ___, "1x8" ])) );


    v.things = []; //Array(d.NUMTHINGS);
    v.things[0] = new t.obj_info(0, 26); // potion
    v.things[1] = new t.obj_info(0, 36); // scroll
    v.things[2] = new t.obj_info(0, 16); // food
    v.things[3] = new t.obj_info(0,  7); // weapon
    v.things[4] = new t.obj_info(0,  7); // armor
    v.things[5] = new t.obj_info(0,  4); // ring
    v.things[6] = new t.obj_info(0,  4); // stick


    v.arm_info = []; //Array(d.MAXARMORS);
    v.arm_info.push(new t.obj_info( "leather armor",	 20,	 20, null, false ));
    v.arm_info.push(new t.obj_info( "ring mail",		 15,	 25, null, false ));
    v.arm_info.push(new t.obj_info( "studded leather armor", 15, 20, null, false ));
    v.arm_info.push(new t.obj_info( "scale mail",		 13,	 30, null, false ));
    v.arm_info.push(new t.obj_info( "chain mail",		 12,	 75, null, false ));
    v.arm_info.push(new t.obj_info( "splint mail",		 10,	 80, null, false ));
    v.arm_info.push(new t.obj_info( "banded mail",		 10,	 90, null, false ));
    v.arm_info.push(new t.obj_info( "plate mail",		  5,	150, null, false ));


    v.pot_info = []; //Array(d.MAXPOTIONS);
    v.pot_info.push(new t.obj_info( "confusion",	 7,   5, null, false ));
    v.pot_info.push(new t.obj_info( "hallucination", 8,   5, null, false ));
    v.pot_info.push(new t.obj_info( "poison",		 8,   5, null, false ));
    v.pot_info.push(new t.obj_info( "gain strength",13, 150, null, false ));
    v.pot_info.push(new t.obj_info( "see invisible", 3, 100, null, false ));
    v.pot_info.push(new t.obj_info( "healing",		13, 130, null, false ));
    v.pot_info.push(new t.obj_info( "monster detection", 6, 130, null, false ));
    v.pot_info.push(new t.obj_info( "magic detection",	 6, 105, null, false ));
    v.pot_info.push(new t.obj_info( "raise level",	 2, 250, null, false ));
    v.pot_info.push(new t.obj_info( "extra healing", 5, 200, null, false ));
    v.pot_info.push(new t.obj_info( "haste self",	 5, 190, null, false ));
    v.pot_info.push(new t.obj_info( "restore strength",	13, 130, null, false ));
    v.pot_info.push(new t.obj_info( "blindness",	 5,   5, null, false ));
    v.pot_info.push(new t.obj_info( "levitation",	 6,  75, null, false ));


    v.ring_info = []; //Array(d.MAXRINGS);
    v.ring_info.push(new t.obj_info( "protection",		 9, 400, null, false ));
    v.ring_info.push(new t.obj_info( "add strength",	 9, 400, null, false ));
    v.ring_info.push(new t.obj_info( "sustain strength", 5, 280, null, false ));
    v.ring_info.push(new t.obj_info( "searching",		10, 420, null, false ));
    v.ring_info.push(new t.obj_info( "see invisible",	10, 310, null, false ));
    v.ring_info.push(new t.obj_info( "adornment",		 1,  10, null, false ));
    v.ring_info.push(new t.obj_info( "aggravate monster",10, 10, null, false ));
    v.ring_info.push(new t.obj_info( "dexterity",		 8, 440, null, false ));
    v.ring_info.push(new t.obj_info( "increase damage",	 8, 400, null, false ));
    v.ring_info.push(new t.obj_info( "regeneration",	 4, 460, null, false ));
    v.ring_info.push(new t.obj_info( "slow digestion",	 9, 240, null, false ));
    v.ring_info.push(new t.obj_info( "teleportation",	 5,  30, null, false ));
    v.ring_info.push(new t.obj_info( "stealth",		     7, 470, null, false ));
    v.ring_info.push(new t.obj_info( "maintain armor",	 5, 380, null, false ));


    v.scr_info = []; //Array(d.MAXSCROLLS);
    v.scr_info.push(new t.obj_info( "monster confusion",	 7, 140, null, false ));
    v.scr_info.push(new t.obj_info( "magic mapping",		 4, 150, null, false ));
    v.scr_info.push(new t.obj_info( "hold monster",			 2, 180, null, false ));
    v.scr_info.push(new t.obj_info( "sleep",				 3,   5, null, false ));
    v.scr_info.push(new t.obj_info( "enchant armor",		 7, 160, null, false ));
    v.scr_info.push(new t.obj_info( "identify potion",		10,  80, null, false ));
    v.scr_info.push(new t.obj_info( "identify scroll",		10,  80, null, false ));
    v.scr_info.push(new t.obj_info( "identify weapon",		 6,  80, null, false ));
    v.scr_info.push(new t.obj_info( "identify armor",		 7, 100, null, false ));
    v.scr_info.push(new t.obj_info( "identify ring, wand or staff",	10, 115, null, false ));
    v.scr_info.push(new t.obj_info( "scare monster",		 3, 200, null, false ));
    v.scr_info.push(new t.obj_info( "food detection",		 2,  60, null, false ));
    v.scr_info.push(new t.obj_info( "teleportation",		 5, 165, null, false ));
    v.scr_info.push(new t.obj_info( "enchant weapon",		 8, 150, null, false ));
    v.scr_info.push(new t.obj_info( "create monster",		 4,  75, null, false ));
    v.scr_info.push(new t.obj_info( "remove curse",			 7, 105, null, false ));
    v.scr_info.push(new t.obj_info( "aggravate monsters",	 3,  20, null, false ));
    v.scr_info.push(new t.obj_info( "protect armor",		 2, 250, null, false ));


    v.weap_info = []; //Array(d.MAXWEAPONS + 1);
    v.weap_info.push(new t.obj_info( "mace",				11,   8, null, false ));
    v.weap_info.push(new t.obj_info( "long sword",			11,  15, null, false ));
    v.weap_info.push(new t.obj_info( "short bow",			12,  15, null, false ));
    v.weap_info.push(new t.obj_info( "arrow",				12,   1, null, false ));
    v.weap_info.push(new t.obj_info( "dagger",				 8,   3, null, false ));
    v.weap_info.push(new t.obj_info( "two handed sword",	10,  75, null, false ));
    v.weap_info.push(new t.obj_info( "dart",				12,   2, null, false ));
    v.weap_info.push(new t.obj_info( "shuriken",			12,   5, null, false ));
    v.weap_info.push(new t.obj_info( "spear",				12,   5, null, false ));
    v.weap_info.push(new t.obj_info( null, 0 ));	// DO NOT REMOVE: fake entry for dragon's breath


    v.ws_info = [];//Array(d.MAXSTICKS);
    v.ws_info.push(new t.obj_info( "light", 		12, 250, null, false ));
    v.ws_info.push(new t.obj_info( "invisibility",	 6,   5, null, false ));
    v.ws_info.push(new t.obj_info( "lightning", 	 3, 330, null, false ));
    v.ws_info.push(new t.obj_info( "fire",			 3, 330, null, false ));
    v.ws_info.push(new t.obj_info( "cold",			 3, 330, null, false ));
    v.ws_info.push(new t.obj_info( "polymorph", 	15, 310, null, false ));
    v.ws_info.push(new t.obj_info( "magic missile", 10, 170, null, false ));
    v.ws_info.push(new t.obj_info( "haste monster", 10,   5, null, false ));
    v.ws_info.push(new t.obj_info( "slow monster",	11, 350, null, false ));
    v.ws_info.push(new t.obj_info( "drain life",	 9, 300, null, false ));
    v.ws_info.push(new t.obj_info( "nothing",		 1,   5, null, false ));
    v.ws_info.push(new t.obj_info( "teleport away",  6, 340, null, false ));
    v.ws_info.push(new t.obj_info( "teleport to",	 6,  50, null, false ));
    v.ws_info.push(new t.obj_info( "cancellation",	 5, 280, null, false ));


    v.helpstr = [];
    v.helpstr.push(new t.h_list('?',	"	prints help",				true) );
    v.helpstr.push(new t.h_list('/',	"	identify object",			true) );
    v.helpstr.push(new t.h_list('h',	"	left",					true) );
    v.helpstr.push(new t.h_list('j',	"	down",					true) );
    v.helpstr.push(new t.h_list('k',	"	up",					true) );
    v.helpstr.push(new t.h_list('l',	"	right",					true) );
    v.helpstr.push(new t.h_list('y',	"	up & left",				true) );
    v.helpstr.push(new t.h_list('u',	"	up & right",				true) );
    v.helpstr.push(new t.h_list('b',	"	down & left",				true) );
    v.helpstr.push(new t.h_list('n',	"	down & right",				true) );
    v.helpstr.push(new t.h_list('H',	"	run left",				false) );
    v.helpstr.push(new t.h_list('J',	"	run down",				false) );
    v.helpstr.push(new t.h_list('K',	"	run up",				false) );
    v.helpstr.push(new t.h_list('L',	"	run right",				false) );
    v.helpstr.push(new t.h_list('Y',	"	run up & left",				false) );
    v.helpstr.push(new t.h_list('U',	"	run up & right",			false) );
    v.helpstr.push(new t.h_list('B',	"	run down & left",			false) );
    v.helpstr.push(new t.h_list('N',	"	run down & right",			false) );
    v.helpstr.push(new t.h_list("CTRL('H')",	"	run left until adjacent",		false) );
    v.helpstr.push(new t.h_list("CTRL('J')",	"	run down until adjacent",		false) );
    v.helpstr.push(new t.h_list("CTRL('K')",	"	run up until adjacent",			false) );
    v.helpstr.push(new t.h_list("CTRL('L')",	"	run right until adjacent",		false) );
    v.helpstr.push(new t.h_list("CTRL('Y')",	"	run up & left until adjacent",		false) );
    v.helpstr.push(new t.h_list("CTRL('U')",	"	run up & right until adjacent",		false) );
    v.helpstr.push(new t.h_list("CTRL('B')",	"	run down & left until adjacent",	false) );
    v.helpstr.push(new t.h_list("CTRL('N')",	"	run down & right until adjacent",	false) );
    v.helpstr.push(new t.h_list('\0',	"	<SHIFT><dir>: run that way",		true) );
    v.helpstr.push(new t.h_list('\0',	"	<CTRL><dir>: run till adjacent",	true) );
    v.helpstr.push(new t.h_list('f',	"<dir>	fight till death or near death",	true) );
    v.helpstr.push(new t.h_list('t',	"<dir>	throw something",			true) );
    v.helpstr.push(new t.h_list('m',	"<dir>	move onto without picking up",		true) );
    v.helpstr.push(new t.h_list('z',	"<dir>	zap a wand in a direction",		true) );
    v.helpstr.push(new t.h_list('^',	"<dir>	identify trap type",			true) );
    v.helpstr.push(new t.h_list('s',	"	search for trap/secret door",		true) );
    v.helpstr.push(new t.h_list('>',	"	go down a staircase",			true) );
    v.helpstr.push(new t.h_list('<',	"	go up a staircase",			true) );
    v.helpstr.push(new t.h_list('.',	"	rest for a turn",			true) );
    v.helpstr.push(new t.h_list(',',	"	pick something up",			true) );
    v.helpstr.push(new t.h_list('i',	"	inventory",				true) );
    v.helpstr.push(new t.h_list('I',	"	inventory single item",			true) );
    v.helpstr.push(new t.h_list('q',	"	quaff potion",				true) );
    v.helpstr.push(new t.h_list('r',	"	read scroll",				true) );
    v.helpstr.push(new t.h_list('e',	"	eat food",				true) );
    v.helpstr.push(new t.h_list('w',	"	wield a weapon",			true) );
    v.helpstr.push(new t.h_list('W',	"	wear armor",				true) );
    v.helpstr.push(new t.h_list('T',	"	take armor off",			true) );
    v.helpstr.push(new t.h_list('P',	"	put on ring",				true) );
    v.helpstr.push(new t.h_list('R',	"	remove ring",				true) );
    v.helpstr.push(new t.h_list('d',	"	drop object",				true) );
    v.helpstr.push(new t.h_list('c',	"	call object",				true) );
    v.helpstr.push(new t.h_list('a',	"	repeat last command",			true) );
    v.helpstr.push(new t.h_list(')',	"	print current weapon",			true) );
    v.helpstr.push(new t.h_list(']',	"	print current armor",			true) );
    v.helpstr.push(new t.h_list('=',	"	print current rings",			true) );
    v.helpstr.push(new t.h_list('@',	"	print current stats",			true) );
    v.helpstr.push(new t.h_list('D',	"	recall what's been discovered",		true) );
    v.helpstr.push(new t.h_list('o',	"	examine/set options",			true) );
    v.helpstr.push(new t.h_list("CTRL('R')",	"	redraw screen",				true) );
    v.helpstr.push(new t.h_list("CTRL('P')",	"	repeat last message",			true) );
    v.helpstr.push(new t.h_list("ESCAPE",	"	cancel command",			true) );
    v.helpstr.push(new t.h_list('S',	"	save game",				true) );
    v.helpstr.push(new t.h_list('Q',	"	quit",					true) );
    v.helpstr.push(new t.h_list('!',	"	shell escape",				true) );
    v.helpstr.push(new t.h_list('F',	"<dir>	fight till either of you dies",		true) );
    v.helpstr.push(new t.h_list('v',	"	print version number",			true) );
    v.helpstr.push(new t.h_list(0,		null ));
 
    /*
    * Contains defintions and functions for dealing with things like
    * potions and scrolls
    */
    v.rainbow = [
        "amber",
        "aquamarine",
        "black",
        "blue",
        "brown",
        "clear",
        "crimson",
        "cyan",
        "ecru",
        "gold",
        "green",
        "grey",
        "magenta",
        "orange",
        "pink",
        "plaid",
        "purple",
        "red",
        "silver",
        "tan",
        "tangerine",
        "topaz",
        "turquoise",
        "vermilion",
        "violet",
        "white",
        "yellow",
    ];

    //#define NCOLORS (sizeof rainbow / sizeof (char *))
    d.NCOLORS = v.rainbow.length; //NCOLORS;

    v.sylls = [
        "a", "ab", "ag", "aks", "ala", "an", "app", "arg", "arze", "ash",
        "bek", "bie", "bit", "bjor", "blu", "bot", "bu", "byt", "comp",
        "con", "cos", "cre", "dalf", "dan", "den", "do", "e", "eep", "el",
        "eng", "er", "ere", "erk", "esh", "evs", "fa", "fid", "fri", "fu",
        "gan", "gar", "glen", "gop", "gre", "ha", "hyd", "i", "ing", "ip",
        "ish", "it", "ite", "iv", "jo", "kho", "kli", "klis", "la", "lech",
        "mar", "me", "mi", "mic", "mik", "mon", "mung", "mur", "nej",
        "nelg", "nep", "ner", "nes", "nes", "nih", "nin", "o", "od", "ood",
        "org", "orn", "ox", "oxy", "pay", "ple", "plu", "po", "pot",
        "prok", "re", "rea", "rhov", "ri", "ro", "rog", "rok", "rol", "sa",
        "san", "sat", "sef", "seh", "shu", "ski", "sna", "sne", "snik",
        "sno", "so", "sol", "sri", "sta", "sun", "ta", "tab", "tem",
        "ther", "ti", "tox", "trol", "tue", "turs", "u", "ulk", "um", "un",
        "uni", "ur", "val", "viv", "vly", "vom", "wah", "wed", "werg",
        "wex", "whon", "wun", "xo", "y", "yot", "yu", "zant", "zeb", "zim",
        "zok", "zon", "zum",
    ];

    v.stones = [
        { name:"agate"      ,value:  25},
        { name:"alexandrite",value:  40},
        { name:"amethyst"   ,value:  50},
        { name:"carnelian"  ,value:  40},
        { name:"diamond"    ,value:	300},
        { name:"emerald"    ,value:	300},
        { name:"germanium"  ,value:	225},
        { name:"granite"    ,value:	  5},
        { name:"garnet"     ,value:	 50},
        { name:"jade"       ,value:	150},
        { name:"kryptonite" ,value:	300},
        { name:"lapis lazuli",value: 50},
        { name:"moonstone"  ,value:	 50},
        { name:"obsidian"   ,value:	 15},
        { name:"onyx"       ,value:	 60},
        { name:"opal"       ,value:	200},
        { name:"pearl"      ,value:	220},
        { name:"peridot"    ,value:	 63},
        { name:"ruby"       ,value:	350},
        { name:"sapphire"   ,value:	285},
        { name:"stibotantalite",value: 200},
        { name:"tiger eye"  ,value:	 50},
        { name:"topaz"      ,value:	 60},
        { name:"turquoise"  ,value:	 70},
        { name:"taaffeite"  ,value:	300},
        { name:"zircon"     ,value:	 80},
    ];
    //#define NSTONES (sizeof stones / sizeof (STONE))
    d.NSTONES = v.stones.length; //NSTONES;

    v.wood = [
        "avocado wood",
        "balsa",
        "bamboo",
        "banyan",
        "birch",
        "cedar",
        "cherry",
        "cinnibar",
        "cypress",
        "dogwood",
        "driftwood",
        "ebony",
        "elm",
        "eucalyptus",
        "fall",
        "hemlock",
        "holly",
        "ironwood",
        "kukui wood",
        "mahogany",
        "manzanita",
        "maple",
        "oaken",
        "persimmon wood",
        "pecan",
        "pine",
        "poplar",
        "redwood",
        "rosewood",
        "spruce",
        "teak",
        "walnut",
        "zebrawood",
    ];
    //#define NWOOD (sizeof wood / sizeof (char *))
    d.NWOOD = v.wood.length; //NWOOD;

    v.metal = [
        "aluminum",
        "beryllium",
        "bone",
        "brass",
        "bronze",
        "copper",
        "electrum",
        "gold",
        "iron",
        "lead",
        "magnesium",
        "mercury",
        "nickel",
        "pewter",
        "platinum",
        "steel",
        "silver",
        "silicon",
        "tin",
        "titanium",
        "tungsten",
        "zinc",
    ];
    //#define NMETAL (sizeof metal / sizeof (char *))
    d.NMETAL = v.metal.length; //NMETAL;

    //const MAX3 =(a,b,c)=>{ return (a > b)? ((a > c)? a : c) : ((b > c)? b : c); }
    //let used = [MAX3(cNCOLORS, cNSTONES, cNWOOD)];

    //weapon.c
    v.init_dam = [];
    v.init_dam.push(new t.init_weaps("2x4",	"1x3",	d.NO_WEAPON,	0 ));   /* Mace */
    v.init_dam.push(new t.init_weaps("3x4",	"1x2",	d.NO_WEAPON,	0 ));	/* Long sword */
    v.init_dam.push(new t.init_weaps("1x1",	"1x1",	d.NO_WEAPON,	0 ));	/* Bow */
    v.init_dam.push(new t.init_weaps("1x1",	"2x3",	d.BOW,		d.ISMANY|d.ISMISL ));	/* Arrow */
    v.init_dam.push(new t.init_weaps("1x6",	"1x4",	d.NO_WEAPON,d.ISMISL|d.ISMISL ));	/* Dagger */
    v.init_dam.push(new t.init_weaps("4x4",	"1x2",	d.NO_WEAPON,	0 ));	/* 2h sword */
    v.init_dam.push(new t.init_weaps("1x1",	"1x3",	d.NO_WEAPON,d.ISMANY|d.ISMISL ));	/* Dart */
    v.init_dam.push(new t.init_weaps("1x2",	"2x4",	d.NO_WEAPON,d.ISMANY|d.ISMISL ));	/* Shuriken */
    v.init_dam.push(new t.init_weaps("2x3",	"1x6",	d.NO_WEAPON,d.ISMISL ));	/* Spear */
}