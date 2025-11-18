/*
*　rogue messages en
*/
function rogueMessages_org(){

    //Normal Message (En)
    const whoami = "player";  
    const ms = {
        FRUIT: "slime-mold",

        INITAL: `Hello ${whoami} , just a moment while I dig the dungeon...`,
        WELCOME: `Welcome ${whoami}`,
        LEVIT_CHECK: "You can't.  You're floating off the ground!",
        //pack
        PACK_ADD: (name)=>{return `you now have ${name}`},
        PACK_MONEY: (value)=>{return `you found ${value} gold pieces`},

        GET_INV_NONE: "none",
        GET_INV_EQUIP: `Equiped)`,
        GET_INV_WEAP:  (name)=>{return `Weapon: ${name}`},
        GET_INV_ARM:   (name)=>{return `Armor : ${name}`},
        GET_INV_RINGL: (name)=>{return `Ring-L: ${name}`},
        GET_INV_RINGR: (name)=>{return `Ring-R: ${name}`},
        GET_INV_SEL:   (name)=>{return `Select> ${name}`},

        //Item
        INITCOLOR: false,

        INITMT_WAND: "wand ",
        INITMT_STAFF: "staff ",

        ADDPACK: "the scroll turns to dust as you pick it up",
        PACKROOM: "there's no room in your pack",

        MOVEMSG: (name)=>{ return `you moved onto ${name}` },

        NPICKY_INVEN1: "you aren't carrying anything",
        NPICKY_INVEN2:(ch)=>{return `'${ch}' not in pack`},

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

        SETMNAME1: "the ",
        SETMNAME2: "something",

        PRNAME: "you",

        THUNK_1: (name, mn)=>{return `the ${name} hits ${mn}`},
        THUNK_2: (name)=>{return `you hit ${name}`},
        THUNK_3: "",
     
        HIT_VM: false, //動詞と名詞順番　falseでオリジナルと同じ
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
        READS_HOLD1:(text, mu)=>{return `the monster${text} freeze${mu}`},
        READS_HOLD1_A: "s around you",
        READS_HOLD1_B: "s",
        READS_HOLD2: "you feel a strange sense of loss",
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
        DOZAP_MISSILE: "the missle vanishes with a puff of smoke",
        DOZAP_NOP: "no operation. what a bizarre schtick!",
        DOZAP_ETC: "what a bizarre schtick!",

        DOZAP_BOLT_E: "bolt",
        DOZAP_BOLT_F: "flame",
        DOZAP_BOLT_I: "ice",

        DRAIN: "you have a tingling feeling",

        FIREBOLT_1: "the flame bounces off the dragon",
        FIREBOLT_2: (bname, ename)=>{return `the ${bname} whizzes past ${ename}`},
        FIREBOLT_3: (bname)=>{return `you are hit by the ${bname}`},
        FIREBOLT_4: (bname)=>{return `the ${bname} whizzes by you`},
        FIREBOLT_5: (name)=>{return `he ${name} bounces`},

        CHARGE_STR: (num)=>{return ` [${num} charges]`},

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

        //dungeon
        D_LEVEL:"I see no way down",
        U_LEVEL_1:"you feel a wrenching sensation in your gut",
        U_LEVEL_2:"your way is magically blocked",
        U_LEVEL_3:"I see no way up",

        //weapon
        FALL:(name)=>{return `the ${name} vanishes as it hits the ground`},

        WIELD_1: "you can't wield armor",
        WIELD_2: (name, ch)=>{ return `you are now wielding ${name} (${ch})`},

        //armor
        WEAR_1: "you are already wearing some. You'll have to take it off first",
        WEAR_2: (name)=>{return `you are now wearing ${name}`},

        TAKEOFF_1: (ch, name)=>{return `you used to be wearing ${ch}) ${name}`},

        //ring
        RING_ISCUR: "That's already in use",
        RING_ON_1: "you already have a ring on each hand. wearing two",
        RING_ON_2: (name, ch)=>{return `you are now wearing ${name} (${ch})`;},

        RING_OFF: (name, ch)=>{return `${name} (${ch})`;},

        //things
        VOWELSTR: true,
        INVNAME1: "A ",
        INVNAME2: "A",

        NAMEIT1: "A ",
        NAMEIT2: "A",

        INVNAME_AL_POT: "potion ",
        INVNAME_AL_RING: "ring ",

        INVNAME_AL_SCR0: (head, type, name)=>{return `${head}${type}${name}`},
        INVNAME_AL_SCR1: "scroll ",
        INVNAME_AL_SCR2: " scrolls ",
        INVNAME_AL_SCR3: (name)=>{return `of ${name}`},
        INVNAME_AL_SCR4: (text)=>{return `titled '${text}'`},

        INVNAME_AL_FOOD1: "Some food",
        INVNAME_AL_FOOD2: (num)=>{return `${num} rations of food`},

        INVNAME_AL_WEA: "s",

        INVNAME_AL_ARM: (num)=>{return ` [protection ${num}]`},

        INVNAME_AL_AMU: "The Amulet of Yendor",
        INVNAME_AL_DEF: "none",

        NAMEIT_AL1: (head, type, name, etc)=>{return `${head}${type}of ${name}${etc}`},
        NAMEIT_AL2: (head, name, type)=>{return `${head}${name} ${type}`},
        NAMEIT_AL3: (head, name, type)=>{return `${head} ${name} ${type}`},

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
        
        TOTALWIN_1:"Congratulations, you have made it to the light of day!",
        TOTALWIN_2:"You Made It!",

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

        //monster
        MONSTERNAME:[
            "aquator",
            "bat",	
            "centaur",
            "dragon",
            "emu",
            "venus flytrap",
            "griffin", 
            "hobgoblin",
            "ice monster",
            "jabberwock",
            "kestrel",
            "leprechaun",
            "medusa",
            "nymph",
            "orc",
            "phantom",
            "quagga",
            "rattlesnake",
            "snake",
            "troll",
            "black unicorn",
            "vampire",
            "wraith",
            "xeroc",
            "yeti",
            "zombie",
        ],

        WAKEMONST:(name, camma)=>{return `${name}${camma}s gaze has confused you`},

        //itemnames
        WEAP_NAME:[
            "mace",
            "long sword",
            "short bow",
            "arrow",	
            "dagger",	
            "two handed sword",
            "dart",				
            "shuriken",			
            "spear",			
        ],
        ARM_NAME:[
            "leather armor",
            "ring mail",
            "studded leather armor",
            "scale mail",
            "chain mail",
            "splint mail",
            "banded mail",
            "plate mail",
        ],

        POT_NAME:[
            "confusion",	 
            "hallucination", 
            "poison",		
            "gain strength",
            "see invisible", 
            "healing",		
            "monster detection", 
            "magic detection",	 
            "raise level",	 
            "extra healing", 
            "haste self",	 
            "restore strength",	
            "blindness",	 
            "levitation",
        ],	

        RING_NAME:[
            "protection",		
            "add strength",	
            "sustain strength", 
            "searching",		
            "see invisible",	
            "adornment",		
            "aggravate monster",
            "dexterity",		 
            "increase damage",	 
            "regeneration",	 
            "slow digestion",	
            "stealth",		     
            "maintain armor",
        ],

        SCR_NAME:[
            "monster confusion",	
            "magic mapping",		
            "hold monster",		
            "sleep",				 
            "enchant armor",		
            "identify potion",		
            "identify scroll",		
            "identify weapon",		 
            "identify armor",		 
            "identify ring, wand or staff",	
            "scare monster",		 
            "food detection",		
            "teleportation",		
            "enchant weapon",		 
            "create monster",		
            "remove curse",			
            "aggravate monsters",	 
            "protect armor",		 
        ],

        WANDS_NAME:[
            "light", 		
            "invisibility",	 
            "lightning", 	 
            "fire",			
            "cold",			 
            "polymorph", 	
            "magic missile", 
            "haste monster", 
            "slow monster",	
            "drain life",	 
            "nothing",		 
            "teleport away",  
            "teleport to",	 
            "cancellation",	
        ],
        
        //material
        STONE_NAME:[
            "agate",
            "alexandrite",
            "amethyst",
            "carnelian",
            "diamond",
            "emerald",
            "germanium",
            "granite",
            "garnet",
            "jade",
            "kryptonite",
            "lapis lazuli",
            "moonstone",
            "obsidian",
            "onyx",
            "opal",
            "pearl",
            "peridot",
            "ruby",
            "sapphire",
            "stibotantalite",
            "tiger eye",
            "topaz",
            "turquoise",
            "taaffeite",
            "zircon",
        ],

        WOOD_NAME:[
            "avocado wood",
            "balsa",
            "bamboo",
            "banyan",
            "birch",
            "cedar",
            "cherry",
            "cinnibar",
            "cypress",
            "dogwood",
            "driftwood",
            "ebony",
            "elm",
            "eucalyptus",
            "fall",
            "hemlock",
            "holly",
            "ironwood",
            "kukui wood",
            "mahogany",
            "manzanita",
            "maple",
            "oaken",
            "persimmon wood",
            "pecan",
            "pine",
            "poplar",
            "redwood",
            "rosewood",
            "spruce",
            "teak",
            "walnut",
            "zebrawood",
        ],

        METAL_NAME:[
            "aluminum",
            "beryllium",
            "bone",
            "brass",
            "bronze",
            "copper",
            "electrum",
            "gold",
            "iron",
            "lead",
            "magnesium",
            "mercury",
            "nickel",
            "pewter",
            "platinum",
            "steel",
            "silver",
            "silicon",
            "tin",
            "titanium",
            "tungsten",
            "zinc",
        ],

        SYLLS:[
            "a", "ab", "ag", "aks", "ala", "an", "app", "arg", "arze", "ash",
            "bek", "bie", "bit", "bjor", "blu", "bot", "bu", "byt", "comp",
            "con", "cos", "cre", "dalf", "dan", "den", "do", "e", "eep", "el",
            "eng", "er", "ere", "erk", "esh", "evs", "fa", "fid", "fri", "fu",
            "gan", "gar", "glen", "gop", "gre", "ha", "hyd", "i", "ing", "ip",
            "ish", "it", "ite", "iv", "jo", "kho", "kli", "klis", "la", "lech",
            "mar", "me", "mi", "mic", "mik", "mon", "mung", "mur", "nej",
            "nelg", "nep", "ner", "nes", "nes", "nih", "nin", "o", "od", "ood",
            "org", "orn", "ox", "oxy", "pay", "ple", "plu", "po", "pot",
            "prok", "re", "rea", "rhov", "ri", "ro", "rog", "rok", "rol", "sa",
            "san", "sat", "sef", "seh", "shu", "ski", "sna", "sne", "snik",
            "sno", "so", "sol", "sri", "sta", "sun", "ta", "tab", "tem",
            "ther", "ti", "tox", "trol", "tue", "turs", "u", "ulk", "um", "un",
            "uni", "ur", "val", "viv", "vly", "vom", "wah", "wed", "werg",
            "wex", "whon", "wun", "xo", "y", "yot", "yu", "zant", "zeb", "zim",
            "zok", "zon", "zum",
        ],
    }
    return ms;
}

