function rogueTypes(){
/*
    * Now we define the structures and types
    * 主要なデータ構造の定義です。
    * 
    */

    /*
    * Help list
    */
    this.h_list = function(ch, desc, bool){
        this.h_ch = ch;      //char
        this.h_desc = desc;    //string
        this.h_print = bool;   //boolean
    };

    /*
    * Coordinate data type
    */
    this.coord = function(){
        this.x;
        this.y;
    };

    //typedef unsigned int str_t;

    /*
    * Stuff about objects
    */
    this.obj_info = function(name, prob, worth, guess, know){
        this.oi_name = name;  //string
        this.oi_prob = prob;    //number
        this.oi_worth = worth;   //number
        this.oi_guess = guess; //string
        this.oi_know = know;   //boolean
    };

    /*
    * Room structure
    */
    this.room = function(){
        //coord r_pos;			/* Upper left corner */
        this.r_pos = {x:0, y:0};
        //coord r_max;			/* Size of room */
        this.r_max = {x:0, y:0};
        this.r_gold = {x:0, y:0};			/* Where the gold is */
        this.r_goldval;			/* How much the gold is worth */
        this.r_flags;			/* info about the room */
        this.r_nexits;			/* Number of exits */
        //coord r_exit[12];
        this.r_exit = Array(12);     	/* Where the exits are */
        this.r_exit.fill({x:0, y:0});
    };

    /*
    * Structure describing a fighting being
    */
    this.stats = function(ary){
        this.s_str = ary[0];			/* Strength */
        this.s_exp = ary[1];			/* Experience */
        this.s_lvl = ary[2];			/* level of mastery */
        this.s_arm = ary[3];			/* Armor class */
        this.s_hpt = ary[4];			/* Hit points */
        this.s_dmg = ary[5];			//string? /* String describing damage done */
        this.s_maxhp = Boolean(ary[6])?ary[6]:ary[4];	/* Max hit points */
    };
    let stats = this.stats;

    /*
    * Structure for monsters and player
    */
    this.thing = function() {

        function th(){
            //union thing *_l_next, *_l_prev;	/* Next pointer in link */
            this._t_pos = {};		/* Position */ //coord 
            this._t_turn;			/* If slowed, is it a turn to move */ //boolean
            this._t_type;			/* What it is */
            this._t_disguise;		/* What mimic looks like */
            this._t_oldch;			/* Character that was where it was */
            this._t_dest = {};		/* Where it is running to */ //coord 
            this._t_flags;			/* State word */
            this._t_stats = new stats([0,0,0,0,0,"0/0",0]);		/* Physical description */ //struct stats
            this._t_room;		/* Current room for thing */ //struct room 
            this._t_pack;		/* What the thing is carrying */ //union thing 
            this._t_reserved;
        };

        function ob(){
            //union thing *_l_next, *_l_prev;	/* Next pointer in link */
            this._o_type;			/* What kind of object it is */
            this._o_pos = {};	    /* Where it lives on the screen */ //coord
            this._o_text;			/* What it says if you read it */ //string
            this._o_launch;			/* What you need to launch it */
            this._o_packch;			/* What character it is in the pack */
            this._o_damage; // =[8];		/* Damage if used like sword */
            this._o_hurldmg; //= [8];		/* Damage if thrown */
            this._o_count;			/* count for plural objects */
            this._o_which;			/* Which object of a type it is */
            this._o_hplus;			/* Plusses to hit */
            this._o_dplus;			/* Plusses to damage */
            this._o_arm;			/* Armor protection */
            this._o_flags;			/* information about objects */
            this._o_group;			/* group number for this object */
            this._o_label;			/* Label for object */ //String
        };

        const _t = new th();
        const _o = new ob();

        this._t = _t;
        this._o = _o;

        /*
            typedef union thing THING;
        */
        this.l_next = _t._l_next
        this.l_prev = _t._l_prev
        this.t_pos  = _t._t_pos
        this.t_turn = _t._t_turn
        this.t_type = _t._t_type
        this.t_disguise = _t._t_disguise
        this.t_oldch =	_t._t_oldch
        this.t_dest  =	_t._t_dest
        this.t_flags =	_t._t_flags
        this.t_stats =	_t._t_stats
        this.t_pack  =	_t._t_pack
        this.t_room  =	_t._t_room
        this.t_reserved = _t._t_reserved
        this.o_type    = _o._o_type
        this.o_pos     = _o._o_pos
        this.o_text    = _o._o_text
        this.o_launch  = _o._o_launch
        this.o_packch  = _o._o_packch
        this.o_damage  = _o._o_damage
        this.o_hurldmg = _o._o_hurldmg
        this.o_count   = _o._o_count
        this.o_which   = _o._o_which
        this.o_hplus   = _o._o_hplus
        this.o_dplus   = _o._o_dplus
        this.o_arm     = _o._o_arm
        this.o_charges = this.o_arm
        this.o_goldval = this.o_arm
        this.o_flags   = _o._o_flags
        this.o_group   = _o._o_group
        this.o_label   = _o._o_label
    }

    /*
    * describe a place on the level map
    */
    this.PLACE = function(){ 
        this.p_ch;
        this.p_flags;
        this.p_monst; //THING
    };

    /*
    * Array containing information on all the various types of monsters
    */
    this.monster = function(name, carry, flag, stat){
        this.m_name = name;			/* What to call the monster */ //string
        this.m_carry = carry;		/* Probability of carrying something */
        this.m_flags = flag;		/* things about the monster */
        this.m_stats = stat;		/* Initial stats */ //struct stats 
    };

    this.delayed_action = function(){
        this.d_type = 0; //EMPTY
        this.func = ()=>{};
        this.d_arg;
        this.d_time;
    }

    this.STONE = function(){
        this.st_name;
        this.st_value;
    };
    /*
    * init_weapon:
    *	Set up the initial goodies for a weapon
    */
    this.init_weaps = function(dww, dwt, lw, mf){
        this.iw_dam = dww;	/* Damage when wielded */
        this.iw_hrl = dwt;	/* Damage when thrown */
        this.iw_launch = lw;	/* Launching weapon */
        this.iw_flags = mf;	/* Miscellaneous flags */
    }
    /* position matrix for maze positions */
    this.SPOT = function(){
     	this.nexits;
	    this.exits = Array(4);//coord	exits[4];
        this.exits.fill({x:0, y:0});
	    this.used;
    }
};
