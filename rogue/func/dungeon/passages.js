/*
 * Draw the connecting passages
 */
/*
 * do_passages:
 *	Draw all the passages on a level.
 * ダンジョン内の通路の生成と描画
 */
function passages_f(r, dg){
    const d = r.define;
    const t = r.types;

	const rooms = dg.rooms;
	const level = dg.level;
	const places = dg.places;
    const passages = dg.passages
	const max_level = dg.max_level;

    // レベル上の全ての通路を描画します。部屋間の連結グラフを初期化し、ランダムに部屋を選択して通路を描画し、パスウェイの番号付けを行います。
    this.do_passages = function()
    {
        let r1, r2; // = NULL; //rdes
        let i, j;
        let roomcount;

        //function struct_rdes
        //{
        //bool	conn[MAXROOMS];	rdes[0][0]	/* possible to connect to room i? */
        //bool	isconn[MAXROOMS];	/* connection been made to room i? */
        //bool	ingraph;		/* this room in graph already? */
        //};
        
        let rdes = [
        { conn:[ 0, 1, 0, 1, 0, 0, 0, 0, 0 ], isconn:[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], ingraph:0 },
        { conn:[ 1, 0, 1, 0, 1, 0, 0, 0, 0 ], isconn:[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], ingraph:0 },
        { conn:[ 0, 1, 0, 0, 0, 1, 0, 0, 0 ], isconn:[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], ingraph:0 },
        { conn:[ 1, 0, 0, 0, 1, 0, 1, 0, 0 ], isconn:[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], ingraph:0 },
        { conn:[ 0, 1, 0, 1, 0, 1, 0, 1, 0 ], isconn:[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], ingraph:0 },
        { conn:[ 0, 0, 1, 0, 1, 0, 0, 0, 1 ], isconn:[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], ingraph:0 },
        { conn:[ 0, 0, 0, 1, 0, 0, 0, 1, 0 ], isconn:[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], ingraph:0 },
        { conn:[ 0, 0, 0, 0, 1, 0, 1, 0, 1 ], isconn:[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], ingraph:0 },
        { conn:[ 0, 0, 0, 0, 0, 1, 0, 1, 0 ], isconn:[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], ingraph:0 },
        ];

        const MAXROOMS = rdes.length;
        /*
        * reinitialize room graph description
        */
        for (let i in rdes) //r1 = rdes; r1 <= &rdes[MAXROOMS-1]; r1++)
        {
            //rdes[i] = [];
            for (let j in rdes[i]) rdes[i].isconn[j] = false;   //= 0; j < MAXROOMS; j++)
            rdes[i].ingraph = false;
        }

        /*
        * starting with one room, connect it to a random adjacent room and
        * then pick a new room to start with.
        */
        roomcount = 1;
        r1 = r.rnd(MAXROOMS);
        rdes[r1].ingraph = true;
        do
        {
            /*
            * find a room to connect with
            */
            j = 0;
            for (let i = 0; i < MAXROOMS; i++){
                //console.log(`r1:${r1} i:${i} MAXROOMS:${rdes[r1].conn.length}`);
                if ((rdes[r1].conn[i] != 0) && !rdes[i].ingraph && (r.rnd(++j) == 0))
                r2 = i;
            }
            /*
            * if no adjacent rooms are outside the graph, pick a new room
            * to look from
            */
            if (j == 0)
            {
                do
                r1 = r.rnd(MAXROOMS);
                while(!rdes[r1].ingraph);
            }
            /*
            * otherwise, connect new room to the graph, and draw a tunnel
            * to it
            */
            else
            {
                rdes[r2].ingraph = true;
                i = r1; 
                j = r2;
                this.conn(i, j); //console.log(`i:${i} j:${j}`); 
                rdes[r1].isconn[j] = true;
                rdes[r2].isconn[i] = true;
                roomcount++;
                //console.log(r1 + "," + r2);
            }
        } while (roomcount < MAXROOMS);

        /*
        * attempt to add passages to the graph a random number of times so
        * that there isn't always just one unique passage through it.
        */
        for (roomcount = r.rnd(5); roomcount > 0; roomcount--)
        {
            r1 = r.rnd(MAXROOMS);	/* a random room to look from */
            /*
            * find an adjacent room not already connected
            */
            let j = 0;
            for (let i = 0; i < MAXROOMS; i++)
                if ((rdes[r1].conn[i] != 0) && !rdes[i].ingraph && (r.rnd(++j) == 0))
                r2 = i;
            /*
            * if there is one, connect it and look for the next added
            * passage
            */
            if (j != 0)
            {
                i = r1;
                j = r2;
                this.conn(i, j);
                rdes[r1].isconn[j] = true;
                rdes[r2].isconn[i] = true;
            }
        }
        this.passnum();

        //let st = "";
        //for (let i in rdes){st += (rdes[i].ingraph?"*":".")}
        //console.log(st);
    }

    /*
    * conn:
    *	Draw a corridor from a room in a certain direction.
    * 2つの部屋の間を接続する廊下を描画します。開始位置と終了位置を決定し、
    * ドアを描画し、通路を途中で曲がらせるロジックを含みます。
    */
    this.conn = function(r1, r2)
    {
        let rpf, rpt = null; //struct room
        let rmt;
        let distance = 0, turn_spot, turn_distance = 0;
        let rm;
        let direc;
        let del = {}, curr = {}, turn_delta = {}, spos= {}, epos= {}; //coord

        if (r1 < r2)
        {
            rm = r1;
            if (r1 + 1 == r2)
                direc = 'r';
            else
                direc = 'd';
            }
        else
        {
            rm = r2;
            if (r2 + 1 == r1)
                direc = 'r';
            else
                direc = 'd';
        }
        rpf = rooms[rm];
        /*
        * Set up the movement variables, in two cases:
        * first drawing one down.
        */
        if (direc == 'd')
        {
            rmt = rm + 3;				/* room # of dest */
            rpt = rooms[rmt];			/* room pointer of dest */
            del.x = 0;				/* direction of move */
            del.y = 1;
            spos.x = rpf.r_pos.x;			/* start of move */
            spos.y = rpf.r_pos.y;
            epos.x = rpt.r_pos.x;			/* end of move */
            epos.y = rpt.r_pos.y;
            if (!(rpf.r_flags & d.ISGONE))		/* if not gone pick door pos */
                do
                {
                spos.x = rpf.r_pos.x + r.rnd(rpf.r_max.x - 2) + 1;
                spos.y = rpf.r_pos.y + rpf.r_max.y - 1;
                } while ((rpf.r_flags&d.ISMAZE) && !(places[spos.y][spos.x].p_flags&d.F_PASS));
            if (!(rpt.r_flags & d.ISGONE))
                do
                {
                epos.x = rpt.r_pos.x + r.rnd(rpt.r_max.x - 2) + 1;
                } while ((rpt.r_flags&d.ISMAZE) && !(places[epos.y][epos.x].p_flags&d.F_PASS));
            distance = Math.abs(spos.y - epos.y) - 1;	/* distance to move */
            turn_delta.y = 0;			/* direction to turn */
            turn_delta.x = (spos.x < epos.x ? 1 : -1);
            turn_distance = Math.abs(spos.x - epos.x);	/* how far to turn */
        }
        else if (direc == 'r')			/* setup for moving right */
        {
            rmt = rm + 1;
            rpt = rooms[rmt];
            del.x = 1;
            del.y = 0;
            spos.x = rpf.r_pos.x;
            spos.y = rpf.r_pos.y;
            epos.x = rpt.r_pos.x;
            epos.y = rpt.r_pos.y;
            if (!(rpf.r_flags &d.ISGONE))
                do
                {
                spos.x = rpf.r_pos.x + rpf.r_max.x - 1;
                spos.y = rpf.r_pos.y + r.rnd(rpf.r_max.y - 2) + 1;
                } while ((rpf.r_flags&d.ISMAZE) && !(places[spos.y][spos.x].p_flags&d.F_PASS));
            if (!(rpt.r_flags & d.ISGONE))
                do
                {
                epos.y = rpt.r_pos.y + r.rnd(rpt.r_max.y - 2) + 1;
                } while ((rpt.r_flags&d.ISMAZE) && !(places[epos.y][epos.x].p_flags&d.F_PASS));
            distance = Math.abs(spos.x - epos.x) - 1;
            turn_delta.y = (spos.y < epos.y ? 1 : -1);
            turn_delta.x = 0;
            turn_distance = Math.abs(spos.y - epos.y);
        }
    //#ifdef MASTER
        else
            r.UI.debug("error in connection tables");
    //#endif

        turn_spot = r.rnd(distance - 1) + 1;		/* where turn starts */

        /*
        * Draw in the doors on either side of the passage or just put #'s
        * if the rooms are gone.
        */
        if (!(rpf.r_flags & d.ISGONE))
            this.door(rpf, spos);
        else
            this.putpass(spos);
        if (!(rpt.r_flags & d.ISGONE))
            this.door(rpt, epos);
        else
            this.putpass(epos);
        /*
        * Get ready to move...
        */
        curr.x = spos.x;
        curr.y = spos.y;
        while (distance > 0)
        {
            /*
            * Move to new position
            */
            curr.x += del.x;
            curr.y += del.y;
            /*
            * Check if we are at the turn place, if so do the turn
            */
            if (distance == turn_spot)
                while (turn_distance--)
                {
                this.putpass(curr);
                curr.x += turn_delta.x;
                curr.y += turn_delta.y;
                }
            /*
            * Continue digging along
            */
            this.putpass(curr);
            distance--;
        }
        curr.x += del.x;
        curr.y += del.y;
        if (!(curr.x == epos.x && curr.y == epos.y))
           r.UI.msg("warning, connectivity problem on this level");
    }

    /*
    * putpass:
    *	add a passage character or secret passage here
    * 通路のマスに通路文字または秘密の通路文字を配置します。
    */
    //void
    this.putpass = function(cp)//coord *cp)
    {
        let pp; //PLACE *pp;

        pp = dg.INDEX(cp.y, cp.x);
        pp.p_flags |= d.F_PASS;
        if (r.rnd(10) + 1 < level && r.rnd(40) == 0)
            pp.p_flags &= ~d.F_REAL;
        else
            pp.p_ch = d.PASSAGE;
    }

    /*
    * door:
    *	Add a door or possibly a secret door.  Also enters the door in
    *	the exits array of the room.
    * ドアまたは秘密のドアを追加し、部屋の出口配列に登録します。
    */
    //void
    this.door = function(rm, cp)//struct room *rm, coord *cp)
    {
        let pp; //PLACE pp;

        rm.r_exit[rm.r_nexits++] = cp;

        if (rm.r_flags & d.ISMAZE)
        return;

        pp = dg.INDEX(cp.y, cp.x);
        if (r.rnd(10) + 1 < level && r.rnd(5) == 0)
        {
        if (cp.y == rm.r_pos.y || cp.y == rm.r_pos.y + rm.r_max.y - 1)
            pp.p_ch = '-';
        else
            pp.p_ch = '|';
        pp.p_flags &= ~d.F_REAL;
        }
        else
        pp.p_ch = d.DOOR;
    }

    //#ifdef MASTER
    /*
    * add_pass:
    *	Add the passages to the current window (wizard command)
    * (MASTERモードのみ): 全ての通路を画面に表示します。
    */
    //void
    this.add_pass = function()
    {
        let pp; //PLACE pp;
        let y, x;
        let ch;

        for (y = 1; y < d.NUMLINES - 1; y++)
        for (x = 0; x < d.NUMCOLS; x++)
        {
            pp = dg.INDEX(y, x);
            if ((pp.p_flags & d.F_PASS) || pp.p_ch == d.DOOR ||
            (!(pp.p_flags&d.F_REAL) && (pp.p_ch == '|' || pp.p_ch == '-')))
            {
            ch = pp.p_ch;
            if (pp.p_flags & d.F_PASS)
                ch = d.PASSAGE;
            pp.p_flags |= d.F_SEEN;
            r.UI.move(y, x);
            if (pp.p_monst != null)
                pp.p_monst.t_oldch = pp.p_ch;
            else if (pp.p_flags & d.F_REAL)
                r.UI.addch(ch);
            else
            {
                //standout();反転表示
                r.UI.addch((pp.p_flags & d.F_PASS) ? d.PASSAGE : d.DOOR);
                //standend();
            }
            }
        }
    }
    //#endif

    /*
    * passnum:
    *	Assign a number to each passageway
    * 各通路に番号を割り当てます。
    */
    //static int pnum;
    //static bool newpnum;
    //void
    this.passnum = function()
    {
        let rp;//struct room *rp;
        pnum = 0;
        newpnum = false;

        /*
        * numpass:
        *	Number a passageway square and its brethren
        * パスウェイのマスとその関連するマスに番号を割り当てます（再帰的）。
        */
        const numpass =(y, x)=>{

            let fp;//char *fp;
            let rp;//struct room *rp;
            let ch;//char ch;

            if (x >= d.NUMCOLS || x < 0 || y >= d.NUMLINES || y <= 0)
                return;
            fp = places[y][x].p_flags;//dg.flat(y, x);
            if (fp & d.F_PNUM)
                return;
            if (newpnum)
            {
                pnum++;
                newpnum = false;
            }
            /*
            * check to see if it is a door or secret door, i.e., a new exit,
            * or a numerable type of place
            */
            if ((ch = dg.chat(y, x)) == d.DOOR ||
                (!(fp & d.F_REAL) && (ch == '|' || ch == '-')))
                {
                    rp = passages[pnum]; //console.log(`pnum:${pnum}/${rp.r_nexits}/l${rp.r_exit.length}`);
                    rp.r_exit[rp.r_nexits].y = y;
                    rp.r_exit[rp.r_nexits].x = x;
                }
                else if (!(fp & d.F_PASS))
                    return;
            places[y][x].p_flags |= pnum;
            /*
            * recurse on the surrounding places
            */
            numpass(y + 1, x);
            numpass(y - 1, x);
            numpass(y, x + 1);
            numpass(y, x - 1);
        }

        for (let i in passages){
            passages[i].r_nexits = 0;
        }
        for (let j in rooms){
            rp = rooms[j];
            for (let i = 0; i < rp.r_nexits; i++)
            {
                newpnum++;
                numpass(rp.r_exit[i].y, rp.r_exit[i].x);
            }
            rooms[j].r_nexits = 0;
        }
   }
}