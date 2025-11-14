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
        this.r_gold = {x:0, y:0};	/* Where the gold is */
        this.r_goldval = null;		/* How much the gold is worth */
        this.r_flags   = null;		/* info about the room */
        this.r_nexits  = null;		/* Number of exits */
        //coord r_exit[12];
        this.r_exit = Array(12);   	/* Where the exits are */
        this.r_exit.fill({x:0, y:0});
    };

    /*
    * Structure describing a fighting being
    */
    this.stats = function(ary){
        this.s_str;		/* Strength */
        this.s_exp;		/* Experience */
        this.s_lvl;		/* level of mastery */
        this.s_arm;		/* Armor class */
        this.s_hpt;		/* Hit points */
        this.s_dmg;		//string? /* String describing damage done */
        this.s_maxhp;	/* Max hit points */

        this.init =(ary)=>{
            this.s_str = ary[0];			/* Strength */
            this.s_exp = ary[1];			/* Experience */
            this.s_lvl = ary[2];			/* level of mastery */
            this.s_arm = ary[3];			/* Armor class */
            this.s_hpt = ary[4];			/* Hit points */
            this.s_dmg = ary[5];			//string? /* String describing damage done */
            this.s_maxhp = Boolean(ary[6])?ary[6]:ary[4];	/* Max hit points */
        }
        this.init(ary);
    };
    let stats = this.stats;

    /*
    * Structure for monsters and player
    * ゲーム内のすべての動的な要素を統一的に管理します。
    */
    this.thing = function() {
        //実体属性
        function th(){
            //union thing *_l_next, *_l_prev;	/* Next pointer in link */
            this._t_pos = {};		/* Position */ //coord 実体が現在いる**座標**（`coord`型）
            this._t_turn = null;	/* If slowed, is it a turn to move */
            this._t_type = null;	/* What it is */  //boolean その実体の基本的な**種別**を示す文字（例: プレイヤーは`@`、モンスターは`A`〜`Z`）。
            this._t_disguise = null;/* What mimic looks like */ //その実体の**見かけの文字**。モンスターがアイテムに擬態している場合などに使用されます。 |
            this._t_oldch = null;	/* Character that was where it was */ //実体が移動する前のマスに元々あった**マップ文字**。 
            this._t_dest = {};		/* Where it is running to */ //coord  //モンスターが追跡している**目標の座標**（`coord *`型）へのポインタ。プレイヤーの位置（`&hero`）を指すことが多いです。 |
            this._t_flags = null;	/* State word */ //実体の**状態**を示すビットマスクフラグ。`ISRUN`（走行中）、`ISHUH`（混乱）、`ISINVIS`（不可視）、`ISMEAN`（攻撃的）などが含まれます。 |
            //実体の**身体能力の統計値**（HP、筋力、経験値、レベル、防御力）を格納する構造体。 
            this._t_stats = new stats([0,0,0,0,0,"0x0",0]);		/* Physical description */ //struct stats
            this._t_room = null;    /* Current room for thing */ //struct room //実体が現在いる**部屋**（`struct room`）へのポインタ。
            this._t_pack = null;    /* What the thing is carrying */ //union thing //その実体（プレイヤーまたはモンスター）が所持している**アイテムの連結リスト**（インベントリ）の先頭へのポインタ。
            this._t_reserved = null;
        };
        //オブジェクト属性
        function ob(){
            //union thing *_l_next, *_l_prev;	/* Next pointer in link */
            this._o_type = null;	/* What kind of object it is */ //アイテムの**種類**を示す文字（例: `POTION` (!)、`SCROLL` (?)、`WEAPON` ())など）
            this._o_pos = {};	    /* Where it lives on the screen */ //coord //アイテムが床に落ちている場合の**座標**。
            this._o_text = null;	/* What it says if you read it */ //string
            this._o_launch = null;	/* What you need to launch it */
            this._o_packch = null;	/* What character it is in the pack */ //プレイヤーのインベントリ内でアイテムを識別するための**文字**（'a'、'b'など）
            this._o_damage ="0x0";  // =[8];    /* Damage if used like sword */
            this._o_hurldmg ="0x0"; //= [8];    /* Damage if thrown */
            this._o_count = 0;		/* count for plural objects */ //ポーションや矢など、スタック可能なアイテムの**数量**。 
            this._o_which = null;	/* Which object of a type it is */ //アイテムの`o_type`内における**具体的な種類**を示す番号（例: どの種類のポーションか、どの種類の武器か）
            this._o_hplus = null;	/* Plusses to hit */ //武器の**命中ボーナス/ダメージボーナス**
            this._o_dplus = null;	/* Plusses to damage */
            this._o_arm   = null;	/* Armor protection */ //防具の**防御力**（アーマークラス）。杖/ワンドでは**チャージ数**（`o_charges`）、金貨では**価値**（`o_goldval`） としても使用されます。
            this._o_flags = null;	/* information about objects */ //アイテムの**状態**を示すフラグ。`ISCURSED`（呪い）、`ISKNOW`（既知）、`ISPROT`（保護）などが含まれます。
            this._o_group = null;	/* group number for this object */
            this._o_label = null;	/* Label for object */ //String //プレイヤーが`call`コマンドで未識別アイテムに付けた**推測名**
        };

        //const _t = new th();
        //const _o = new ob();

        //this._t = _t;
        //this._o = _o;

        this.enable = true;
        this.id = -1;
        this.location = 0;  //FREE:0, MLIST, LVLOBJ, PACKP, PACKM

        const reset = ()=>{
            let _t = new th();
            let _o = new ob();

            this._t = _t;
            this._o = _o;
            /*
                typedef union thing THING;
            */
            this.l_next = _t._l_next;    
            this.l_prev = _t._l_prev;
            this.t_pos  = _t._t_pos  ;     
            this.t_turn = _t._t_turn;
            this.t_type = _t._t_type;
            this.t_disguise = _t._t_disguise;
            this.t_oldch =	_t._t_oldch;
            this.t_dest  =	_t._t_dest;
            this.t_flags =	_t._t_flags;
            this.t_stats =	_t._t_stats;
            this.t_pack  =	_t._t_pack;
            this.t_room  =	_t._t_room;
            this.t_reserved = _t._t_reserved;
            this.o_type    = _o._o_type;
            this.o_pos     = _o._o_pos;
            this.o_text    = _o._o_text;
            this.o_launch  = _o._o_launch;
            this.o_packch  = _o._o_packch;
            this.o_damage  = _o._o_damage;
            this.o_hurldmg = _o._o_hurldmg;
            this.o_count   = _o._o_count;
            this.o_which   = _o._o_which;
            this.o_hplus   = _o._o_hplus;
            this.o_dplus   = _o._o_dplus;
            this.o_arm     = _o._o_arm; // share paramater
            this.o_charges = _o._o_arm; //
            this.o_goldval = _o._o_arm; //
            this.o_flags   = _o._o_flags;
            this.o_group   = _o._o_group;
            this.o_label   = _o._o_label;
        }
        this.reset = reset;
        reset();
    }

    /*
    * describe a place on the level map
    */
    this.PLACE = function(){ 
        this.p_ch = null;
        this.p_flags = null;
        this.p_monst = null; //THING
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
        this.d_arg = null;
        this.d_time = null;
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

    /*
    * Score file structure
    */
    this.SCORE = function(){
        this.sc_uid;    //unsigned int sc_uid;
        this.sc_score;  //int sc_score;
        this.sc_flags;  //unsigned int sc_flags;
        this.sc_monster;//unsigned short sc_monster;
        this.sc_name    //char sc_name[MAXSTR];
        this.sc_level;  //int sc_level;
        this.sc_time;   //unsigned int sc_time;
    };

};
