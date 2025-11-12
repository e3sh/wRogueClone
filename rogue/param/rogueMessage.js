/*
*　rogue messages en
*/
function rogueMessages(lang){

    if (lang == "jp"){
    const ms = {

        INITAL: "ダンジョン準備中です、少しお待ちを...",
        WELCOME: `運命のダンジョンへようこそ`,
        LEVIT_CHECK: "無理だよ。地面から浮いてるんだから！",
        PACK_ADD: (name)=>{return `${name} を手に入れた`},
        PACK_MONEY: (value)=>{return `${value} gold 拾った`},
        
        ADDPACK: "巻物は手に取ると塵と化した",
        PACKROOM: "バックには空きがありません",
        //fight
        H_NAMES: [		/* strings for hitting */
            " 見事な一撃を放った",
            " ヒット ",
            " 傷を与えた ",
            " 振ってヒット ",
            " 見事な一撃を放った ",
            " ヒット ",
            " 傷を与えた ",
            " 振ってヒット "
	    ],
        M_NAMES: [		/* strings for missing */
            " ミス",
            " 空振り",
            " わずかに外れ",
            " 当たらない",
            " ミスした",
            " 振って外した",
            " かすめた",
            " 当たらなかった",
    	],
        KILLED: (name)=>{return `${name} を倒した `},

        FIGHT_X1: "重い！ なんて厄介な生き物だ！",
        FIGHT_X2: "待て！ あれは xeroc だ！",
        FIGHT_ROLL1: (color)=>{return `手が${color}色に輝くのをやめた`},
        FIGHT_ROLL2: (name)=>{return `${name}は混乱しているように見える`},

        ATTACK_I: (name)=>{return `${name}によって凍結された`},
        ATTACK_R1: "足に噛みつかれたような痛みを感じ、今はさらに弱っている",
        ATTACK_R2: "ひと噛みが一瞬だけあなたを弱らせる",
        ATTACK_WV: "急に体がだるくなった",
        ATTACK_L: "財布が軽くなった気がする",
        ATTACK_N: (name)=>{return `彼女は${name}を盗んだ`},

        SETMNAME: "",

        PRNAME: "あなた",

        THUNK_1: (name)=>{return `${name} 当たった`},
        THUNK_2: "当たった ",
        THUNK_3: (name)=>{return `${name}`},
        THUNK_4: "",
     
        HIT_1: (name)=>{return `${name}の攻撃`},
        HIT_2: (name)=>{return `-> ${name}`},
        HIT_3: "",

        MISS_1: (name)=>{return `${name}の攻撃`},
        MISS_2: (name)=>{return ` -> ${name}`},
        MISS_3: "",

        BOUNCE_1: (name)=>{return `${name} 外れた`},
        BOUNCE_2: "外した ",
        BOUNCE_3: "",

        //potion
        P_ACTION_1: "なんてトリッピーな感覚なんだ！",
        P_ACTION_2: "待って、ここどうなってるの？え？何？誰？",
        P_ACTION_3: "おお、すごい！  すべてが宇宙的に見える！",
        P_ACTION_4: (fruit)=>{return `このポーションは ${fruit} ジュースのような味がする`},
        P_ACTION_5: "ああ、最悪！  真っ暗だ！  助けて！",
        P_ACTION_6: "闇の外套があなたを包み込む",
        P_ACTION_7: "おおっ！空中に浮いてるじゃないか！",
        P_ACTION_8: "あなたは空中に浮き始める",

        QUAFF_POISON_1: "一瞬気分が悪くなる",
        QUAFF_POISON_2: "今、とても気分が悪い",
        QUAFF_HEALING: "気分が良くなり始める",
        QUAFF_STRENGTH: "今、君はより強く感じる。なんて膨らんだ筋肉だ！",
        QUAFF_MFIND_1: `一瞬、普通の感覚が戻ったかと思うと、すぐに消えてしまう`,
        QUAFF_MFIND_2: `一瞬、奇妙な感覚が走るが、すぐに消えていく`,
        QUAFF_TFIND: "この階層に魔力の気配を感じる.",
        QUAFF_RAISE: "突然、器用になった気がする",
        QUAFF_XHEAL: "だんだん気分が良くなってくる",
        QUAFF_HASTE: "ずっと速く動いていると感じる",
        QUAFF_RESTORE: "おい、これすごくおいしいよ。体中がほっこり温かくなる感じだ",
        QUAFF_ETC: "なんという奇妙な味だ！",

        //scroll
        READS_CONFUSE: (color)=>{return `手が${color}に輝き始める`},
        READS_ARMOR: (color)=>{return `鎧が一瞬、${color}に輝いた`},
        READS_HOLD: "奇妙な喪失感を感じる",
        READS_SLEEP: "眠りに落ちた",
        READS_CREATE: "遠くでかすかな苦痛の叫びが聞こえる",
        READS_ID_ANY: (name)=>{return `この巻物は${name}です`},
        READS_MAP: "この巻物には地図が描かれている",
        READS_FDET_1: "鼻がツンとして、食べ物の匂いがする",
        READS_FDET_2: "鼻がツンとする",
        READS_ENCH: (name, color)=>{return `${name} が一瞬 ${color} に輝く`},
        READS_SCARE: "遠くで狂気じみた笑い声が聞こえる",
        READS_REMOVE_1: "あなたは宇宙の一体性に繋がっていると感じる", 
        READS_REMOVE_2: "誰かに見守られているような気がする",
        READS_AGGR: "甲高いブーンという音が聞こえる",
        READS_PROTECT: (color)=>{return `鎧はきらめく${color}の盾で覆われている`},
        READS_ETC: "なんという不可解な巻物だ！",

        WHATIS_1: "識別実施",
        WHATIS_2: (name)=>{return `${name}を識別した`},

        TYPENAME_POTION: "ポーション",
        TYPENAME_SCROLL: "魔法の巻物",
        TYPENAME_FOOD: "食料",
        TYPENAME_R_OR_S: "指輪と魔法の杖",
        TYPENAME_RING: "指輪",
        TYPENAME_STICK: "魔法の杖",
        TYPENAME_WEAPON: "武器",
        TYPENAME_ARMOR: "胴装備",

        //stick
        DOZAP_NOCHARGE: "何も起こらない",
        DOZAP_LIGHT_1: "廊下が光り、そして消える",
        DOZAP_LIGHT_2: (color)=>{return `部屋はきらめく${color}色の光に照らされている`},
        DOZAP_DRAIN: "それを使うには弱すぎる",
        DOZAP_WS_MISSILE: "ミサイルは煙の塊となって消えた",
        DOZAP_NOP: "何もしない。なんて奇妙な芸当だ！",
        DOZAP_ETC: "なんという奇妙な芸当だ！",

        DRAIN: "チクチクする感じがする",

        FIREBOLT_1: "炎が竜に跳ね返る",
        FIREBOLT_2: (bname, ename)=>{return `${bname}が${ename}のそばをビュッと通り過ぎる`},
        FIREBOLT_3: (bname)=>{return `${bname}に攻撃された`},
        FIREBOLT_4: (bname)=>{return `${bname}がそばをすっ飛んでいく`},


        //player
        FIND_U_STAIR:"上り階段を見つけた",
        FIND_D_STAIR:"下り階段を見つけた",

        STOMACH_1A: "小腹がすいてきた",
        STOMACH_1B: "お腹がすいた",
        STOMACH_1C: "お腹が空いてきた",
        STOMACH_1D: "空腹を感じ始めています",

        STOMACH_2A: "空腹感が運動能力を妨げている",
        STOMACH_2B: "だんだん弱くなってきています",

        STOMACH_3A: "空腹感が運動能力を圧倒する",
        STOMACH_3B: "空腹で力が入らない",
        STOMACH_3C: "パニックになる",
        STOMACH_3D: "気絶した",

        DO_MOVE_1: "まだ拘束の罠に引っかかったままです",
        DO_MOVE_2: "拘束されています",

        //trap
        BE_TRAP_DOOR: "罠にかかった！",
        BE_TRAP_BEAR: "熊の罠にかかっている",

        BE_TRAP_MIST_0: "突然、並行次元にいる",
        BE_TRAP_MIST_1: (color)=>{return `周りの明かりが急に ${color} になった`},
        BE_TRAP_MIST_2: "首の横に刺すような痛みを感じる",
        BE_TRAP_MIST_3: "色とりどりの線があなたの周りを渦巻き、やがて消えていく",
        BE_TRAP_MIST_4: (color)=>{return `あなたの瞳の中に ${color} の光が閃く`},
        BE_TRAP_MIST_5: "とげが耳をかすめて飛び去る！",
        BE_TRAP_MIST_6: (color)=>{return `${color} の火花が鎧の上で舞い踊る`},
        BE_TRAP_MIST_7: "突然、すごく喉が渇く",
        BE_TRAP_MIST_8: "突然、時間が速く感じられる",
        BE_TRAP_MIST_9: "今は時間が遅く流れているように感じる",
        BE_TRAP_MIST_10: (color)=>{return `荷物が ${color} になった!`},       

        BE_TRAP_SLEEP: "奇妙な白い霧に包み込まれて眠りに落ちた",

        BE_TRAP_ARROW_1: "矢に倒された",
        BE_TRAP_ARROW_2: "ああ、やばい！矢が当たった！",
        BE_TRAP_ARROW_3: "そばを矢が飛び抜けていく",

        BE_TRAP_DART_1: "小さなダーツが一瞬で耳の横をかすめて消える",
        BE_TRAP_DART_2: "毒矢に倒された",
        BE_TRAP_DART_3: "小さなダーツがちょうど君の肩に当たった",

        BE_TRAP_RUST: "水が勢いよく頭にかかってくる",

        RUST_ARMOR_1: "さびはたちまち消える",
        RUST_ARMOR_2: "鎧が弱くなったようだ。あらまあ！",

        UNCONFISE_1: `トリップ感が薄れていると感じる`,
        UNCONFISE_2: `混乱が少し和らいだと感じる`,

        SIGHT_1: "すごい！  また全てが宇宙的になったよ",
        SIGHT_2: "闇のベールが上がる",

        NOHASTE: "自分が遅くなっているのを感じる",

        EAT_1: "うっ…そんなの食べたら病気になっちゃうよ",
        EAT_2: "それは食べられない！",
        EAT_3: (fruit)=>{return `わあ、あれは美味しかった ${fruit}`},
        EAT_4: `残念、この食料はまずい`,
        EAT_5: `うわっ、この食料はまずいよ`,
        EAT_6: `おお、美味しかった`,
        EAT_7: `美味しい`,

        COME_DOWN: "今、すべてがすごくつまらなく見える",

        LAND_1: "残念！ 地面にぶつかった",
        LAND_2: "そっと地面に降り立った",
        
        CMDMAIN: "動けるようになった",

        //weapon
        FALL:(name)=>{return `${name} は地面にぶつかると消えた`},

        WIELD_1: "鎧を装備することはできません",
        WIELD_2: (name, ch)=>{ return `${name} (${ch}) を装備しました`},
        //armor
        WEAR_1: "すでに身につけています。まず外さなければなりません",
        WEAR_2: (name)=>{return `${name} を着用しました`},

        TAKEOFF_1: (ch, name)=>{return `${ch})${name} を脱ぎました`},

        //things
        DROP_1:"そこにはすでに何かがある",
        DROP_2:(name)=>{return `${name} を捨てた`},

        DROPCHECK:"できない。呪われているようだ",

        //rips
        KILLNAME_1:"arrow",
        KILLNAME_2:"bolt",
        KILLNAME_3:"dart",
        KILLNAME_4:"低体温症",
        KILLNAME_5:"空腹により飢餓",

        KILLNAME_6:(name)=>{return `あなたは ${name} に殺された`},
        KILLNAME_7:(name)=>{return `あなたは ${name} で死亡した`},

        RAINBOW: [
            "琥珀色",
            "青緑色",
            "黒色",
            "青色",
            "茶色",
            "透明色",
            "深紅色",
            "空色",
            "生成色",
            "金色",
            "緑色",
            "灰色",
            "赤紫色",
            "橙色",
            "桃色",
            "格子柄",
            "紫色",
            "赤色",
            "銀色",
            "黄褐色",
            "濃橙色",
            "褐色",
            "青空色",
            "朱色",
            "青紫色",
            "白色",
            "黄色",
        ],
        
        //miscf
        CHECKLEVEL: (lev, add)=>{return `経験レベル ${lev}になり、最大hpが ${add}増加した`},
        ADD_HASTE: "疲れ果てて気を失った",
    }
     return ms;
    }

    //Normal Message (En)
    const whoami = "player";  
    const ms = {
        INITAL: `Hello ${whoami} , just a moment while I dig the dungeon...`,
        WELCOME: `Welcome ${whoami}`,
        LEVIT_CHECK: "You can't.  You're floating off the ground!",
        //pack
        PACK_ADD: (name)=>{return `you now have ${name}`},
        PACK_MONEY: (value)=>{return `you found ${value} gold pieces`},

        ADDPACK: "the scroll turns to dust as you pick it up",
        PACKROOM: "there's no room in your pack",

        //fight
        H_NAMES: [		/* strings for hitting */
            " scored an excellent hit on ",
            " hit ",
            " have injured ",
            " swing and hit ",
            " scored an excellent hit on ",
            " hit ",
            " has injured ",
            " swings and hits "
	    ],
        M_NAMES: [		/* strings for missing */
            " miss",
            " swing and miss",
            " barely miss",
            " don't hit",
            " misses",
            " swings and misses",
            " barely misses",
            " doesn't hit",
    	],
        KILLED: (name)=>{return `you have defeated ${name}`},

        FIGHT_X1: "heavy!  That's a nasty critter!",
        FIGHT_X2: "wait!  That's a xeroc!",
        FIGHT_ROLL1: (color)=>{return `your hands stop glowing ${color}`},
        FIGHT_ROLL2: (name)=>{return `${name} appears confused`},

        ATTACK_I: (name)=>{return `you are frozen by the ${name}`},
        ATTACK_R1: "you feel a bite in your leg and now feel weaker",
        ATTACK_R2: "a bite momentarily weakens you",
        ATTACK_WV: "you suddenly feel weaker",
        ATTACK_L: "your purse feels lighter",
        ATTACK_N: (name)=>{return `she stole ${name}`},

        SETMNAME: "the ",

        PRNAME: "you",

        THUNK_1: (name)=>{return `the ${name} hits `},
        THUNK_2: "you hit ",
        THUNK_3: (name)=>{return `${mname}`},
        THUNK_4: "",
     
        HIT_1: (name)=>{return `${name}`},
        HIT_2: (name)=>{return `${name}`},
        HIT_3: "",

        MISS_1: (name)=>{return `${name}`},
        MISS_2: (name)=>{return ` ${name}`},
        MISS_3: "",

        BOUNCE_1: (name)=>{return `the ${name} misses `},
        BOUNCE_2: "you missed ",
        BOUNCE_3: "",

        //potion
        P_ACTION_1: "what a tripy feeling!",
        P_ACTION_2: "wait, what's going on here. Huh? What? Who?",
        P_ACTION_3: "Oh, wow!  Everything seems so cosmic!",
        P_ACTION_4: (fruit)=>{return `this potion tastes like ${fruit} juice`},
        P_ACTION_5: "oh, bummer!  Everything is dark!  Help!",
        P_ACTION_6: "a cloak of darkness falls around you",
        P_ACTION_7: "oh, wow!  You're floating in the air!",
        P_ACTION_8: "you start to float in the air",

        QUAFF_POISON_1: "you feel momentarily sick",
        QUAFF_POISON_2: "you feel very sick now",
        QUAFF_HEALING: "you begin to feel better",
        QUAFF_STRENGTH: "you feel stronger, now.  What bulging muscles!",
        QUAFF_MFIND_1: `you have a normal feeling for a moment, then it passes`,
        QUAFF_MFIND_2: `you have a strange feeling for a moment, then it passes`,
        QUAFF_TFIND: "You sense the presence of magic on this level.",
        QUAFF_RAISE: "you suddenly feel much more skillful",
        QUAFF_XHEAL: "you begin to feel much better",
        QUAFF_HASTE: "you feel yourself moving much faster",
        QUAFF_RESTORE: "hey, this tastes great.  It make you feel warm all over",
        QUAFF_ETC: "what an odd tasting potion!",

        //scroll
        READS_CONFUSE: (color)=>{return `your hands begin to glow ${color}`},
        READS_ARMOR: (color)=>{return `your armor glows ${color} for a moment`},
        READS_HOLD: "you feel a strange sense of loss",
        READS_SLEEP: "you fall asleep",
        READS_CREATE: "you hear a faint cry of anguish in the distance",
        READS_ID_ANY: (name)=>{return `this scroll is an ${name} scroll`},
        READS_MAP: "oh, now this scroll has a map on it",
        READS_FDET_1: "Your nose tingles and you smell food.",
        READS_FDET_2: "your nose tingles",
        READS_ENCH: (name, color)=>{return `your ${name} glows ${color} for a moment`},
        READS_SCARE: "you hear maniacal laughter in the distance",
        READS_REMOVE_1: "you feel in touch with the Universal Onenes", 
        READS_REMOVE_2: "you feel as if somebody is watching over you",
        READS_AGGR: "you hear a high pitched humming noise",
        READS_PROTECT: (color)=>{return `your armor is covered by a shimmering ${color} shield`},
        READS_ETC: "what a puzzling scroll!",

        WHATIS_1: "you must identify something",
        WHATIS_2: (name)=>{return `you must identify a ${name}`},

        TYPENAME_POTION: "potion",
        TYPENAME_SCROLL: "scroll",
        TYPENAME_FOOD: "food",
        TYPENAME_R_OR_S: "ring, wand or staff",
        TYPENAME_RING: "ring",
        TYPENAME_STICK: "wand or staff",
        TYPENAME_WEAPON: "weapon",
        TYPENAME_ARMOR: "suit of armor",

        //stick
        DOZAP_NOCHARGE: "nothing happens",
        DOZAP_LIGHT_1: "the corridor glows and then fades",
        DOZAP_LIGHT_2: (color)=>{return `the room is lit by a shimmering ${color} light`},
        DOZAP_DRAIN: "you are too weak to use it",
        DOZAP_WS_MISSILE: "the missle vanishes with a puff of smoke",
        DOZAP_NOP: "no operation. what a bizarre schtick!",
        DOZAP_ETC: "what a bizarre schtick!",

        DRAIN: "you have a tingling feeling",

        FIREBOLT_1: "the flame bounces off the dragon",
        FIREBOLT_2: (bname, ename)=>{return `the ${bname} whizzes past ${ename}`},
        FIREBOLT_3: (bname)=>{return `you are hit by the ${bname}`},
        FIREBOLT_4: (bname)=>{return `the ${bname} whizzes by you`},


        //player
        FIND_U_STAIR: "you find up stairs.",
        FIND_D_STAIR: "you find down stairs.",

        STOMACH_1A: "getting the munchies",
        STOMACH_1B: "getting hungry",
        STOMACH_1C: "you are getting the munchies",
        STOMACH_1D: "you are starting to get hungry",

        STOMACH_2A: "the munchies are interfering with your motor capabilites",
        STOMACH_2B: "you are starting to feel weak",

        STOMACH_3A: "the munchies overpower your motor capabilities.  ",
        STOMACH_3B: "you feel too weak from lack of food.  ",
        STOMACH_3C: "You freak out",
        STOMACH_3D: "You faint",

        DO_MOVE_1: "you are still stuck in the bear trap",
        DO_MOVE_2: "you are being held",

        //trap
        BE_TRAP_DOOR: "you fell into a trap!",
        BE_TRAP_BEAR: "you are caught in a bear trap",

        BE_TRAP_MIST_0: "you are suddenly in a parallel dimension",
        BE_TRAP_MIST_1: (color)=>{return `the light in here suddenly seems ${color}`},
        BE_TRAP_MIST_2: "you feel a sting in the side of your neck",
        BE_TRAP_MIST_3: "multi-colored lines swirl around you, then fade",
        BE_TRAP_MIST_4: (color)=>{return `a ${color} light flashes in your eyes`},
        BE_TRAP_MIST_5: "a spike shoots past your ear!",
        BE_TRAP_MIST_6: (color)=>{return `${color} sparks dance across your armor`},
        BE_TRAP_MIST_7: "you suddenly feel very thirsty",
        BE_TRAP_MIST_8: "you feel time speed up suddenly",
        BE_TRAP_MIST_9: "time now seems to be going slower",
        BE_TRAP_MIST_10: (color)=>{return `you pack turns ${color}!`},       

        BE_TRAP_SLEEP: "a strange white mist envelops you and you fall asleep",

        BE_TRAP_ARROW_1: "an arrow killed you",
        BE_TRAP_ARROW_2: "oh no! An arrow shot you",
        BE_TRAP_ARROW_3: "an arrow shoots past you",

        BE_TRAP_DART_1: "a small dart whizzes by your ear and vanishes",
        BE_TRAP_DART_2: "a poisoned dart killed you",
        BE_TRAP_DART_3: "a small dart just hit you in the shoulder",

        BE_TRAP_RUST: "a gush of water hits you on the head",

        RUST_ARMOR_1: "the rust vanishes instantly",
        RUST_ARMOR_2: "your armor appears to be weaker now. Oh my!",

        UNCONFISE_1: `you feel less trippy now`,
        UNCONFISE_2: `you feel less confused now`,

        SIGHT_1: "far out!  Everything is all cosmic again",
        SIGHT_2: "the veil of darkness lifts",

        NOHASTE: "you feel yourself slowing down",

        EAT_1: "ugh, you would get ill if you ate that",
        EAT_2: "that's Inedible!",
        EAT_3: (fruit)=>{return `my, that was a yummy ${fruit}`},
        EAT_4: `bummer, this food tastes awful`,
        EAT_5: `yuk, this food tastes awful`,
        EAT_6: `oh, wow, that tasted good`,
        EAT_7: `yum, that tasted good`,

        COME_DOWN: "Everything looks SO boring now.",

        LAND_1: "bummer!  You've hit the ground",
        LAND_2: "you float gently to the ground",

        CMDMAIN: "you can move again",

        //weapon
        FALL:(name)=>{return `the ${name} vanishes as it hits the ground`},

        WIELD_1: "you can't wield armor",
        WIELD_2: (name, ch)=>{ return `you are now wielding ${name} (${ch})`},

        //armor
        WEAR_1: "you are already wearing some. You'll have to take it off first",
        WEAR_2: (name)=>{return `you are now wearing ${name}`},

        TAKEOFF_1: (ch, name)=>{return `you used to be wearing ${ch}) ${name}`},

        //things
        DROP_1:"there is something there already",
        DROP_2:(name)=>{return `dropped ${name}`},

        DROPCHECK:"you can't.  It appears to be cursed",

        //rips
        KILLNAME_1:"arrow",
        KILLNAME_2:"bolt",
        KILLNAME_3:"dart",
        KILLNAME_4:"hypothermia",
        KILLNAME_5:"starvation",

        KILLNAME_6:(name)=>{return `You were killed by ${name}`},
        KILLNAME_7:(name)=>{return `You died of ${name}`},

        RAINBOW: [
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
        ],

        //miscf
        CHECKLEVEL: (lev, add)=>{return `exp levelup to explvl ${lev} maxhp ${add} up`},
        ADD_HASTE: "you faint from exhaustion",
    }
    return ms;
}

