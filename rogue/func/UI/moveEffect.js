//do_motion
//throw firebolt missile 
//motionanimation graphics
function moveEffect(g){

    let elist = []; //effectlist

    /**
     * タスク用
     * @param {char} aschr 表示キャラクタ
     * @param {coord} st 開始テキスト位置({x:､y:}) 
     * @param {coord} ed 終了位置
     */
    function eftask(aschr, st, ed){

        let living = true;

        let sx = st.x * 8;
        let sy = st.y * 16;

        let cw = ed.x*8 - sx;
        let ch = ed.y*16 - sy;

        let count = Math.max(Math.abs(cw), Math.abs(ch));
        
        let vx = cw / count;
        let vy = ch / count;

        this.step = function(){
            sx += vx;
            sy += vy;
            if (--count<0 ) living = false;
            return living;
        }
        this.draw = function(g){
            g.font["std"].putchr(aschr, sx, sy);            
        }
    }

    /**
     * 文字移動の中継位置表示用
     * @param {char} ch 表示キャラクタ
     * @param {coord} st 開始テキスト位置({x:､y:}) 
     * @param {coord} ed 終了位置
     */
    this.setEffect = function(ch, st, ed){

        const obj = new eftask(ch, st, ed);
        elist.push(obj)
    }

    this.step = function(){

        let nl = [];
        elist.forEach((value)=>{
            if (value.step()) nl.push(value);
        })
        elist = nl;
   }

    this.draw = function(g){
        elist.forEach((value)=>{
            value.draw(g);
        })
    }
}