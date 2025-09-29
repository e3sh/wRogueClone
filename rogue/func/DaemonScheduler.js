/**
 * **目的:** 時間経過や特定イベントで自動的にトリガーされるデーモンとヒューズを管理します。 
 * **責務**: 時間経過や特定イベントで
 * 自動的に実行される「デーモン」と「フューズ」の管理（登録、停止、実行）を一元的に行います。
 */
/**
 * 
 * @param {GameManager} r GameManagerインスタンス 
 */
function DaemonScheduler(r){
    
    const d = r.define;
    const t = r.types;
    /*
    **カプセル化するグローバル変数（例）:**
    *   `d_list[]` (delayed_action のリスト)。
    *   `between` (さまようモンスター出現間隔カウンタ)。/*
    * **カプセル化する変数**: `d_list[]` (遅延アクションリスト), `between` (さまようモンスター出現間隔カウンタ) など。
    */
    let d_list = [];//Array[d.MAXDAEMONS];
    for (let i = 0; i<d.MAXDAEMONS+1 ;i++){
        d_list.push(new t.delayed_action());
    }
    let between;

    /*
    **関連する関数（提案されるメソッドの例）:**
    *   `start_daemon()`, `kill_daemon()` (デーモン開始・停止)。
    *   `fuse()`, `lengthen()`, `extinguish()` (ヒューズ開始・延長・停止)。
    *   `do_daemons()`, `do_fuses()` (デーモン・ヒューズ実行)。
    *   `swander()`, `rollwand()` (さまようモンスター関連のデーモン関数)。
    * **関連するメソッド**: `startDaemon()`, `killDaemon()` (デーモン開始・停止), `fuseEvent()`, 
    * `lengthenFuse()`, `extinguishFuse()` (フューズ開始・延長・停止), 
    * `doDaemons()`, `doFuses()` (デーモン・フューズ実行)。
    * デーモン/フューズによって実行されるロジック
    * （`doctor()`, `stomach()`, `swander()`, `rollwand()`, `unconfuse()`, `unsee()`, 
    * `sight()`, `nohaste()`, `comeDown()`, `visuals()`, `land()`）は、
    * このクラスのプライベートメソッドとして持つか、他の関連クラスのメソッドを呼び出すように設計します。
    */
    /*
    * start_daemon:
    *	Start a daemon, takes a function.
    * デーモンを開始します。デーモンは常にアクティブに実行されます。
    */
    //void
    //start_daemon(void (*func)(), int arg, int type)
    this.start_daemon = function(func, arg, type)
    {
        let dev; //register struct delayed_action *dev;

        dev = this.d_slot();
        if (!Boolean(dev)) {r.UI.debug("daemon buffer over/d"); return;}
        dev.d_type = type;
        dev.d_func = func;
        dev.d_arg = arg;
        dev.d_time = d.DAEMON;

        r.UI.comment("start_daemon");
    }
   
   /*
    * kill_daemon:
    *	Remove a daemon from the list
    * デーモンをリストから削除します。
    */
    //void
    //kill_daemon(void (*func)())
    this.kill_daemon = function(func)
    {
        let dev; //register struct delayed_action *dev;
        dev = find_slot(func);
        if (dev == null) return;
        /*
        * Take it out of the list
        */
        dev.d_type = d.EMPTY;
    }

    /*
    * do_daemons:
    *	Run all the daemons that are active with the current flag,
    *	passing the argument to the function.
    * 指定されたフラグを持つすべてのアクティブなデーモンを実行します。
    */
    //void
    //do_daemons(int flag)
    this.do_daemons = function(flag)
    {
        let dev; //register struct delayed_action *dev;
        /*
        * Loop through the devil list
        */
        for (let i in d_list){
            dev = d_list[i];
            /*
            * Executing each one, giving it the proper arguments
            */
            if ((dev.d_type == flag) && (dev.d_time == d.DAEMON)){
                dev.d_func(dev.d_arg);
                //console.log(dev.d_func);
            }
        }
        //r.UI.comment("do_daemons");
    }
   
   /*
    * fuse:
    *	Start a fuse to go off in a certain number of turns
    * ヒューズを開始します。ヒューズは指定されたターン後に一度だけ発火します。
    */
    //void
    //fuse(void (*func)(), int arg, int time, int type)
    this.fuse = function(func, arg, time, type)
    {
        let wire; //register struct delayed_action *wire;

        wire = this.d_slot();
        if (!Boolean(wire)) {r.UI.debug("daemon buffer over/w"); return;}
        wire.d_type = type;
        wire.d_func = func;
        wire.d_arg  = arg;
        wire.d_time = time;

        //r.UI.comment("fuse");
    }

    /*
    * lengthen:
    *	Increase the time until a fuse goes off
    * ヒューズの時間を延長します。
    */
    //void
    //lengthen(void (*func)(), int xtime)
    this.lengthen = function(func, xtime)
    {
        let wire; //register struct delayed_action *wire;

        wire = this.find_slot(func)
        if (wire == null) return;
        wire.d_time += xtime;
    }
   
   /*
    * extinguish:
    *	Put out a fuse
    * ヒューズを消します。
    */
    //void
    //extinguish(void (*func)())
    this.extinguish = function(func)
    {
        let wire; //register struct delayed_action *wire;

        wire = this.find_slot(func)
        if (wire == null) return;
        wire.d_type = d.EMPTY;
    }
   
    /*
    * do_fuses:
    *	Decrement counters and start needed fuses
    * ヒューズのカウンタを減らし、発火したヒューズを処理します。
    */
    //void
    //do_fuses(int flag)
    this.do_fuses = function(flag)
    {
        let wire; //register struct delayed_action *wire;

        /*
        * Step though the list
        */
        for (let i in d_list){
            wire = d_list[i];
            /*
            * Decrementing counters and starting things we want.  We also need
            * to remove the fuse from the list once it has gone off.
            */
            if ((flag == wire.d_type) && (wire.d_time > 0) && (--wire.d_time == 0))
            {
                wire.d_type = d.EMPTY;
                wire.d_func(wire.d_arg);
            }
        }
        //r.UI.comment("do_fuses");
    }

    /*
    * d_slot:
    *	Find an empty slot in the daemon/fuse list
    * 空いているデーモン/ヒューズリストスロットを見つけます。
    */
    //struct delayed_action *
    this.d_slot = function()
    {
        let dev; //register struct delayed_action *dev;

        for (let i in d_list){
            dev = d_list[i]; //console.log(dev);
            if (dev.d_type == d.EMPTY) return dev;
        }
        r.UI.debug("Ran out of fuse slots");
        return null;
    }
    /*
    * find_slot:
    *	Find a particular slot in the table
    * 特定の関数に関連付けられたスロットを見つけます。
    */
    //struct delayed_action *
    this.find_slot = function(func)
    {
        let dev; //register struct delayed_action *dev;

        for (let i in d_list){
            dev = d_list[i];
            if (dev.d_type == d.EMPTY && func == dev.d_func) return dev;
        }
        return null;
    }

    //deamons 
    /*
    * Swander:
    *	Called when it is time to start rolling for wandering monsters
    * さまようモンスターを生成するデーモンを開始するヒューズです。
    */
    this.swander = function()
    {
        r.daemon.start_daemon(r.daemon.rollwand, 0, d.BEFORE);
    }

    /*
    * rollwand:
    *	Called to roll to see if a wandering monster starts up
    * さまようモンスターが出現するかどうかを判定する関数です。
    */
    this.rollwand = function()
    {

        if ((between++) >= 4)
        {
        if (r.roll(1, 6) == 4)
            {
                r.monster.wanderer();
                this.kill_daemon(this.rollwand);
                this.fuse(this.swander, 0, d.WANDERTIME, d.BEFORE);
            }
            between = 0;
        }
    }
}
