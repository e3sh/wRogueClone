/**
 * **目的:** ゲーム全体の初期化、進行ループ、セーブ/ロード、スコアリング、オプション設定など、
 * ゲーム全体の高レベルな管理を行います。他のクラスのインスタンスを保持し、それらの連携を調整します。 
 * **責務**: ゲーム全体のライフサイクル（初期化、メインループ、終了）、セーブ/ロード、スコアリング、
 * および高レベルのオプション設定を管理し、他のクラスの連携を調整します。他のクラスのインスタンスを保持し、
 * それらのメソッドを呼び出してゲームフローを制御します。
 */
/**
 * 
 * @param {GameCore} g GameCoreインスタンス
 */
function GameManager(g){

    /* 
     * #define: 各種定数（MAXROOMS, MAXTHINGS, AMULETLEVELなど）、
     * マクロ（when, otherwise, until, next, prev, winat, ce, hero, pstats, 
     * pack, proom, max_hp, attach, detach, free_list, max, on, GOLDCALC, 
     * ISRING, ISWEARING, ISMULT, INDEX, chat, flat, moat, unc, debug）を定義します。
    */
    const d = rogueDefines(); //return define{}
    const f = {}; //new rogueFuncs();
    const v = {}; //new rogueGlobals();
    const t = new rogueTypes();

    this.define = d;
    this.func   = f;
    this.globalValiable = v;
    this.types  = t;
    
    globalVariableInit(this);

    this.player =  new PlayerCharacter(this); 
    this.dungeon = new DungeonMap(this);
    this.monster = new MonsterManager(this);
    this.item   =  new ItemManager(this);
    this.daemon =  new DaemonScheduler(this);
    this.UI     =  new UIManager(this, g);
    this.system =  new SystemAdapter(this)
    this.debug  =  new debug(this, g);

    //this.player.packf = new packf(this);
    //this.player.misc =  new miscf(this);

    /*
    **カプセル化するグローバル変数（例）:**
    *   `dnum`, `seed` (乱数シード)。
    *   `file_name`, `home` (ファイルパス)。
    *   `noscore`, `playing`, `q_comm` (ゲームの状態フラグ)。
    *   `after`, `again`, `running`, `door_stop`, `firstmove`, `jump`, `passgo`, `tombstone` (ゲーム進行に関するフラグ)。
    *   `inv_type` (インベントリ表示スタイル)。
    *   `fruit` (プレイヤーの好きな果物名)。
    *   `release`, `version` (バージョン情報)。
    *   `scoreboard` (スコアファイルポインタ)。
    *   `wizard` (ウィザードモードフラグ)。
    * **カプセル化する変数**: `dnum`, `seed` (乱数シード), `file_name` (セーブファイル名), 
    * `home` (ホームディレクトリ), `noscore` (スコア記録無効フラグ), `playing` (ゲーム中フラグ), 
    * `q_comm` (終了コマンド中フラグ), `after`, `again`, `running`, `door_stop`, `firstmove`, 
    * `jump`, `passgo`, `tombstone` (ゲーム進行に関するフラグ), `inv_type` (インベントリ表示スタイル), 
    * `fruit` (好きな果物名), `release`, `version` (バージョン情報), `scoreboard` (スコアファイルポインタ), 
    * `wizard` (ウィザードモードフラグ) など。
    */
    let lowtime = g.time();//(int) time(NULL);
    let idcount = 0;

    let dnum = lowtime;// + f.md_getpid(); //ユーザーIDを取得します
    let seed = dnum;
    RN = (((seed = seed*11109+13849) >> 16) & 0xffff);

    //char file_name[MAXSTR];			/* Save file name */
    //char home[MAXSTR] = { '\0' };		/* User's home directory */

    //int  noscore;				/* Was a wizard sometime */
    let playing = true;			/* true until he quits */
    let q_comm = false;			/* Are we executing a 'Q' command? */
    let pause = false;

    let after;				/* true if we want after daemons */
    //bool again;				/* Repeating the last command */
    let running = false;			/* true if player is running  (走行中フラグ)*/
    let door_stop = false;			/* Stop running when we pass a door (ドア通過時停止フラグ)*/
    let firstmove = false;			/* First move after setting door_stop */
    let jump = false;			/* Show running as series of jumps */
    let passgo = false;			/* Follow passages */
    let tombstone = true;			/* Print out tombstone at end  (墓石表示オプション)*/

    let oldpos; /* Position before last look() call */
    let oldrp;  /* Roomin(&oldpos) */

    let fruit =	"slime-mold";		/* Favorite fruit (好きな果物名)*/

    let scoreboard = null;	/* File descriptor for score file */
    let wizard = false;			/* true if allows wizard commands */


    let thingTable = [];    /* motionObject master Talbe item/monster(thing struct) */
    
    this.mobs = thingTable;

    this.wizard = wizard;
    this.playing = playing;
    this.pause;

    this.after = after;
    this.running = running;
    this.jump = jump;

    this.oldpos = oldpos;
    this.oldrp = oldrp;

    this.passgo = passgo;

    this.rips = new rips(this);
    this.death = this.rips.death;
 
    /* 
    **関連する関数（提案されるメソッドの例）:**
    *   `main()`, `playit()` (ゲーム開始とメインループ)。
    *   `init_check()` (初期環境チェック)。
    *   `parse_opts()`, `option()` (オプション設定)。
    *   `save_game()`, `auto_save()`, `restore()` (セーブ・ロード)。
    *   `score()`, `death()`, `total_winner()` (スコアリング・ゲーム終了)。
    *   `rnd()`, `roll()` (乱数生成)。
    *   `my_exit()`, `quit()`, `leave()`, `fatal()`, `endit()` (ゲーム終了処理)。
    * **関連するメソッド**: `main()` (プログラムエントリポイント), `playGame()` (メインゲームループ), 
    * `initCheck()` (初期環境チェック), `parseOptions()` (オプション文字列解析), 
    * `showOptions()` (オプション設定UI), `saveGame()`, `autoSave()`, `restoreGame()` (セーブ・ロード), 
    * `calculateScore()`, `handleDeath()`, `handleTotalWinner()` (スコアリング・ゲーム終了), 
    * `generateRandomNumber()`, `rollDice()` (乱数生成), `exitProgram()`, `quitGame()`, 
    * `leaveGame()`, `fatalError()`, `endProgram()` など。
    */
    // roguemain
    /* check for legal startup ゲーム開始時の実行環境チェックを行います。 */
    const init_check =()=>{
        //leavepack;
        thingTable = [];
        this.mobs = thingTable;
        /*
        console.log(thingTable.length)
        for (let i in thingTable){
            let wt = thingTable[i];
            thingTable = this.discard(wt);
            console.log(i);
        }
        //this.mobs = thingTable;
        /* dummy */
    }

    this.start = function(){

        g.console[1].printw(`Hello ${this.UI.whoami} , just a moment while I dig the dungeon...`);
        init_check();
        this.UI.comment("init_check");

        this.item.init_probs();			/* Set up prob tables for objects init.c 全てのアイテムの出現確率を初期化します。*/
        this.player.init_player();			/* Set up initial player stats プレイヤーの初期ステータス、食料、初期装備（リングメイル、食料、武器など）を設定します。*/
        this.item.init_names();			/* Set up names of scrolls スクロールの名前をランダムに生成します。*/
        this.item.init_colors();			/* Set up colors of potions ポーションの色をランダムに初期化します。*/
        this.item.init_stones();			/* Set up stone settings of rings リングの石の設定をランダムに初期化し、その価値に影響を与えます。*/
        this.item.init_materials();		/* Set up materials of wands ワンドとスタッフの素材をランダムに初期化します。*/

        this.dungeon.new_level();			/* Draw current level new_level.c*/

        /*
        * Start up daemons and fuses
        */
        this.daemon.start_daemon(this.monster.runners, 0, d.AFTER);
        this.daemon.start_daemon(this.player.doctor, 0, d.AFTER);
        this.daemon.fuse(this.daemon.swander, 0, d.WANDERTIME, d.AFTER);
        this.daemon.start_daemon(this.player.stomach, 0, d.AFTER);

        //this.mapcheckTest();
        this.UI.status();

        this.UI.status();
        this.UI.setHomesub();
        this.UI.clear(3); //inventry display
        this.player.packf.inventory(this.player.player.t_pack, 0);

        this.playit(g); //ゲームのメインループです。オプションの解析とcommand()の呼び出しを行います。
    }

    this.restart = function(){

        g.console[1].printw(`Hello ${this.UI.whoami} , restart /just a moment while I dig the dungeon...`);

        init_check();
        this.player.init_player();			/* Set up initial player stats プレイヤーの初期ステータス、食料、初期装備（リングメイル、食料、武器など）を設定します。*/
        this.dungeon.new_level();			/* Draw current level new_level.c*/

        this.UI.status();
        this.UI.setHomesub();
        this.UI.clear(3); //inventry display
        this.player.packf.inventory(this.player.player.t_pack, 0);

        this.playit(g); //ゲームのメインループです。オプションの解析とcommand()の呼び出しを行います。
    }

    /*
    * playit:
    *	The main loop of the program.  Loop until the game is over,
    *	refreshing things and looking at the proper times.
    * ゲームのメインループです。オプションの解析とcommand()の呼び出しを行います。
    */
    this.playit = function(g){
        let hero = this.player.player.t_pos;

        oldpos = hero;
        this.oldpos = oldpos;

        oldrp = this.dungeon.roomin(hero);

        //g.console[1].insertln();
        //g.console[1].printw(`func playit execute. text rnd:${this.rnd(10)}.${this.mobs.length}`);


        //viewInventry
        //let st = this.player.get_invstat();
        //this.UI.clear(3);
        //for (let i in st){
        //    this.UI.submsg(st[i]);
        //}
        //this.player.packf.inventory(this.player.t_pack, 0);
    
        this.UI.comment("play_it");
    
        playing = true;
    }
    /*
    * rnd:
    *	Pick a very random number.
    * 指定された範囲でランダムな整数を返します。
    * 
    */
    this.rnd = function(range){
        return Math.floor(Math.random()*(range));
        //return (range == 0)? 0 : (Math.abs(RN) % range);
    }
    /*
    * roll:
    *	Roll a number of dice
    * 特定の数のサイコロを振り、合計値を返します。
    */
    this.roll = function(number, sides){
        let dtotal = 0;
        while (number--) {
            dtotal += this.rnd(sides)+1;
        }
        return dtotal;
    }
    //gameloop
    this.loopstep = function(g){

        if (this.playing) {
            this.UI.command();/* Command execution */
        }else{
            this.waitScene();
        }
    }

    // Functions for dealing with linked lists of goodies
    // 連結リスト操作
    /*
    * detach: takes an item out of whatever linked list it might be in
    * 連結リストから指定されたアイテムを削除
    */
    this.detach = function(list, item)
    {
        if (list == item)
            list = item.l_next;
        if (item.l_prev != null)
            item.l_prev.l_next = item.l_next;
        if (item.l_next != null)
            item.l_next.l_prev = item.l_prev;
        item.l_next = null;
        item.l_prev = null;
        //this.discard(item);
        
        this.debug.mobslist();

        return list;
    }
    /*
    * attach: add an item to the head of a list
    * 連結リストの先頭に指定されたアイテムを追加します。
    */
    this.attach = function(list, item)
    {
        if (list != null)
        {
            item.l_next = list;
            list.l_prev = item;
            item.l_prev = null;
        }
        else
        {
            item.l_next = null;
            item.l_prev = null;
        }
        list = item;

        this.debug.mobslist();

        let ln = 0;
        for (let l = list ; l != null ; l = l.l_next){
            ln++;
            if (ln > 100) break;
        }
        //this.UI.debug(`attach len:${ln}`);

        return list;
    }
    /*
    * free_list: Throw the whole blamed thing away
    * 連結リスト全体を解放します。
    */
    this.free_list = function(ptr)
    {
        while (ptr != null)
        {
            const item = ptr;
            ptr = item.l_next;
            this.discard(item);
            //item = null;
        }
        return ptr;
    }
    /*
    * discard: Free up an item
    * アイテムを解放します。
    */
    this.discard = function(item)
    {
        let table = []; 
        for (let i in this.mobs){
            if (this.mobs[i] != item){
                if (this.mobs[i].enable)
                    //this.mobs[i].id = i;
                    table.push(this.mobs[i]);
            }
        }
        if (this.mobs.length == table.length){
            this.UI.comment(`discard:nop id:${item.id} ${item.enable}`);
            item.enable = false; //解放指定したアイテムをdisableにする（Mobsの配列要素から外れているはず）
        }else{
            this.UI.comment(`discard: id${item.id} now:${table.length}`);
        }
        //console.log(table);
        this.mobs = table;

        this.debug.mobslist();
    }
    /*
    * new_item: Get a new item with a specified size
    * 新しいアイテムを確保します。
    * (thingゲームオブジェクトをリストに追加)
    */
    this.new_item = function()
    {
        let item;
        item = new t.thing();
        item.l_next = null;
        item.l_prev = null;
        item.id = idcount++;// this.mobs.length;

        this.mobs.push(item);

        this.debug.mobslist();

        return item;
    }
    /*
    * rnd_thing:
    *	Pick a random thing appropriate for this level
    */
    //char
    this.rnd_thing = function()
    {
        let i; //int i;
        //static char thing_list[] = {
        const thing_list = [
            d.POTION, d.SCROLL, d.RING, d.STICK, d.FOOD, 
            d.WEAPON, d.ARMOR, d.STAIRS, d.GOLD, d.AMULET
        ];

        if (this.dungeon.level >= d.AMULETLEVEL)
            i = this.rnd(thing_list.length + 1);
        else
            i = this.rnd(thing_list.length + 1);
        return thing_list[i];
    }
    /*
    * playing false:
    * menu mode
    */
    this.waitScene = function(){

        this.UI.pause("Push Space Key to next");

        //if (this.UI.wait_for("Space")){
        //    this.playing = true;
        //}
    }    
}
