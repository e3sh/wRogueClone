function rogueDefines(){

    /*
    * spread:
    *	Give a spread around a given number (+/- 20%)?
    */
    const spread = (nm)=>{
        const twenty_percent = nm / 5; 
        const random_range_total_width = twenty_percent * 2; // nm * 0.4

        return nm + Math.floor(Math.random()*(random_range_total_width + 1) - twenty_percent);
    };

    const d = {
        /*
        * Maximum number of different things
        */
        MAXROOMS  : 9,
        MAXTHINGS : 9,
        MAXOBJ    : 9,
        MAXPACK   : 23,
        MAXTRAPS  : 10,
        AMULETLEVEL : 26,
        NUMTHINGS : 7,    /* number of types of things */
        MAXPASS   : 13,	/* upper limit on number of passages */
        NUMLINES  : 24,
        NUMCOLS   : 80,
        STATLINE  : 23, //(NUMLINES - 1),
        BORE_LEVEL: 50,
        /*
        * return values for get functions
        */
        NORM  : 0,	/* normal exit */
        QUIT  : 1,	/* quit option setting */
        MINUS : 2,	/* back up one option */
        /*
        * inventory types
        */
        INV_OVER : 0,
        INV_SLOW : 1,
        INV_CLEAR: 2,
        /*
        * things that appear on the screens
        * ゲーム画面に表示されるシンボルの定義です。
        */
        PASSAGE   : '#',
        DOOR      : '+',
        FLOOR     : '.',
        PLAYER    : '@',
        TRAP      : '^',
        STAIRS    : '%',
        GOLD      : '*',
        POTION    : '!',
        SCROLL    : '?',
        MAGIC     : '$',
        FOOD      : ':',
        WEAPON    : ')',
        ARMOR     : ']',
        AMULET    : ',',
        RING      : '=',
        STICK     : '/',
        CALLABLE : -1,
        R_OR_S   : -2,
        /*
        * Various ants
        * ゲームプレイに関連する時間（BEARTIME, SLEEPTIMEなど）、方向（LEFT, RIGHT）、長さ（BOLT_LENGTH, LAMPDIST）などの定数です。
        */
        BEARTIME    : spread(3),
        SLEEPTIME   : spread(5),
        HOLDTIME    : spread(2),
        WANDERTIME  : spread(70),
        BEFORE  	: spread(1),
        AFTER		: spread(2),
        HEALTIME	: 30,
        HUHDURATION : 20,
        SEEDURATION : 850,
        HUNGERTIME  : 1300,
        MORETIME    : 150,
        STOMACHSIZE : 2000,
        STARVETIME  : 850,
        ESCAPE      : 27,
        LEFT        : 0,
        RIGHT       : 1,
        BOLT_LENGTH : 6,
        LAMPDIST    : 3,
        //#ifdef MASTER
        //#ifndef PASSWD
        //#define	PASSWD		"mTBellIQOsLNA"
        //#endif
        //#endif
        /*
        * Save against things
        * セーブ判定の種類です。
        */
        VS_POISON	: 0,
        VS_PARALYZATION :	0,
        VS_DEATH	: 0,
        VS_BREATH	: 2,
        VS_MAGIC	: 3,
        /*
        * Various flag bits
        * 部屋、オブジェクト、クリーチャー、レベルマップに関するフラグの定義です。
        */
        /* flags for rooms */
        ISDARK  : parseInt("0000001",2),		/* room is dark */
        ISGONE	: parseInt("0000002",2),		/* room is gone (a corridor) */
        ISMAZE	: parseInt("0000004",2),		/* room is gone (a corridor) */

        /* flags for objects */
        ISCURSED: parseInt("0000001",2),		/* object is cursed */
        ISKNOW  : parseInt("0000002",2),		/* player knows details about the object */
        ISMISL	: parseInt("0000004",2),		/* object is a missile type */
        ISMANY	: parseInt("0000010",2),		/* object comes in groups */
        /*	ISFOUND 0000020		...is used for both objects and creatures */
        ISPROT	: parseInt("0000040",2),		/* armor is permanently protected */

        /* flags for creatures */
        CANHUH	: parseInt("0000001",2),		/* creature can confuse */
        CANSEE	: parseInt("0000002",2),		/* creature can see invisible creatures */
        ISBLIND	: parseInt("0000004",2),		/* creature is blind */
        ISCANC	: parseInt("0000010",2),		/* creature has special qualities cancelled */
        ISLEVIT	: parseInt("0000010",2),		/* hero is levitating */
        ISFOUND	: parseInt("0000020",2),		/* creature has been seen (used for objects) */
        ISGREED	: parseInt("0000040",2),		/* creature runs to protect gold */
        ISHASTE	: parseInt("0000100",2),		/* creature has been hastened */
        ISTARGET: parseInt("0000200",2),		/* creature is the target of an 'f' command */
        ISHELD	: parseInt("0000400",2),		/* creature has been held */
        ISHUH   : parseInt("0001000",2),		/* creature is confused */
        ISINVIS	: parseInt("0002000",2),		/* creature is invisible */
        ISMEAN	: parseInt("0004000",2),		/* creature can wake when player enters room */
        ISHALU	: parseInt("0004000",2),		/* hero is on acid trip */
        ISREGEN	: parseInt("0010000",2),		/* creature can regenerate */
        ISRUN 	: parseInt("0020000",2),		/* creature is running at the player */
        SEEMONST: parseInt("0040000",2),		/* hero can detect unseen monsters */
        ISFLY	: parseInt("0040000",2),		/* creature can fly */
        ISSLOW	: parseInt("0100000",2),		/* creature has been slowed */

        /*
        * Flags for level map
        */
        F_PASS    : parseInt("0x80",16),		/* is a passageway */
        F_SEEN    : parseInt("0x40",16),		/* have seen this spot before */
        F_DROPPED : parseInt("0x20",16),		/* object was dropped here */
        F_LOCKED  : parseInt("0x20",16),		/* door is locked */
        F_REAL    : parseInt("0x10",16),		/* what you see is what you get */
        F_PNUM    : parseInt("0x0f",16),		/* passage number mask */
        F_TMASK   : parseInt("0x07",16),		/* trap number mask */

        /*
        * Trap types
        * 各種アイテムと罠のタイプを定義します。
        */
        T_DOOR  : 0,
        T_ARROW : 1,
        T_SLEEP	: 2,
        T_BEAR	: 3,
        T_TELEP	: 4,
        T_DART	: 5,
        T_RUST	: 6,
        T_MYST  : 7,
        NTRAPS  : 8,

        /*
        * Potion types
        */
        P_CONFUSE : 0,
        P_LSD     : 1,
        P_POISON  : 2,
        P_STRENGTH: 3,
        P_SEEINVIS: 4,
        P_HEALING : 5,
        P_MFIND   : 6,
        P_TFIND   : 7,
        P_RAISE   : 8,
        P_XHEAL   : 9,
        P_HASTE   : 10,
        P_RESTORE : 11,
        P_BLIND   : 12,
        P_LEVIT   : 13,
        MAXPOTIONS : 14,

        /*
        * Scroll types
        */
        S_CONFUSE   :  0,
        S_MAP	    :  1,
        S_HOLD	    :  2,
        S_SLEEP	    :  3,
        S_ARMOR	    :  4,
        S_ID_POTION :  5,
        S_ID_SCROLL :  6,
        S_ID_WEAPON :  7,
        S_ID_ARMOR  :  8,
        S_ID_R_OR_S :  9,
        S_SCARE     : 10,
        S_FDET      : 11,
        S_TELEP     : 12,
        S_ENCH      : 13,
        S_CREATE    : 14,
        S_REMOVE    : 15,
        S_AGGR      : 16,
        S_PROTECT   : 17,
        MAXSCROLLS  : 18,
        /*
        * Weapon types
        */
        MACE	    : 0,
        SWORD	    : 1,
        BOW		    : 2,
        ARROW	    : 3,
        DAGGER  	: 4,
        TWOSWORD	: 5,
        DART	    : 6,
        SHIRAKEN	: 7,
        SPEAR	    : 8,
        FLAME	    : 9,/* fake entry for dragon breath (ick) */
        MAXWEAPONS  : 9,	/* this should equal FLAME */
        NO_WEAPON   : -1,
        /*
        * Armor types
        */
        LEATHER   	: 0,
        RING_MAIL 	: 1,
        STUDDED_LEATHER : 2,
        SCALE_MAIL  : 3,
        CHAIN_MAIL	: 4,
        SPLINT_MAIL	: 5,
        BANDED_MAIL	: 6,
        PLATE_MAIL	: 7,
        MAXARMORS   : 8,
        /*
        * Ring types
        */
        R_PROTECT	: 0,
        R_ADDSTR	: 1,
        R_SUSTSTR	: 2,
        R_SEARCH	: 3,
        R_SEEINVIS  : 4,
        R_NOP		: 5,
        R_AGGR	    : 6,
        R_ADDHIT	: 7,
        R_ADDDAM	: 8,
        R_REGEN	    : 9,
        R_DIGEST	: 10,
        R_TELEPORT  : 11,
        R_STEALTH	: 12,
        R_SUSTARM	: 13,
        MAXRINGS	: 14,
        /*
        * Rod/Wand/Staff types
        */
        WS_LIGHT	: 0,
        WS_INVIS	: 1,
        WS_ELECT	: 2,
        WS_FIRE 	: 3,
        WS_COLD 	: 4,
        WS_POLYMORPH  : 5,
        WS_MISSILE  : 6,
        WS_HASTE_M  : 7,
        WS_SLOW_M   : 8,
        WS_DRAIN    : 9,
        WS_NOP      : 10,
        WS_TELAWAY  : 11,
        WS_TELTO    : 12,
        WS_CANCEL   : 13,
        MAXSTICKS   : 14,
        /*
        * Rod/Wand/Staff types
        */
        MAXDAEMONS  : 20,
        /*
         * extern
         */
        MAXSTR  :1024,	/* maximum length of strings */
        MAXLINES:  32,	/* maximum number of screen lines used */
        MAXCOLS	:  80,	/* maximum number of screen columns used */
        /*
         * new_level
         */
        TREAS_ROOM:20,	/* one chance in TREAS_ROOM for a treasure room */
        MAXTREAS  :10,	/* maximum number of treasures in a treasure room */
        MINTREAS  :2,	/* minimum number of treasures in a treasure room */

        //rooms
        GOLDGRP: 1,

        //daemon
        EMPTY: 0,
        DAEMON: -1,

        //RN      : (((seed = seed*11109+13849) >> 16) & 0xffff)
        //#define CTRL(c)		(c & 037)

        //thing Location
        //L_FREE : 0,
        //L_MLIST: 1,
        //L_LEVEL: 2,
        //L_PACK : 3,

    }
    return d;
}