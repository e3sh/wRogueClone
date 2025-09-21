/**
 * **目的:** ダンジョン全体の構造、部屋、通路、レベル上のアイテムとモンスターリストを管理します。
 * **責務**: ダンジョン全体の構造（部屋、通路）、マップ上のアイテムやモンスターのリスト、
 * 階段の配置、および地形の判定に関する全てを管理します。
 */
/**
 * 
 * @param {GameManager} r GameManagerインスタンス 
 */
function DungeonMap(r){
    
    const d = r.define;
    const t = r.types;
    /*
    **カプセル化するグローバル変数（例）:**
    *   `level` (ゲーム全体の階層、プレイヤーの現在地を示すため `PlayerCharacter` とも関連するが、マップ生成のコンテキストでは `DungeonMap` の状態)。
    *   `max_level`。
    *   `rooms[]`, `passages[]` (部屋と通路のデータ)。
    *   `places[][]` (`chat`, `flat`, `moat` の基底となるマップグリッドデータ)。
    *   `stairs` (階段の座標)。
    *   `lvl_obj` (レベル上のオブジェクトの連結リスト)。
    *   `mlist` (レベル上のモンスターの連結リスト)。
    * **カプセル化する変数**: `level` (現在の階層), `max_level` (到達最大階層), `rooms[]` (部屋データ), 
    * `passages[]` (通路データ), `places[][]` (マップグリッドデータ), `stairs` (階段の座標), 
    * `lvl_obj` (レベル上のアイテムリスト), `mlist` (レベル上のモンスターリスト) など。
    */
    let level = 1;				/* What level she is on */
    let max_level;				/* Deepest player has gone */
    let rooms    = []          /* One for each room -- A level */
    for (let i = 0; i< d.MAXROOMS; i++){
        rooms[i] = new t.room();//Array[d.MAXCOLS];
    }

    let passages = [];    /* One for each passage */
    for (let i = 0; i< d.MAXPASS; i++){
        passages[i] = new t.room();//Array[d.MAXCOLS];
    }

    let places   = [];         /* level map */
    for (let i = 0; i< d.MAXLINES; i++){
        places[i] = [];//Array[d.MAXCOLS];
        for (let j = 0; j< d.MAXCOLS; j++){
            places[i][j] = new t.PLACE();
        }
    }
 
    this.level = level;
    this.max_level = max_level;
    this.rooms = rooms;
    this.passages = passages;
    this.places = places;
    
    let stairs = {x:0, y:0};     //coord stairs;	/* Location of staircase */
    let lvl_obj = null;			/* List of objects on this level */
    let mlist = null;			/* List of monsters on the level */

    this.lvl_obj = lvl_obj; //PlayerCharacterから参照
    this.mlist = mlist; //PlayerCharacter, MonsterManagerから参照

    let ntraps;				/* Number of traps on this level */
    let seenstairs;			/* Have seen the stairs (for lsd)  (階段目撃フラグ)*/
    let no_food = 0;		/* Number of levels without food */

    this.no_food = no_food;

    this.roomf = new rooms_f(r, this);
    this.passf = new passages_f(r, this);

    /* 
    **関連する関数（提案されるメソッドの例）:**
    *   `new_level()`, `do_rooms()`, `do_passages()` (レベル生成)。
    *   `put_things()`, `treas_room()` (アイテム配置)。
    *   `add_monster()`, `remove_monster()` (モンスターリスト操作)。
    *   `find_obj()`, `moat()` (マップ上のエンティティ検索)。
    *   `roomin()`, `diag_ok()`, `step_ok()` (地形判定)。
    *   `door_open()`, `erase_lamp()` (部屋の視界管理)。
    * **関連するメソッド**: `newLevel()` (新規レベル生成), `doRooms()` (部屋の生成), `doPassages()` (通路の生成), 
    * `putThings()` (アイテム配置), `treasRoom()` (宝部屋生成), `findFloor()` (床の場所を探す), 
    * `findObj()` (座標のオブジェクトを探す), `getMonsterAt()` (`moat()`マクロに対応), 
    * `getCharAt()` (`chat()`マクロに対応), `getFlagsAt()` (`flat()`マクロに対応), `roomIn()`, 
    * `diagOk()`, `stepOk()`, `doorOpen()`, `eraseLamp()` など。
    */
    this.INDEX  = (y,x)=> {return (places[y][x]) };
    this.chat   = (y,x)=> {return (places[y][x].p_ch) }; //(y, x)座標のマップ文字
    this.flat   = (y,x)=> {return (places[y][x].p_flags)}; //(y, x)座標のフラグ
    this.moat   = (y,x)=> {return (places[y][x].p_monst)}; //(y, x)座標のモンスターポインタ
    this.winat  = (y,x)=> {return (this.moat(y,x) != null ? this.moat(y,x).t_disguise : this.chat(y,x))};

    const isupper =(ch)=> { return ch === ch.toUpperCase() && ch !== ch.toLowerCase(); }
    const on = (thing,flag)=>{return ((thing.t_flags & flag) != 0)};

    // 新しいダンジョンレベルを生成し、初期化します。前のレベルの情報をクリアし、部屋と通路を生成し、アイテムと罠、階段を配置し、プレイヤーを配置します。
    this.new_level = function(){
        //return;
        //THING *
        let tp;
        //PLACE
        let pp;
        let sp;
        //let i;
        const player = r.player.player;
        let hero   = player.t_pos;

        player.t_flags &= ~d.ISHELD;	/* unhold when you go down just in case */
        if (level > max_level)
            max_level = level;
        /*
        * Clean things off from last level
        */
        for (let i in places)//; pp < places[MAXCOLS*MAXLINES]; pp++)
        {
            //pp = places[i];
            for (let j in places[i]){
                pp = places[i][j];
                pp.p_ch = ' ';
                pp.p_flags = d.F_REAL;
                pp.p_monst = null;
            }
        }
        r.UI.clear();
        /*
        * Free up the monsters on the last level
        */
        //for (tp = mlist; tp != NULL; tp = next(tp))
        //free_list(tp->t_pack);
        //free_list(mlist);
        mlist = [];
        /*
        * Throw away stuff left on the previous level (if anything)
        */
        r.free_list(lvl_obj);
        this.roomf.do_rooms();				/* Draw rooms */
        this.passf.do_passages();			/* Draw passages */
        no_food++;
        this.put_things();			/* Place objects (if any) */
        /*
        * Place the traps
        */
        if (r.rnd(10) < level)
        {
            ntraps = r.rnd(level / 4) + 1;
            if (ntraps > d.MAXTRAPS)
                ntraps = d.MAXTRAPS;
            i = ntraps;
            while (i--)
            {
                /*
                * not only wouldn't it be NICE to have traps in mazes
                * (not that we care about being nice), since the trap
                * number is stored where the passage number is, we
                * can't actually do it.
                */
                do
                {
                    this.roomf.find_floor(null, stairs, false, false);
                } while (this.chat(stairs.y, stairs.x) != d.FLOOR);
                sp = this.flat(stairs.y, stairs.x);
                sp &= ~d.F_REAL;
                sp |= r.rnd(d.NTRAPS);
            }
        }
        /*
        * Place the staircase down.
        */
        this.roomf.find_floor(null, stairs, false, false);
        places[stairs.y][stairs.x].p_ch = d.STAIRS;
        //this.chat(stairs.y, stairs.x) = d.STAIRS;
        seenstairs = false;

        for (tp = mlist; Boolean(tp); tp = tp.l_next)
            if (Boolean(tp.t_pos))
                tp.t_room = this.roomin(tp.t_pos);

        this.roomf.find_floor(null, hero, false, false);
        r.player.enter_room(hero); //hero = {x:0, y:0};
        r.UI.mvaddch(hero.y, hero.x, d.PLAYER);
        if (on(player, d.SEEMONST))
            this.turn_see(false); 
        if (on(player, d.ISHALU))
            r.player.visuals();

        if (level == 1) {
            r.UI.move(0, 0);
            r.UI.printw(`Welcome ${whoami}`);
        }
        r.UI.comment("new_level");
    }

    /*
    * find_obj:
    *	Find the unclaimed object at y, x
    * 特定の座標にある未請求のオブジェクトを見つけます。
    */
    this.find_obj = function(y, x){
        let obj;

        for (obj = lvl_obj; Boolean(obj); obj = obj.l_next)
        {
            if (obj.o_pos.y == y && obj.o_pos.x == x)
                return obj;
        }
        //sprintf(prbuf, "Non-object %d,%d", y, x);
        r.UI.msg(prbuf);
        return null;
    }
    /*
     * put_things:
     *	Put potions and scrolls on this level
     * ポーションやスクロールなどのアイテムをレベル上に配置します。Amulet of Yendorの配置も含まれます。
     */
    this.put_things = function(){

        const amulet = r.player.amulet;
        
        let obj; //THING 
        /*
        * Once you have found the amulet, the only way to get new stuff is
        * go down into the dungeon.
        */
        if (amulet && level < max_level)
            return;
        /*
        * check for treasure rooms, and if so, put it in.
        */
        if (r.rnd(d.TREAS_ROOM) == 0)
            this.treas_room();
        /*
        * Do MAXOBJ attempts to put things on a level
        */
        for (let i = 0; i < d.MAXOBJ; i++)
        if (r.rnd(100) < 36)
        {
            /*
            * Pick a new object and link it in the list
            */
            obj = r.item.new_thing(); //things.c
            r.attach(lvl_obj, obj);
            /*
            * Put it somewhere
            */
            this.roomf.find_floor(null, obj.o_pos, false, false);
            places[obj.o_pos.y][obj.o_pos.x].p_ch = obj.o_type;
        }
        /*
        * If he is really deep in the dungeon and he hasn't found the
        * amulet yet, put it somewhere on the ground
        */
        if (level >= d.AMULETLEVEL && !amulet)
        {
            obj = r.new_item();
            r.attach(lvl_obj, obj);
            obj.o_hplus = 0;
            obj.o_dplus = 0;
            obj.o_damage = "0x0";
            obj.o_hurldmg = "0x0";
            obj.o_arm = 11;
            obj.o_type = d.AMULET;
            /*
            * Put it somewhere
            */
            this.roomf.find_floor(null, obj.o_pos, false, false);
            places[obj.o_pos.y][obj.o_pos.x].p_ch = d.AMULET;
        }
        r.UI.comment("put_things");
    }
    /*
    * roomin:
    *	Find what room some coordinates are in. NULL means they aren't
    *	in any room.
    * 特定の座標がどの部屋または通路にあるかを判定します。
    */
    this.roomin = function(cp){
        let rp; //register struct room *rp;
        let fp; //register char *fp;

        fp = places[cp.y][cp.x].p_flags;
        if (fp & d.F_PASS)
            return passages[fp & d.F_PNUM];

        for (let i in rooms){
            rp = rooms[i];
            if (cp.x <= rp.r_pos.x + rp.r_max.x && rp.r_pos.x <= cp.x
                && cp.y <= rp.r_pos.y + rp.r_max.y && rp.r_pos.y <= cp.y)
                return rp;
        }
        r.UI.msg(`in some bizarre place (x:${cp.x},y:${cp.y})`);
        //abort();
        return null;

        r.UI.comment("roomin");
    }

    /* rnd_room:
    *	Pick a room that is really there
    * 実在するランダムな部屋を選択します。
    */
    this.rnd_room = function(){
        let rm;
        do
        {
            rm = r.rnd(d.MAXROOMS);
        } while (rooms[rm].r_flags & d.ISGONE);
        return rm;
    }
    /*
    * treas_room:
    *	Add a treasure room
    * 宝部屋を追加します
    */
    this.treas_room = function(){
        //const MAXTRIES = 10; /* max number of tries to put down a monster */

        let nm;
        let tp; //THING *tp;
        let rp; //struct room *rp;
        let spots, num_monst;
        let mp = {}; //static coord mp;

        rp = rooms[this.rnd_room()];
        spots = (rp.r_max.y - 2) * (rp.r_max.x - 2) - d.MINTREAS;
        if (spots > (d.MAXTREAS - d.MINTREAS))
        spots = (d.MAXTREAS - d.MINTREAS);
        num_monst = nm = r.rnd(spots) + d.MINTREAS;
        while (nm--)
        {
           this.roomf.find_floor(rp, mp, 2 * d.MAXTRIES, false);
            tp = r.item.new_thing();
            tp.o_pos = mp;
            r.attach(lvl_obj, tp);
            //chat(mp.y, mp.x) = tp.o_type;
            places[mp.y][mp.x].p_ch = tp.o_type; 
        }

        /*
        * fill up room with monsters from the next level down
        */
        if ((nm = r.rnd(spots) + d.MINTREAS) < num_monst + 2)
            nm = num_monst + 2;
        spots = (rp.r_max.y - 2) * (rp.r_max.x - 2);
        if (nm > spots)
            nm = spots;
        level++;
        while (nm--)
        {
            spots = 0;
            if (this.roomf.find_floor(rp, mp, d.MAXTRIES, true))
            {
                tp = r.item.new_item();
                r.monster.new_monster(tp, r.monster.randmonster(false), mp);
                tp.t_flags |= d.ISMEAN;	/* no sloughers in THIS room */
                r.monster.give_pack(tp);
            }
        }
        level--;

        r.UI.comment("treas_room");
    }

    /*
    * step_ok:
    *	Returns true if it is ok to step on ch
    * 指定された文字が移動可能な地形であるかを判定します。
    */
    this.step_ok = function(ch)
    {
        switch (ch)
        {
        case ' ':
        case '|':
        case '-':
            return false;
        default:
            return (!( /^[a-zA-Z]+$/.test(ch) ));
        }
    }

    //debug
    this.placesCheck = function(){

        vstr = [] 

        for (let i = 0; i< d.MAXLINES; i++){
            let ws = "";
            for (let j = 0; j< d.MAXCOLS; j++){
                //if (places[i][j].p_flags & !=0) ws+="?";
                ws += places[i][j].p_ch;
            }
            vstr[i] = ws;
        }
        return vstr;
    }

    /*
    * show_map:
    *	Print out the map for the wizard
    */
    this.show_map = function()
    {
        let y, x, real;

        r.UI.clear();
        for (y = 1; y < d.NUMLINES - 1; y++)
        for (x = 0; x < d.NUMCOLS; x++)
        {
            real = this.flat(y, x);
            if (!(real & d.F_REAL))
            r.UI.move(y, x);
            r.UI.addch(this.chat(y, x));
        }
        r.UI.msg("---More (level map)---");
    }

}
