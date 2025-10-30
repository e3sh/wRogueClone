/**
 * **目的:** アイテムの定義、生成、特性、インベントリ表示名を管理します。 
 * **責務**: 全てのアイテム（防具、ポーション、指輪、巻物、武器、杖/ワンドなど）の静的な定義、
 * オブジェクトの生成、識別状態、表示名、および関連する操作（識別、呪い解除）を管理します。
 */
/**
 * 
 * @param {GameManager} r GameManagerインスタンス 
 */
function ItemManager(r){

    const d = r.define;
    const v = r.globalValiable;
    const t = r.types;

    /*
    **カプセル化するグローバル変数（例）:**
    *   `obj_info` 系の配列 (`arm_info[]`, `pot_info[]`, `ring_info[]`, `scr_info[]`, `weap_info[]`, `ws_info[]`)。
    *   `things[]` (ランダムなアイテム選択用リスト)。
    *   `a_class[]` (防具の基本防御力)。
    *   `p_colors[]`, `s_names[]`, `r_stones[]`, `ws_made[]`, `ws_type[]` (アイテムのランダムな名前・色・素材)。
    *   `inv_describe` (インベントリ表示の詳細度)。
    *   `group` (武器のグループ)。
    * **カプセル化する変数**: `obj_info`関連の配列 (`arm_info[]`, `pot_info[]`, `scr_info[]`, `ring_info[]`, 
    * `weap_info[]`, `ws_info[]`), `things[]` (ランダムアイテム選択リスト), `a_class[]` (防具の基本防御力), 
    * `p_colors[]`, `s_names[]`, `r_stones[]`, `ws_made[]`, `ws_type[]` (アイテムの名前・色・素材), 
    * `inv_describe` (インベントリ表示の詳細度), `group` (武器のグループ) など。
    */
    let total = 0;

    let things    = v.things;   //(ランダムアイテム選択リスト)
    let arm_info  = v.arm_info; 
    let pot_info  = v.pot_info;
    let ring_info = v.ring_info;
    let scr_info  = v.scr_info;
    let weap_info = v.weap_info;
    let ws_info   = v.ws_info;

    const a_class = [		/* Armor class for each armor type */
        8,	/* LEATHER */
        7,	/* RING_MAIL */
        7,	/* STUDDED_LEATHER */
        6,	/* SCALE_MAIL */
        5,	/* CHAIN_MAIL */
        4,	/* SPLINT_MAIL */
        4,	/* BANDED_MAIL */
        3,	/* PLATE_MAIL */
    ];
    this.a_class = a_class;

    let inv_describe = true;		/* Say which way items are being used */

    let p_colors = Array(d.MAXPOTIONS);		/* Colors of the potions */
    let r_stones = Array(d.MAXRINGS);		/* Stone settings of the rings */
    let s_names  = Array(d.MAXSCROLLS);		/* Names of the scrolls */
    let ws_made  = Array(d.MAXSTICKS);		/* What sticks are made of */
    let ws_type  = Array(d.MAXSTICKS);		/* Is it a wand or a staff */

    let group = 2;

    const rainbow = v.rainbow;
    const sylls = v.sylls;
    const stones  = v.stones;
    const wood  = v.wood;
    const metal = v.metal;

    this.rings = new rings(r);
    this.things = new thingsf(r);
    this.sticks = new sticks(r);
    this.potions = new potions(r);
    this.weapon = new weapons(r);
    this.armor = new armor(r);
    this.scroll = new scroll(r)
    this.sticks = new sticks(r);

    this.inv_name = this.things.inv_name;

    const shuffle =(ary)=>{
        //console.log(ary);
        for (let j =0; j <100; j++){ //shuffle count
            for (let i = 0; i < ary.length; i++){
                let s = r.rnd(ary.length);
                let w = ary[s];
                ary[s] = ary[i];
                ary[i] = w;
            } 
        }
        //console.log(ary);
        return ary;
    }
    /* 
    **関連する関数（提案されるメソッドの例）:**
    *   `new_item()`, `new_thing()` (アイテムオブジェクトの生成)。
    *   `init_weapon()`, `fix_stick()` (アイテムの初期設定)。
    *   `is_magic()`, `set_know()`, `call_it()`, `nameit()` (アイテムの識別・情報管理)。
    *   `inv_name()`, `charge_str()`, `ring_num()` (アイテム名の表示整形)。
    *   `get_item()`, `pick_one()` (インベントリからのアイテム選択)。
    *   `whatis()`, `identify()` (識別コマンドの処理)。
    *   `uncurse()` (呪い解除)。
    * **関連するメソッド**: `newItem()`, `newThing()` (アイテムオブジェクト生成), `initWeapon()`, 
    * `fixStick()` (アイテム初期化), `isMagic()`, `setKnown()`, `callItem()`, 
    * `nameItem()` (アイテム識別・情報管理), `getInventoryName()`, `getChargeString()`, 
    * `getRingNumber()` (アイテム名整形), `getItemFromPack()`, `pickOne()` (パックからアイテム選択), 
    * `whatIs()`, `identifyItem()` (識別コマンド処理), `uncurseItem()` (呪い解除) など。
    */
   /* Set up prob tables for objects init.c 全てのアイテムの出現確率の確認*/
    this.get_itemparam = function(){
        return {
            THINGS: things,
            ARM:    arm_info,  
            POD:    pot_info ,
            RING:   ring_info,
            SCROLL: scr_info ,
            WEAPON: weap_info ,
            WANDSTAFF:  ws_info,
            AC: a_class,
            P_COLOR:p_colors,
            RING_ST:r_stones,
            SC_NAME:s_names ,
            WS_MADE:ws_made ,
            WS_TYPE:ws_type ,
        }
    }

    this.init_probs = function(){
        //Sum up the probabilities for items appearing
        const sumprobs =(info, name)=>{
            let total = 0;
            for (let i in info){
                total += info[i].oi_prob;
                info[i].oi_prob = total;
            }
            if (total != 100){
                console.log(`Bad percentages for ${name} (bound = ${total}):`);
                for (let i in info){
                    console.log(`${info[i].oi_prob} ${info[i].oi_name}`);
                }
            }
        }
        sumprobs(things,   "things" );
        sumprobs(pot_info, "potions");
        sumprobs(scr_info, "scrolls");
        sumprobs(ring_info,"rings"  );
        sumprobs(ws_info,  "sticks" );
        sumprobs(weap_info,"weapons");
        sumprobs(arm_info, "armor"  );

    };
    /* Set up names of scrolls スクロールの名前をランダムに生成します。*/
    this.init_names = function(){

        const MAXNAME = 40; /* Max number of characters in a name */       
        let nsyl;
        let sp;
        let nwords;
        //s_names = [];
        for (let i = 0; i < d.MAXSCROLLS; i++)
        {
            let prbuf = "";
            nwords = r.rnd(3) + 2;
            while (nwords--)
            {
                nsyl = r.rnd(3) + 1;
                while (nsyl--)
                {
                    sp = sylls[r.rnd(sylls.length)];
                    if (prbuf.length + sp.length < MAXNAME) prbuf += sp + " ";
                }
            }
            s_names[i] = prbuf;
        }
        //for (let i in s_names) console.log(s_names[i]);
    };
    /* Set up colors of potions ポーションの色をランダムに初期化します。*/
    this.init_colors = function(){
        let colnum = [];

        for (let i = 0; i < rainbow.length; i++){
            colnum[i] = i;
        } 
        colnum = shuffle(colnum);

        for (let i = 0; i < d.MAXPOTIONS; i++)
        {
            p_colors[i] = rainbow[colnum[i]];
            //console.log(p_colors[i]);
        }
    };
	/* Set up stone settings of rings リングの石の設定をランダムに初期化し、その価値に影響を与えます。*/
    this.init_stones = function(){
        let stype =[];

        for (let i = 0; i < stones.length; i++) stype[i] = i;

        stype = shuffle(stype);

        for (let i = 0; i < d.MAXRINGS; i++)
        {
            r_stones[i] = stones[stype[i]].name;
            ring_info[i].oi_worth += stones[stype[i]].value;
            //console.log(`${r_stones[i]} ${ring_info[i].oi_worth}`);
        }
    };
    /* Set up materials of wands ワンドとスタッフの素材をランダムに初期化します。*/
    this.init_materials = function(){
        let str;
        let metnum = [];//[cNMETAL];
        let woodnum = [];

        for (let i = 0; i < wood.length; i++)
            woodnum[i] = i;
        for (let i = 0; i < metal.length; i++)
            metnum[i] = i;

        woodnum = shuffle(woodnum);
        metnum = shuffle(metnum);

        for (let i = 0; i < d.MAXSTICKS; i++)
        {
            if (r.rnd(2) == 0)
            {
                ws_type[i] = "wand";
                str = metal[metnum[i]];
            }
            else
            {
                ws_type[i] = "staff";
                str = wood[woodnum[i]];
            }
            ws_made[i] = str;
            //console.log(ws_made[i]);
        }
    };
    /*
    * new_item
    *	Get a new item with a specified size
    * alias: GmaeManager.new_item()
    */
    this.new_item = function(){
        return r.new_item();
    }
    /*
    * init_weapon:
    *	Set up the initial goodies for a weapon
    */
    this.init_weapon = function(weap, which)
    {
        let iwp;

        weap.o_type = d.WEAPON;
        weap.o_which = which;
        iwp = v.init_dam[which];
        weap.o_damage   = iwp.iw_dam;
        weap.o_hurldmg  = iwp.iw_hrl
        weap.o_launch   = iwp.iw_launch;
        weap.o_flags    = iwp.iw_flags;
        weap.o_hplus = 0;
        weap.o_dplus = 0;
        if (which == d.DAGGER)
        {
            weap.o_count = r.rnd(4) + 2;
            weap.o_group = group++;
        }
        else if (weap.o_flags & d.ISMANY)
        {
            weap.o_count = r.rnd(8) + 8;
            weap.o_group = group++;
        }
        else
        {
            weap.o_count = 1;
            weap.o_group = 0;
        }
    }
    /*
    * new_thing:
    *	Return a new thing
    */
    //THING *
    this.new_thing = function()
    {
        //let cur; //THING
        let wr;

        const cur = this.new_item();
        cur.o_hplus = 0;
        cur.o_dplus = 0;
        cur.o_damage = "0x0";
        cur.o_hurldmg = "0x0";
        cur.o_arm = 11;
        cur.o_count = 1;
        cur.o_group = 0;
        cur.o_flags = 0;
        cur.o_pos = {x:0, y:0};
        /*
        * Decide what kind of object it will be
        * If we haven't had food for a while, let it be food.
        */

        let cn = ((r.dungeon.no_food > 3 )? 2 : this.pick_one(things, d.NUMTHINGS));
        switch (Number(cn))//(r.dungeon.no_food > 3 )? 2 : this.pick_one(things, d.NUMTHINGS))
        {
        case 0:
            cur.o_type = d.POTION;
            cur.o_which = this.pick_one(pot_info, d.MAXPOTIONS);
            break;
        case 1:
            cur.o_type = d.SCROLL;
            cur.o_which = this.pick_one(scr_info, d.MAXSCROLLS);
            break;
        case 2:
            cur.o_type = d.FOOD;
            r.dungeon.no_food = 0;
            if (r.rnd(10) != 0)
                cur.o_which = 0;
            else
                cur.o_which = 1;
            break;
        case 3:
            this.init_weapon(cur, this.pick_one(weap_info, d.MAXWEAPONS));
            if ((wr = r.rnd(100)) < 10)
            {
                cur.o_flags |= d.ISCURSED;
                cur.o_hplus -= r.rnd(3) + 1;
            }
            else if (r < 15)
              cur.o_hplus += rnd(3) + 1;
            break;
        case 4:
            cur.o_type = d.ARMOR;
            cur.o_which = this.pick_one(arm_info, d.MAXARMORS);
            cur.o_arm = a_class[cur.o_which];
            if ((wr = r.rnd(100)) < 20)
            {
                cur.o_flags |= d.ISCURSED;
                cur.o_arm += r.rnd(3) + 1;
            }
            else if (r < 28)
                cur.o_arm -= r.rnd(3) + 1;
            break;
        case 5:
            cur.o_type = d.RING;
            cur.o_which = this.pick_one(ring_info, d.MAXRINGS);
            switch (cur.o_which)
            {
            case d.R_ADDSTR:
            case d.R_PROTECT:
            case d.R_ADDHIT:
            case d.R_ADDDAM:
                if ((cur.o_arm = r.rnd(3)) == 0)
                {
                    cur.o_arm = -1;
                    cur.o_flags |= d.ISCURSED;
                }
               break;
            case d.R_AGGR:
            case d.R_TELEPORT:
                    cur.o_flags |= d.ISCURSED;
            }
            break;
        case 6:
            cur.o_type = d.STICK;
            cur.o_which = this.pick_one(ws_info, d.MAXSTICKS);
            this.fix_stick(cur);
            break;
        default:
            r.UI.debug("Picked a bad kind of object "+ cn);
            //wait_for(' ');
            break;
        }
        return cur;
    }
    /*
    * pick_one:
    *	Pick an item out of a list of nitems possible objects
    */
    this.pick_one = function(info, nitems)
    {
        let dice = r.rnd(100);
        let result = -1;

        for (let i in info){ 
          if (dice < info[i].oi_prob){
            result = i; 
            if (info[i].oi_name != 0) r.UI.comment(`pick_one:${info[i].oi_name}`); 
            break;
          }   
        } 
        if (result < 0)
        {
            if (r.wizard)
            {
                r.UI.debug(`bad pick_one:${dice} from ${nitems}`);
                for (let i in info)
                    r.UI.msg(`${info[i].oi_name}: ${info[i].oi_prob}`);
            }
            result = 0;
        }
        return result;//info[result];
    }
    /*
    * fix_stick:
    *	Set up a new stick
    */
    //void
    //fix_stick(THING *cur)
    this.fix_stick = function(cur)
    {
        if (ws_type[cur.o_which] == "staff") 
            cur.o_damage = "2x3";
        else
            cur.o_damage = "1x1";
        cur.o_hurldmg = "1x1";

        if (cur.o_which == d.WS_LIGHT)
            cur.o_charges = r.rnd(10) + 10
        else 
            cur.o_charges = r.rnd(5) + 3;
    }
}
