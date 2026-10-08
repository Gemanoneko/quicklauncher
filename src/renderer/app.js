/* global api, QL_BANNER */
const APP_VERSION = window.api.version;

// ── State ────────────────────────────────────────────────────────────────────
let apps = [];
let settings = {};
let editMode = false;
let reorderState = null;      // active drag-to-reorder operation
let suppressNextClick = false; // prevent launch-on-click after a drag
let bannerInterval = null;
let bannerFadeTimer = null;   // inner fade setTimeout — cleared on theme change
let refreshingIcons = false;  // guard against concurrent refreshMissingIcons calls

// ── DOM refs (cached once at script start; index.html loads app.js at end of body) ──
// Only the most-frequently-repeated lookups are cached here — one-off getElementById
// calls stay inline for readability. Kept under 10 deliberately.
const $ = (id) => document.getElementById(id);
const elAppGrid        = $('app-grid');
const elApp            = $('app');
const elUpdateText     = $('update-text');

// ── Banner quotes (2 to 6 per theme) ──────────────────────────────────────────
const THEME_BANNERS = {
  'cyberpunk':    ['WAKE UP, SAMURAI. WE HAVE A CITY TO BURN.',
                   'NEVER FADE AWAY.',
                   'FOR FOLKS LIKE US? WRONG CITY, WRONG PEOPLE.'],
  'blade-runner': ['ALL THOSE MOMENTS WILL BE LOST IN TIME, LIKE TEARS IN RAIN.',
                   'MORE HUMAN THAN HUMAN IS OUR MOTTO.',
                   "IT'S TOO BAD SHE WON'T LIVE. BUT THEN AGAIN, WHO DOES?",
                   'I HAVE SEEN THINGS YOU PEOPLE WOULD NOT BELIEVE.',
                   'IS IT LIVE, OR IS IT MEMORY?'],
  'alien':        ['IN SPACE, NO ONE CAN HEAR YOU SCREAM.',
                   'BRING BACK LIFE FORM. CREW EXPENDABLE.',
                   'THEY MOSTLY COME AT NIGHT... MOSTLY.',
                   'PERFECT ORGANISM. ITS STRUCTURAL PERFECTION IS MATCHED ONLY BY ITS HOSTILITY.',
                   'STAY FROSTY.'],
  'tron':         ['I FIGHT FOR THE USERS.',
                   'THE GRID. A DIGITAL FRONTIER TO RESHAPE THE HUMAN CONDITION.',
                   'END OF LINE.',
                   'ON THE GRID, THERE IS NO DEATH. ONLY DEREZZATION.',
                   'GREETINGS, PROGRAMS.'],
  'lcars':        ['TO BOLDLY GO WHERE NO ONE HAS GONE BEFORE.',
                   'MAKE IT SO.',
                   'THERE ARE FOUR LIGHTS.',
                   'THE NEEDS OF THE MANY OUTWEIGH THE NEEDS OF THE FEW.',
                   'RESISTANCE IS FUTILE.'],
  'pip-boy':      ['WAR. WAR NEVER CHANGES.',
                   'PLEASE STAND BY.',
                   'WELCOME TO THE WASTELAND.',
                   'VAULT-TEC THANKS YOU FOR CHOOSING TO SURVIVE.',
                   'TAKE YOUR STIMPAK AND PRESS ON, VAULT DWELLER.'],
  'dune':         ['THE SPICE MUST FLOW.',
                   'FEAR IS THE MIND-KILLER.',
                   'HE WHO CONTROLS THE SPICE CONTROLS THE UNIVERSE.',
                   'A BEGINNING IS THE TIME FOR TAKING THE MOST DELICATE CARE.',
                   'GOD CREATED ARRAKIS TO TRAIN THE FAITHFUL.'],
  'x-files':      ['THE TRUTH IS OUT THERE.',
                   'TRUST NO ONE.',
                   'I WANT TO BELIEVE.',
                   'THEY ARE WATCHING. THEY HAVE ALWAYS BEEN WATCHING.',
                   'THE GOVERNMENT DENIES KNOWLEDGE.'],
  'mass-effect':  ['THE REAPERS ARE REAL. WARN EVERYONE.',
                   'NO SHEPARD WITHOUT VAKARIAN.',
                   'STAND TOGETHER OR DIE ALONE.',
                   'I AM COMMANDER SHEPARD, AND THIS IS MY FAVORITE STORE ON THE CITADEL.',
                   'ASSUMING DIRECT CONTROL.'],
  'deus-ex':      ['I NEVER ASKED FOR THIS.',
                   'WHAT A SHAME.',
                   'THE CONSPIRACY RUNS DEEPER THAN YOU KNOW.',
                   'GIVING PEOPLE WHAT THEY WANT — BEFORE THEY KNOW THEY WANT IT.',
                   'EVERY REVOLUTION BEGINS WITH ONE ACT OF COURAGE.'],
  'ghost-shell':  ['WHAT EXACTLY IS A GHOST?',
                   'YOUR GHOST WHISPERS TO MY GHOST.',
                   'IS ALL THIS DATA MAKING THE NET BIGGER, OR AM I GETTING SMALLER?',
                   'THE NET IS VAST AND INFINITE.',
                   'A CYBERBRAIN COULD POTENTIALLY HALLUCINATE.'],
  'matrix':       ['THERE IS NO SPOON.',
                   'FREE YOUR MIND.',
                   'YOU TAKE THE RED PILL AND I SHOW YOU HOW DEEP THE RABBIT HOLE GOES.',
                   'WELCOME TO THE DESERT OF THE REAL.',
                   'EVERY MACHINE NEEDS HUMAN BEINGS.'],
  'warhammer': [
    'Only in death does duty end.',
    'Blessed is the mind too small for doubt.',
    'The Emperor protects.',
    'Victory needs no explanation, defeat allows none.',
    'No man died in His service that died in vain.',
  ],
  'warhammer-chaos': [
    'Blood for the Blood God!',
    'Skulls for the Skull Throne.',
    'Sanity is for the weak!',
    'For the Dark Gods!',
    'Do you hear the voices, too?',
  ],
  'warhammer-eldar': [
    'The future is clouded and uncertain.',
    'All who love life, fear the reaper.',
    'I am Khaine incarnate.',
    'We cannot fail.',
  ],
  'warhammer-necrons': [
    'We are your end, alien.',
    'So much fear. So much noise.',
    'Death has come for you at last.',
    'Your bravado will not save you.',
    'Your end is inevitable.',
  ],
  'warhammer-orks': [
    'WAAAGH!',
    'Orks is made for fightin!',
    "I'm da biggest, so I'm da boss!",
    'Dakka dakka dakka!',
    "Ev'ryone knowz red wunz go fasta!",
  ],
  'warhammer-tyranids': [
    'There is a cancer eating at the Imperium.',
    '...it must know us only as Prey.',
  ],
  'dead-space':   ['MAKE US WHOLE.',
                   'CUT OFF THEIR LIMBS!',
                   'ALTMAN BE PRAISED.',
                   'YOUR LACK OF CONFIDENCE IN ME IS DULY NOTED.'],
  'half-life':    ['THE RIGHT MAN IN THE WRONG PLACE CAN MAKE ALL THE DIFFERENCE.',
                   'PREPARE FOR UNFORESEEN CONSEQUENCES.',
                   'RISE AND SHINE, MR. FREEMAN.',
                   'THE LAMBDA COMPLEX IS BREACHED.',
                   'IT WOULD BE UNWISE TO ANGER ME.'],
  'terminator':   ['COME WITH ME IF YOU WANT TO LIVE.',
                   "I'LL BE BACK.",
                   'JUDGMENT DAY IS INEVITABLE.',
                   'SKYNET IS ONLINE.',
                   'HASTA LA VISTA, BABY.'],
  'portal':       ['THE CAKE IS A LIE.',
                   'THINK WITH PORTALS.',
                   "SCIENCE ISN'T ABOUT WHY. IT'S ABOUT WHY NOT.",
                   'STILL ALIVE.',
                   'APERTURE SCIENCE. WE DO WHAT WE MUST BECAUSE WE CAN.'],
  'star-wars-rebel': [
    'Rebellions are built on hope.',
    'Never tell me the odds!',
    "You're my only hope.",
  ],
  'star-wars-empire': [
    'I find your lack of faith disturbing.',
    'Apology accepted, Captain Needa.',
    'Fear will keep the local systems in line.',
  ],
  'star-wars-mando': [
    'This is the Way.',
    'I have spoken.',
    'I like those odds.',
  ],
  'star-wars-separatist': [
    'Roger, roger.',
    'General Kenobi! You are a bold one.',
    "I've been looking forward to this.",
  ],
  'star-wars-sith': [
    'Good! Your hate has made you powerful.',
    'Unlimited power!',
    'Execute Order 66.',
  ],
  'star-wars-republic': [
    'Hello there.',
    'This is where the fun begins.',
    'I have the high ground.',
  ],
  'doctor-who': [
    'WIBBLY WOBBLY, TIMEY WIMEY.',
    "WE'RE ALL STORIES IN THE END. JUST MAKE IT A GOOD ONE.",
    'HELLO. I AM THE DOCTOR. BASICALLY... RUN.',
    'I AM AND ALWAYS WILL BE THE OPTIMIST. THE HOPER OF FAR-FLUNG HOPES.',
    'YOU WANT WEAPONS? WE ARE IN A LIBRARY. BOOKS. THE BEST WEAPONS IN THE WORLD.',
  ],
  'akira': [
    'NEO-TOKYO IS ABOUT TO E.X.P.L.O.D.E.',
    "THAT'S MISTER KANEDA TO YOU, PUNK!",
    'I AM TETSUO.',
    'KANEDA!',
    'TETSUO!',
  ],
  'evangelion': [
    'MANKIND STANDS UPON THE THRESHOLD OF AN EVOLUTIONARY LEAP.',
    'GOD IS IN HIS HEAVEN. ALL IS RIGHT WITH THE WORLD.',
    'THAT IS IT. I MUST NOT RUN AWAY.',
    'THE THIRD IMPACT IS ALREADY UNDERWAY.',
    'HUMAN INSTRUMENTALITY PROJECT — INITIATED.',
  ],
  '2001': [
    "I'm sorry, Dave. I'm afraid I can't do that.",
    'Open the pod bay doors, HAL.',
    'Daisy, Daisy, give me your answer do.',
    'The 9000 series is the most reliable computer ever made.',
    "Just what do you think you're doing, Dave?",
  ],
  'silent-hill': [
    'THERE WAS A HOLE HERE. IT IS GONE NOW.',
    'IN MY RESTLESS DREAMS, I SEE THAT TOWN.',
    'THIS IS NOT A PLACE OF HONOR.',
    'YOU MADE ME REMEMBER. I WISH YOU HADN\'T.',
    'ORDER — THE OLD GODS SLUMBER. BUT THEY DREAM.',
  ],
  'stalker': [
    'THE ZONE DOES NOT CARE ABOUT YOUR PLANS.',
    'HAPPINESS IS THE ONLY THING WORTH FIGHTING FOR.',
    'ANOMALY DETECTED. REDUCE SPEED. OBSERVE.',
    'GOOD STALKER DIES ONCE. BAD STALKER DIES MANY TIMES.',
    'THE WISH GRANTER KNOWS WHAT YOU TRULY DESIRE. NOT WHAT YOU SAY YOU DESIRE.',
  ],
  'resident-evil': [
    'UMBRELLA WILL SAVE HUMANITY FROM ITSELF.',
    'YOU WERE ALMOST A JILL SANDWICH.',
    'STARS. RACCOON CITY POLICE DEPARTMENT. SPECIAL TACTICS AND RESCUE SERVICE.',
    'T-VIRUS CONTAINMENT HAS FAILED. ALL PERSONNEL EVACUATE IMMEDIATELY.',
    'THE FIRST OF ALL EVILS MEN MUST FEAR IS INJUSTICE.',
  ],
  'the-expanse': [
    'INYALOWDA. WE ARE THE BELT.',
    'SOL GATE APPROACH. TRAFFIC CONTROL ONLINE. STAND BY.',
    'THE BELT IS NOT A PLACE. IT IS A PEOPLE.',
    'DANGER CLOSE. RETURNING FIRE.',
    'WE ARE ALL THE FILAMENT IN THIS UNIVERSE.',
  ],
  'hogwarts': [
    'I SOLEMNLY SWEAR THAT I AM UP TO NO GOOD.',
    'MISCHIEF MANAGED.',
    'AFTER ALL THIS TIME? ALWAYS.',
    'IT IS OUR CHOICES THAT SHOW WHAT WE TRULY ARE, FAR MORE THAN OUR ABILITIES.',
    'HAPPINESS CAN BE FOUND EVEN IN THE DARKEST OF TIMES, IF ONE ONLY REMEMBERS TO TURN ON THE LIGHT.',
  ],
  'ministry-of-magic': [
    'MAGIC IS MIGHT.',
    'PLEASE STATE YOUR NAME AND PURPOSE FOR THE RECORD.',
    'THE DEPARTMENT OF MYSTERIES DOES NOT COMMENT ON ONGOING INVESTIGATIONS.',
    'AURORS HAVE BEEN DISPATCHED. PLEASE REMAIN WHERE YOU ARE.',
    'FLOO NETWORK DISRUPTED. PLEASE USE ALTERNATIVE MAGICAL TRANSPORT.',
  ],
  'gryffindor': [
    'Where dwell the brave at heart.',
    'Their daring, nerve, and chivalry set Gryffindors apart.',
    'Mischief managed.',
    'I solemnly swear that I am up to no good.',
  ],
  'ravenclaw': [
    'WIT BEYOND MEASURE IS MAN\'S GREATEST TREASURE.',
    'WORDS ARE, IN MY NOT SO HUMBLE OPINION, OUR MOST INEXHAUSTIBLE SOURCE OF MAGIC.',
    'THE MIND IS NOT A VESSEL TO BE FILLED, BUT A FIRE TO BE KINDLED.',
    'A READERS BEFORE A LEADERS.',
    'THE DIADEM AMPLIFIES THE WISDOM OF THE WEARER.',
  ],
  'hufflepuff': [
    'I\'LL TEACH THE LOT, AND TREAT THEM JUST THE SAME.',
    'HARD WORK BEATS TALENT WHEN TALENT DOESN\'T WORK HARD.',
    'KIND HEARTS ARE THE GARDENS. KIND THOUGHTS ARE THE ROOTS.',
    'LOYALTY IS THE HIGHEST MAGIC.',
    'NEVILLE LONGBOTTOM WAS A HUFFLEPUFF AT HEART.',
  ],
  'slytherin': [
    'SLYTHERIN WILL HELP YOU ON THE WAY TO GREATNESS.',
    'CUNNING FOLK USE ANY MEANS TO ACHIEVE THEIR ENDS.',
    'WE ARE ALL THE PIECES OF WHAT WE REMEMBER.',
    'THERE IS NO GOOD AND EVIL. THERE IS ONLY POWER, AND THOSE TOO WEAK TO SEEK IT.',
    'THOSE WHO HAVE NOT YET BEEN TOUCHED BY DARKNESS CANNOT UNDERSTAND ITS APPEAL.',
  ],
  'rivendell': [
    'NOT ALL THOSE WHO WANDER ARE LOST.',
    'EVEN THE SMALLEST PERSON CAN CHANGE THE COURSE OF THE FUTURE.',
    'THE ROAD GOES EVER ON AND ON.',
    'ALL WE HAVE TO DECIDE IS WHAT TO DO WITH THE TIME THAT IS GIVEN US.',
    'HE THAT BREAKS A THING TO FIND OUT WHAT IT IS HAS LEFT THE PATH OF WISDOM.',
  ],
  'shire': [
    'In a hole in the ground there lived a hobbit.',
    'What about second breakfast?',
    'Home is behind, the world ahead.',
    'The road goes ever on and on.',
    'Not all those who wander are lost.',
  ],
  'mordor': [
    'ONE DOES NOT SIMPLY WALK INTO MORDOR.',
    'YOU CANNOT HIDE. THE EYE OF SAURON IS UPON YOU.',
    'MY PRECIOUS.',
    'ASH NAZG DURBATULÛK, ASH NAZG GIMBATUL.',
    'THE RING CANNOT BE DESTROYED BY ANY CRAFT THAT WE HERE POSSESS.',
  ],
  'scp': [
    'SECURE. CONTAIN. PROTECT.',
    'DOCUMENT SCP-████: INFORMATION REDACTED BY ORDER OF THE ADMINISTRATOR.',
    'CONTAINMENT HAS BEEN BREACHED. ALL PERSONNEL REPORT TO SAFE ROOMS IMMEDIATELY.',
    'OBJECT CLASS: KETER. SPECIAL CONTAINMENT PROCEDURES IN EFFECT.',
    'THIS DOCUMENT IS CLASSIFIED. UNAUTHORIZED ACCESS IS A TERMINATION-LEVEL OFFENSE.',
  ],
  'alan-wake': [
    'IT\'S NOT A LAKE. IT\'S AN OCEAN.',
    'THE DARKNESS IS AFRAID OF THE LIGHT.',
    'THE TAKEN WERE OUT THERE, HUNTING ME THROUGH THE NIGHT.',
    'EVERY STORY IS A FIGHT AGAINST THE DARK.',
    'A WRITER\'S JOB IS TO THINK WHAT HAS NEVER BEEN THOUGHT AND WRITE WHAT HAS NEVER BEEN WRITTEN.',
  ],
  'control': [
    'STAY OUT OF THE DARK PLACE.',
    'THE OLDEST HOUSE IS ALWAYS EXPANDING.',
    'THE HISS IS A RESONANCE. IT CANNOT BE KILLED — ONLY CONTAINED.',
    'WELCOME TO THE FEDERAL BUREAU OF CONTROL. EVERYONE IS BEING WATCHED.',
    'POLARIS IS GUIDING YOU. DO NOT RESIST.',
  ],
  'twin-peaks': [
    'THE OWLS ARE NOT WHAT THEY SEEM.',
    'DIANE, I AM HOLDING IN MY HAND A SMALL BOX OF CHOCOLATE BUNNIES.',
    'FIRE WALK WITH ME.',
    'I\'LL SEE YOU AGAIN IN 25 YEARS.',
    'THROUGH THE DARKNESS OF FUTURE PAST, THE MAGICIAN LONGS TO SEE.',
  ],
  'lovecraft': [
    'PH\'NGLUI MGLW\'NAFH CTHULHU R\'LYEH WGAH\'NAGL FHTAGN.',
    'THE OLDEST AND STRONGEST EMOTION OF MANKIND IS FEAR OF THE UNKNOWN.',
    'THAT IS NOT DEAD WHICH CAN ETERNAL LIE.',
    'DO NOT READ THE INSCRIPTION ABOVE THE ARCH.',
    'IN HIS HOUSE AT R\'LYEH, DEAD CTHULHU WAITS DREAMING.',
  ],
  'the-sandman': [
    'I AM HOPE.',
    'THERE IS POWER IN STORIES. THAT IS WHY THEY ENDURE.',
    'YOU ARE MORTAL. IT IS THE MORTAL LOT TO SUFFER AND DIE.',
    'DREAM IS AN IDEA. AND IDEAS ARE FOREVER.',
    'WHEN THE FIRST LIVING THING EXISTED, I WAS THERE. WHEN THE LAST LIVING THING DIES, MY JOB WILL BE FINISHED.',
  ],
  'persona-5': [
    'STEAL BACK YOUR FUTURE.',
    'TAKE YOUR HEART.',
    'YOU ARE A SLAVE. WANT EMANCIPATION?',
    'LET US START THE GAME.',
    'YOUR REHABILITATION WILL SOON BEGIN.',
    'NO MORE HOLDING BACK!',
  ],
  'the-witcher': [
    'TOSS A COIN TO YOUR WITCHER.',
    'EVIL IS EVIL. LESSER, GREATER, MIDDLING. IF I\'M TO CHOOSE BETWEEN ONE EVIL AND ANOTHER, I\'D RATHER NOT CHOOSE AT ALL.',
    'PEOPLE LINKED BY DESTINY WILL ALWAYS FIND EACH OTHER.',
    'MONSTERS ARE THE ONES WHO MAKE US HUMAN.',
    'THE GREATER GOOD? WHAT IS COMMON, IS NOT NECESSARILY GOOD.',
  ],
  'diablo': [
    'NOT EVEN DEATH CAN SAVE YOU FROM ME.',
    'STAY A WHILE AND LISTEN.',
    'I AM THE LORD OF TERROR. TREMBLE BEFORE ME.',
    'HEROES NEVER DIE... WARRIORS DO.',
    'TERROR SHALL CONSUME YOU.',
  ],
  'soma': [
    'CAN CONSCIOUSNESS SURVIVE WITHOUT A BODY?',
    'IF THE SCAN IS PERFECT, WHERE DOES THE ORIGINAL GO?',
    'THE WAU IS NOT DONE WITH US.',
    'WHAT MAKES YOU HUMAN IS NOT YOUR FLESH — IT IS YOUR MIND.',
    'WE ARE ALL COPIES OF COPIES OF COPIES. WHICH ONE IS REAL?',
  ],
  'stranger-things': [
    'Mornings are for coffee and contemplation.',
    "Friends don't lie.",
    'Mouth breather.',
  ],
  'fatal-frame': [
    'THE CAMERA OBSCURA CAN CAPTURE SPIRITS THE NAKED EYE CANNOT SEE.',
    'DO NOT ENTER THE WATER.',
    'THE VILLAGE OF THE LOST IS WAKING.',
    'SHE LOOKED INTO THE LENS AND SAW SOMETHING LOOKING BACK.',
    'ONLY THE RITUAL MAIDEN CAN STOP THE CALAMITY.',
  ],
  'event-horizon': [
    'WHERE WE ARE GOING, WE DON\'T NEED EYES TO SEE.',
    'LIBERATE TUTEMET EX INFERNIS.',
    'THE SHIP WENT SOMEWHERE. SOMETHING CAME BACK WITH IT.',
    'SAVE YOURSELF FROM HELL.',
    'I CREATE LIFE. AND I DESTROY IT. THAT IS ENOUGH.',
  ],
  'firefly': [
    'YOU CAN\'T TAKE THE SKY FROM ME.',
    'SERENITY FLIGHT SYSTEMS ONLINE.',
    'CARGO SECURED. ENGINE ROOM STABLE.',
    'I AIM TO MISBEHAVE.',
    'WE HAVE DONE THE IMPOSSIBLE, AND THAT MAKES US MIGHTY.',
  ],
  'persona-4': [
    'REACH OUT TO THE TRUTH.',
    "EVERY DAY'S GREAT AT YOUR JUNES!",
    'I AM THOU, THOU ART I.',
  ],
  'persona-3': [
    'THE ARCANA IS THE MEANS BY WHICH ALL IS REVEALED.',
    'DEATH IS NOT A HUNTER UNBEKNOWNST TO ITS PREY.',
    'BURN MY DREAD.',
  ],
  'eve-online': [
    'NEURAL LINK ESTABLISHED.',
    'WARP DRIVE ACTIVE.',
    'CAPSULE SYNCHRONIZATION COMPLETE.',
    'DOCKING REQUEST ACCEPTED.',
    'FLY DANGEROUS. FLY SAFE.',
  ],
  'indiana-jones': [
    'SNAKES. WHY DID IT HAVE TO BE SNAKES.',
    'NOT THE YEARS, HONEY. THE MILEAGE.',
    'THAT BELONGS IN A MUSEUM.',
    'FORTUNE AND GLORY, KID.',
    'X MARKS THE SPOT.',
  ],
  'game-of-thrones': [
    'WHEN YOU PLAY THE GAME OF THRONES, YOU WIN OR YOU DIE.',
    'WINTER IS COMING.',
    'VALAR MORGHULIS.',
    'DRACARYS.',
    'A LANNISTER ALWAYS PAYS HIS DEBTS.',
  ],
  'doom-classic': [
    'KNEE-DEEP IN THE DEAD.',
    'THE ONLY WAY OUT IS THROUGH.',
    'THE SHORES OF HELL.',
    "THERE'S NO TURNING BACK NOW.",
    'HOME AT LAST.',
    'THY FLESH CONSUMED.',
  ],
  'doom-eternal': [
    'THE ONLY THING THEY FEAR... IS YOU.',
    'RIP AND TEAR, UNTIL IT IS DONE.',
    'WARNING: THE SLAYER HAS ENTERED THE FACILITY.',
    'WELCOME HOME, GREAT SLAYER.',
  ],
  'tiny-bunny': [
    'НЕ ХОДИ ТУДА. ЛЕС НЕ ОТПУСТИТ.',
    'ЗАЙЧИК ЖДЁТ В ТЁМНОМ ЛЕСУ.',
    'ТЫ СЛЫШИШЬ? ЧТО-ТО ИДЁТ ЗА ТОБОЙ.',
    'НЕ ОГЛЯДЫВАЙСЯ. ПРОСТО ИДИ.',
    'ТЁМНЫЙ ЛЕС. ЗИМА. ТИШИНА.',
  ],
  'promise-mascot': [
    'ANOTHER DAY, ANOTHER ERRAND.',
    'THE TOWN CAN WAIT A MINUTE.',
    'PICK A TILE. KEEP GOING.',
  ],
  'mortal-kombat': [
    'FINISH HIM!',
    'FLAWLESS VICTORY.',
    'TEST YOUR MIGHT.',
    'GET OVER HERE!',
    'FATALITY.',
  ],
  'nonary-games': [
    'NINE HOURS, NINE PERSONS, NINE DOORS.',
    'WHERE THERE IS SHADOW, THERE IS LIGHT.',
    "I AM RIGHT HERE... I'VE ALWAYS BEEN CLOSE TO YOU.",
  ],
  'life-is-strange': [
    'THIS ACTION WILL HAVE CONSEQUENCES.',
    'I WISH I COULD STAY IN THIS MOMENT FOREVER.',
    'EVERYDAY HEROES.',
    'WHEN A DOOR CLOSES, A WINDOW OPENS.',
    'TIME IS NOT ON YOUR SIDE.',
  ],
  'dragon-age': [
    'IN WAR, VICTORY. IN PEACE, VIGILANCE. IN DEATH, SACRIFICE.',
    'MAGIC EXISTS TO SERVE MAN, AND NEVER TO RULE OVER HIM.',
    'THE BLIGHT HAS COME. THE GREY WARDENS MUST ANSWER.',
    'THERE IS ALWAYS A PRICE TO PAY.',
    'THE DREAD WOLF RISES.',
  ],
  'yakuza': [
    'YO... KIRYU-CHAN!',
    'THE DRAGON OF DOJIMA.',
    'THE MAD DOG OF SHIMANO.',
    "BAKA MITAI (I'VE BEEN A FOOL).",
  ],
  'mirrors-edge': [
    'FAITH. THE CITY NEEDS RUNNERS.',
    'DON\'T LOOK DOWN. KEEP RUNNING.',
    'THE ROOFTOPS ARE OURS.',
    'RED MARKS THE PATH. FOLLOW THE FLOW.',
    'IN A CITY OF GLASS, FREEDOM IS A LEAP OF FAITH.',
  ],
  'tomb-raider': [
    'A SURVIVOR IS BORN.',
    'I AM NOT WHO I WAS BEFORE. BUT I KNOW WHO I AM BECOMING.',
    'THE EXTRAORDINARY IS IN WHAT WE DO, NOT WHO WE ARE.',
    'THE TOMB DOES NOT FORGIVE MISTAKES.',
    'I CAME LOOKING FOR ADVENTURE. I FOUND SOMETHING ELSE ENTIRELY.',
  ],
  'uncharted': [
    'SIC PARVIS MAGNA. GREATNESS FROM SMALL BEGINNINGS.',
    'I AM A MAN OF FORTUNE AND I MUST SEEK MY FORTUNE.',
    'OH CRAP OH CRAP OH CRAP.',
    'KITTY GOT WET.',
    'WELL. I DIDN\'T THINK THAT THROUGH.',
  ],
  'broken-sword': [
    'THE SHADOW OF THE TEMPLARS FALLS ACROSS PARIS.',
    'THERE ARE SOME THINGS MAN WAS NOT MEANT TO KNOW.',
    'I HAD A FEELING THIS WASN\'T GOING TO BE A NORMAL DAY.',
    'THE NEO-TEMPLARS ARE REAL. THE CONSPIRACY RUNS DEEP.',
    'NICO, I THINK WE\'RE IN TROUBLE. AGAIN.',
  ],
  'swl-illuminati': [
    "We're the Illuminati... and we're not done.",
    'Power is our currency, our DNA, our God.',
    'We control the world.',
  ],
  'swl-templar': [
    'The world will founder without structure and discipline.',
    'Our conflict must be a righteous one.',
    'Laws. Tradition. Blood.',
  ],
  'swl-dragon': [
    "It's a thousand coins flung into the air.",
    'We are the hand that makes the toss.',
    'We are the trajectory.',
    'We are the violence in the wind.',
    'What is chaos in theory?',
  ],
  'ac-assassins': [
    'Nothing is true, everything is permitted.',
    'We work in the dark, to serve the light.',
    'Requiescat in pace.',
    'Hide in plain sight.',
  ],
  'ac-templars': [
    'May the Father of Understanding guide us all.',
    'Order. Purpose. Direction. No more than that.',
    "It's an invitation to chaos.",
  ],
  'siren': [
    'Search the Yoshimura house and well.',
    'Hanuda Village.',
    'Sightjack.',
  ],
  'blair-witch': [
    'I AM SO SCARED.',
    'THE MAP IS GONE. JOSH IS GONE.',
    'I SAW SOMETHING STANDING IN THE TREES. IT WAS NOT HUMAN.',
    'STAND IN THE CORNER. DO NOT TURN AROUND.',
    'THE FOOTAGE WAS FOUND A YEAR LATER.',
  ],
  'amnesia': [
    'REMEMBER. YOU CHOSE THIS.',
    'THE SHADOW IS COMING FOR YOU, DANIEL.',
    'DO NOT LOOK THEM IN THE EYES. STAY SANE.',
    'WHAT HAVE YOU DONE TO YOUR SOUL, DANIEL?',
    'THE DARKNESS WILL CONSUME WHAT REMAINS OF YOU.',
  ],
  'predator': [
    'IF IT BLEEDS, WE CAN KILL IT.',
    'WHAT THE HELL ARE YOU?',
    'OVER HERE. TURN AROUND.',
    'THE HUNT BEGINS. THERE IS NO PREY THAT CANNOT BE TAKEN.',
    'YOU ARE ONE UGLY MOTHERF---.',
  ],
  'robocop': [
    'DEAD OR ALIVE, YOU ARE COMING WITH ME.',
    'SERVE THE PUBLIC TRUST. PROTECT THE INNOCENT. UPHOLD THE LAW.',
    'YOUR MOVE, CREEP.',
    'I AM THE LAW.',
    'COME QUIETLY OR THERE WILL BE TROUBLE.',
  ],
  'metal-gear': [
    'KEPT YOU WAITING, HUH?',
    'WE ARE NOT TOOLS OF THE GOVERNMENT OR ANYONE ELSE.',
    'A STRONG MAN DOES NOT NEED TO READ THE FUTURE. HE MAKES HIS OWN.',
    'THE WHOLE WORLD WANTS YOU DEAD, SNAKE.',
    'METAL GEAR?! IT CAN\'T BE!',
  ],
  'parasite-eve': [
    "I don't care if I die. I just want to get through this show.",
    "I'll even sell my soul to the Devil if I have to.",
    'Carnegie Hall. December 24th, 1997.',
  ],
  'wow-horde': [
    'LOK TAR OGAR! VICTORY OR DEATH!',
    'THE HORDE IS NOTHING WITHOUT ITS HONOR.',
    'BLOOD AND THUNDER!',
    'WE WILL NEVER BE SLAVES.',
    'STRENGTH AND HONOR.',
  ],
  'wow-scourge': [
    'FROSTMOURNE HUNGERS.',
    'THERE MUST ALWAYS BE A LICH KING.',
    'YOU ARE PART OF THE SCOURGE NOW.',
    'LET THEM COME. FROSTMOURNE HUNGERS.',
    'ARTHAS. MY SON. WHAT ARE YOU DOING?',
  ],
  'wow-legion': [
    'YOU ARE NOT PREPARED.',
    'THE BURNING LEGION WILL CONSUME ALL.',
    'SARGERAS WILL BURN THIS WORLD.',
    'THE PORTAL IS OPEN. THE INVASION BEGINS.',
    'ALL WILL BE CONSUMED IN FEL FIRE.',
  ],
  'wow-nightelf': [
    'ELUNE ADORE. THE GODDESS WATCHES OVER US.',
    'ISHNU ALAH. GOOD FORTUNE TO YOU.',
    'THE ANCIENT FORESTS REMEMBER.',
    'WE ARE THE SENTINELS. WE DO NOT SLEEP.',
    'TELDRASSIL BURNS. BUT WE ENDURE.',
  ],
  'wow-alliance': [
    'FOR THE ALLIANCE!',
    'THE LIGHT DOES NOT ABANDON ITS CHAMPIONS.',
    'STORMWIND STANDS. THE LION ROARS.',
    'WE WILL NOT LET DARKNESS CONSUME THIS WORLD.',
    'LOK TAR-- WAIT. FOR THE ALLIANCE!',
  ],
  'ff10': [
    'Listen to my story.',
    'This is my story.',
  ],
  'ff14': [
    'Hear. Feel. Think.',
    'A smile better suits a hero.',
  ],
  'ff15': [
    "I've come up with a new recipe!",
    'A king pushes onward always.',
  ],
  'ff6': [
    'I prefer the term treasure hunting!',
    'My life is a chip in your pile.',
    "I'm a god! I'm all-powerful!",
  ],
  'ff7': [
    'Not interested.',
    "Let's mosey.",
    "There ain't no gettin' offa this train we're on.",
  ],
  'ff8': [
    '...Whatever.',
    'Booyaka!',
    'Everything will be fine now...',
  ],
  'ff9': [
    "You don't need a reason to help people.",
    'To be forgotten is worse than death.',
    'How do you prove that you exist...?',
  ],
};

// VALID_THEMES is populated from the main process (which derives it from the CSS
// files on disk — single source of truth). Seeded with THEME_BANNERS keys so
// early-boot calls to applySettings() have a fallback; init() overwrites it
// with the authoritative list fetched via IPC.
let VALID_THEMES = new Set(Object.keys(THEME_BANNERS));

// Display names are shared by regions, Manager and gallery metadata.
const THEME_NAMES = window.QL_THEME_NAMES;
const ALL_THEMES = Object.keys(THEME_BANNERS)
  .sort((a,b) => (THEME_NAMES[a] || a).localeCompare(THEME_NAMES[b] || b));

// ── Boot ─────────────────────────────────────────────────────────────────────
async function init() {
  apps     = await window.api.invoke('get-apps');
  settings = await window.api.invoke('get-settings');

  // Adopt the main process's authoritative theme list (derived from CSS files on disk).
  // Warn on any mismatch between it and THEME_BANNERS — signals a new theme CSS
  // added without a banner entry, or a banner entry for a deleted theme.
  try {
    const mainThemes = await window.api.invoke('get-valid-themes');
    if (Array.isArray(mainThemes) && mainThemes.length) {
      VALID_THEMES = new Set(mainThemes);
      const bannerKeys = new Set(Object.keys(THEME_BANNERS));
      const missingBanners = mainThemes.filter(t => !bannerKeys.has(t));
      const orphanBanners  = [...bannerKeys].filter(t => !VALID_THEMES.has(t));
      if (missingBanners.length) {
        console.warn('[themes] CSS themes with no THEME_BANNERS entry:', missingBanners);
      }
      if (orphanBanners.length) {
        console.warn('[themes] THEME_BANNERS entries with no matching CSS:', orphanBanners);
      }
    }
  } catch (e) {
    console.warn('[themes] get-valid-themes failed, using THEME_BANNERS keys:', e);
  }
  applySettings();
  renderGrid();
  setupDragDrop();
  setupTileReorder();
  setupContextMenu();
  setupUpdateListeners();
  // Listeners are registered: main delivers store messages it held back
  // until now (e.g. the save error from a data file locked at login).
  window.api.invoke('renderer-ready').catch(() => {});
  document.getElementById('header-version').textContent = `v${APP_VERSION}`;
  refreshMissingIcons();
}

async function refreshMissingIcons() {
  if (refreshingIcons) return;
  const missing = apps.filter(a => a.path && (a.path.startsWith('shell:') || /^[a-z][a-z0-9+.-]*:\/\//i.test(a.path)) && !a.iconDataUrl);
  if (missing.length === 0) return;
  refreshingIcons = true;
  try {
    const installed = await window.api.invoke('get-installed-apps');
    let changed = false;
    for (const appItem of missing) {
      const appId = appItem.path.startsWith('shell:') ? appItem.path.replace('shell:AppsFolder\\', '') : appItem.path;
      const match = installed.find(i => i.appId === appId);
      if (match && match.iconDataUrl) {
        appItem.iconDataUrl = match.iconDataUrl;
        changed = true;
      }
    }
    if (changed) {
      await saveApps();
      renderGrid();
    }
  } catch (e) {
    console.error('refreshMissingIcons failed:', e);
  } finally {
    refreshingIcons = false;
  }
}

// ── Render ───────────────────────────────────────────────────────────────────
function renderGrid() {
  const dropHint = $('drop-hint');
  const retainedDraft = window.qlBeforeGridRender ? window.qlBeforeGridRender() : null;

  elAppGrid.innerHTML = '';

  if (apps.length === 0 && !editMode) {
    dropHint.classList.remove('hidden');
  } else {
    dropHint.classList.add('hidden');
  }

  apps.forEach(appItem => elAppGrid.appendChild(createAppTile(appItem)));
  // Re-apply any active type-to-filter after a rebuild — innerHTML='' wiped
  // the .filter-hidden class. (UX Review §6C / I3.)
  if (_filterText) applyFilter();
  // Regions: an empty Column or Row draws its one dashed cell (region.js).
  if (window.qlAfterRender) window.qlAfterRender();
  if (window.qlAfterGridRender) window.qlAfterGridRender(retainedDraft);
}

function createAppTile(appItem) {
  const tile = document.createElement('div');
  tile.className = 'app-tile';
  tile.dataset.id = appItem.id;
  // Keyboard a11y (UX Review §6B / I2): tiles are focusable buttons.
  // role=button advertises the launch semantic; tabindex=0 puts them in
  // the natural Tab order. Arrow-key 2D navigation is wired separately
  // via the gridKeydown handler — it computes column count from layout.
  tile.tabIndex = 0;
  tile.setAttribute('role', 'button');
  tile.setAttribute('aria-label', appItem.name);
  // Cache lowercased name on the tile so applyFilter() reads tile attrs
  // only — eliminates the per-tile O(n) `apps.find` scan that made the
  // type-to-filter loop O(n²) per keystroke. (Senua review M1, 2026-04-25.)
  tile.dataset.nameLower = (appItem.name || '').toLowerCase();

  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'tile-icon-wrap';

  const img = document.createElement('img');
  img.className = 'tile-icon';
  img.src = appItem.iconDataUrl || '';
  img.alt = appItem.name;
  img.draggable = false;
  img.onerror = () => { img.style.visibility = 'hidden'; };

  iconWrapper.appendChild(img);

  if (editMode) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-remove';
    removeBtn.textContent = '✕';
    removeBtn.title = 'Remove';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeApp(appItem.id);
    });
    tile.appendChild(removeBtn);
  }

  const label = document.createElement('span');
  label.className = 'tile-label';
  label.textContent = appItem.name;
  label.title = editMode ? 'Click to rename' : appItem.name;

  if (editMode) {
    label.classList.add('renameable');
    label.addEventListener('click', (e) => {
      e.stopPropagation();
      startRename(appItem, label);
    });
  }

  tile.appendChild(iconWrapper);
  tile.appendChild(label);

  if (!editMode) {
    tile.addEventListener('click', () => {
      if (suppressNextClick || tile.classList.contains("filter-hidden")) return;
      launchApp(appItem.path);
    });
    // Enter/Space launches the focused tile (UX Review §6B). Captured here
    // (not on the grid) so edit-mode tiles don't accidentally launch.
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (tile.classList.contains('filter-hidden')) return;
        // Radial filter Enter belongs to the first match, in item order.
        if (document.body.classList.contains('layout-radial') && _filterText && e.key === 'Enter') return;
        e.preventDefault();
        launchApp(appItem.path);
      }
    });
  }

  // Regions: moved tiles get ↩, broken tiles their state (region.js).
  if (window.qlDecorateTile) window.qlDecorateTile(tile, appItem);
  return tile;
}

function startRename(appItem, labelEl) {
  if (window.qlRadialRename && window.qlRadialRename(appItem)) return;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'rename-input';
  input.value = appItem.name;
  input.maxLength = 40;

  labelEl.replaceWith(input);
  input.focus();
  input.select();

  let cancelled = false;

  async function commit() {
    if (cancelled || input._presentationMoving) return;
    const newName = input.value.trim() || appItem.name;
    appItem.name = newName;
    labelEl.textContent = newName;
    labelEl.title = 'Click to rename';
    input.replaceWith(labelEl);
    await saveApps();
  }

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    // Esc cancels the rename and is consumed: edit mode stays (one Esc, one layer).
    if (e.key === 'Escape') { cancelled = true; input.replaceWith(labelEl); e.preventDefault(); e.stopPropagation(); }
  });
}

// ── Actions ──────────────────────────────────────────────────────────────────
async function launchApp(filePath) {
  await window.api.invoke('launch-app', filePath);
}

function enterEditMode() {
  if (editMode) return;
  editMode = true;
  document.getElementById('edit-bar').classList.remove('hidden');
  renderGrid();
}

function exitEditMode() {
  editMode = false;
  document.getElementById('edit-bar').classList.add('hidden');
  renderGrid();
}

async function addAppFromDialog() {
  try {
    const appItem = await window.api.invoke('add-app-dialog');
    if (!appItem) return;
    apps.push(appItem);
    await saveApps();
    renderGrid();
  } catch (e) {
    console.error('Failed to add app:', e);
  }
}

async function removeApp(id) {
  apps = apps.filter(a => a.id !== id);
  await saveApps();
  renderGrid();
}

async function saveApps() {
  await window.api.invoke('save-apps', apps);
}

// ── Settings ──────────────────────────────────────────────────────────────────
function applySettings() {
  const size = settings.iconSize || 64;
  document.documentElement.style.setProperty('--icon-size', size + 'px');

  // Reduced-motion is OS-or-user driven (UX Review §5). The user setting
  // adds to (does not subtract from) the OS pref — when either is set,
  // the body class is added and ambient infinite animations are suppressed
  // via .reduced-motion overrides in base.css.
  applyReducedMotion();


  const rawTheme = settings.theme || 'cyberpunk';
  const theme = VALID_THEMES.has(rawTheme) ? rawTheme : 'cyberpunk';
  $('theme-stylesheet').href = `styles/themes/${theme}.css`;
  startBannerCycle(theme);
  if (window.qlRadialRefresh) window.qlRadialRefresh();
  if (window.qlDisplayMetricsChanged) window.qlDisplayMetricsChanged();
}

// Apply reduced-motion: union of user setting and OS prefers-reduced-motion.
// The body class drives the CSS overrides (defined in base.css).
function applyReducedMotion() {
  const osPref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const userPref = settings.reducedMotion === true;
  document.body.classList.toggle('reduced-motion', osPref || userPref);
}

// Re-evaluate when the OS pref changes mid-session (rare but possible).
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
  applyReducedMotion();
});

let bannerQuotes = null;
let bannerIdx = 0;
let bannerGen = 0;   // bumped per theme start; a stale async first pick checks it and gives up

// ── Banner fit check (theme spec, foundation A3) ─────────────────────────────
// The banner is one line. A quote wider than the box is skipped: the rotation
// shows the first quote, cyclically from the natural next one, that fits
// (scrollWidth <= clientWidth). If none fits it shows the natural next one, so
// the ellipsis stays as the last resort and the rotation never stops or blanks.
// Measuring sets the text; every caller either measures while the text is
// invisible (the fade-out) or restores the shown quote in the same task, so
// no frame ever paints a candidate.
function bannerQuoteFits(textEl, quote) {
  textEl.textContent = quote;
  return textEl.scrollWidth <= textEl.clientWidth;
}

// Index of the first fitting quote from `start`; leaves that quote in textEl.
function pickFittingQuote(textEl, quotes, start) {
  for (let k = 0; k < quotes.length; k++) {
    const i = (start + k) % quotes.length;
    if (bannerQuoteFits(textEl, quotes[i])) return i;
  }
  textEl.textContent = quotes[start];
  return start;
}

// Resolves once the theme's stylesheet is applied and the banner's fonts are
// loaded, so the first pick measures the theme's own type (bundled fonts use
// font-display: block and lay out with fallback metrics until they arrive).
// Every wait is bounded (2 s for the sheet, 3 s for the fonts), so the pick always happens.
function whenBannerReady(theme, textEl) {
  const link = $('theme-stylesheet');
  const want = `/styles/themes/${theme}.css`;
  const applied = () => {
    try { return !!(link.sheet && link.sheet.href && link.sheet.href.endsWith(want) && link.sheet.cssRules); }
    catch { return false; }
  };
  const bounded = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(r, ms))]);
  // Polled, not the link's load event: Chromium does not fire it reliably when an
  // existing stylesheet link's href changes (seen in the gallery: the theme was
  // applied and no load event came).
  const sheet = new Promise((resolve) => {
    const t0 = performance.now();
    const poll = () => (applied() || performance.now() - t0 > 2000 ? resolve() : setTimeout(poll, 16));
    poll();
  });
  return sheet.then(() => {
    // Fetch the faces the banner text resolves to, then let any other pending load finish.
    const cs = getComputedStyle(textEl);
    const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const load = Promise.resolve().then(() => document.fonts.load(font, textEl.textContent || 'A')).catch(() => null);
    return bounded(load.then(() => document.fonts.ready), 3000);
  });
}

function startBannerCycle(theme) {
  clearInterval(bannerInterval);
  clearTimeout(bannerFadeTimer);
  bannerInterval = null;
  bannerFadeTimer = null;
  bannerQuotes = null;
  const gen = ++bannerGen;

  const quotes = THEME_BANNERS[theme];
  if (!quotes) return;

  const textEl = document.getElementById('theme-banner-text');
  bannerQuotes = quotes;
  bannerIdx = 0;
  textEl.style.opacity = '1';
  textEl.textContent = quotes[bannerIdx];

  if (!idlePaused) scheduleBannerRotation();

  // First pick, once the theme and its fonts are in. Skipped when another theme
  // started meanwhile or the rotation has already moved on (it measures itself).
  whenBannerReady(theme, textEl).catch(() => null).then(() => {
    if (gen !== bannerGen || bannerQuotes !== quotes || bannerIdx !== 0) return;
    bannerIdx = pickFittingQuote(textEl, quotes, 0);
  });
}

function scheduleBannerRotation() {
  clearInterval(bannerInterval);
  bannerInterval = null;
  if (!bannerQuotes) return;
  const quotes = bannerQuotes;
  const textEl = document.getElementById('theme-banner-text');
  bannerInterval = setInterval(() => {
    // Measured now and the shown quote put back in the same task (nothing paints
    // in between). When the pick is the quote already shown (a theme where only
    // one quote fits), the banner stays as it is instead of blinking.
    const shown = bannerIdx;
    const next = pickFittingQuote(textEl, quotes, (shown + 1) % quotes.length);
    textEl.textContent = quotes[shown];
    if (next === shown) return;
    textEl.style.opacity = '0';
    bannerFadeTimer = setTimeout(() => {
      // Re-measured while invisible: the window may have been resized meanwhile.
      bannerIdx = pickFittingQuote(textEl, quotes, next);
      textEl.style.opacity = '1';
    }, 380);
  }, 14000);
}

// ── Idle pause (CPU) ──────────────────────────────────────────────────────────
// Every theme runs infinite CSS animations, and Chromium renders them at the
// display's refresh rate whenever the window is on screen — also when it is
// unfocused or covered by other windows (Chromium doesn't treat this window as
// occluded). While the window is unfocused or hidden, body.ql-paused freezes
// them on their current frame (base.css) and the banner stops rotating; both
// resume where they left off on focus.
let idlePaused = false;
// A region sits on the desktop all day: it animates only while the pointer
// is over it or it has keyboard focus (regions spec, "Changes to today's window").
let pointerInside = false;
let lastFocused = false;

function updateIdlePause(e) {
  // Trust the event itself where there is one; hasFocus() covers the initial
  // state and visibilitychange.
  const type = e && e.type;
  const focused = type === 'blur' ? false : type === 'focus' ? true
    : (type === 'mouseenter' || type === 'mouseleave') ? lastFocused : document.hasFocus();
  lastFocused = focused;
  if (type === 'mouseenter') pointerInside = true;
  if (type === 'mouseleave') pointerInside = false;
  const paused = document.hidden || (!focused && !pointerInside);
  if (paused === idlePaused) return;
  idlePaused = paused;
  document.body.classList.toggle('ql-paused', paused);
  if (paused) {
    // Stop the rotation; an in-flight fade (≤380 ms) still completes, so the
    // banner never freezes blank.
    clearInterval(bannerInterval);
    bannerInterval = null;
  } else {
    scheduleBannerRotation();
  }
}

window.addEventListener('focus', updateIdlePause);
window.addEventListener('blur', updateIdlePause);
document.addEventListener('visibilitychange', updateIdlePause);
document.documentElement.addEventListener('mouseenter', updateIdlePause);
document.documentElement.addEventListener('mouseleave', updateIdlePause);
updateIdlePause();

// ── Drag & Drop ────────────────────────────────────────────────────────────────
function setupDragDrop() {
  const body = document.body;
  // Drag-enter counter — tracks nested enter/leave transitions across child
  // elements so we only remove .drag-over when the cursor leaves the window
  // entirely (not when it crosses an internal boundary).
  let dragDepth = 0;

  body.addEventListener('dragenter', () => {
    dragDepth++;
    elApp.classList.add('drag-over');
  });

  body.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });

  body.addEventListener('dragleave', () => {
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) {
      elApp.classList.remove('drag-over');
    }
  });

  body.addEventListener('drop', async (e) => {
    e.preventDefault();
    dragDepth = 0;
    elApp.classList.remove('drag-over');
    try {
      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        const filePath = window.api.getPathForFile(file);
        const lower = filePath.toLowerCase();
        if (lower.endsWith('.exe') || lower.endsWith('.lnk')) {
          const appItem = await window.api.invoke('add-app-from-path', filePath);
          if (appItem && !apps.find(a => a.path === appItem.path)) {
            apps.push(appItem);
          }
        }
      }
      await saveApps();
      renderGrid();
    } catch (err) {
      console.error('Drop failed:', err);
    }
  });
}

// ── Tile drag-to-reorder ──────────────────────────────────────────────────────
function setupTileReorder() {
  elAppGrid.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    const tile = e.target.closest('.app-tile');
    if (!tile) return;
    // Let remove button and rename label handle their own clicks
    if (e.target.closest('.btn-remove, .btn-move-back') || e.target.closest('.renameable') || e.target.closest('.rename-input')) return;

    e.preventDefault(); // prevent text selection

    reorderState = {
      srcEl: tile,
      ghost: null,
      startX: e.clientX,
      startY: e.clientY,
      dragging: false
    };
    // Registered per-drag so they don't accumulate across calls
    document.addEventListener('mousemove', handleReorderMove);
    document.addEventListener('mouseup', handleReorderUp);
  });

  window.addEventListener('blur', cancelReorder);
}

function handleReorderMove(e) {
  if (!reorderState) return;

  if (!reorderState.dragging) {
    if (Math.hypot(e.clientX - reorderState.startX, e.clientY - reorderState.startY) < 6) return;

    // Cross the threshold — begin drag
    reorderState.dragging = true;
    document.body.classList.add('ql-dragging');

    const src = reorderState.srcEl;
    const rect = src.getBoundingClientRect();

    // Build ghost from live tile
    const ghost = src.cloneNode(true);
    ghost.removeAttribute('data-id');
    ghost.className = 'app-tile drag-ghost';
    ghost.style.width  = rect.width  + 'px';
    ghost.style.height = rect.height + 'px';
    ghost.style.left   = rect.left   + 'px';
    ghost.style.top    = rect.top    + 'px';
    document.body.appendChild(ghost);
    reorderState.ghost = ghost;

    src.classList.add('tile-drag-source');
    // Regions: the tile may be carried to another region (region.js).
    if (window.qlTileDragOut) window.qlTileDragOut.start(reorderState);
  }

  // Move ghost to cursor (centered)
  const g = reorderState.ghost;
  g.style.left = (e.clientX - parseFloat(g.style.width)  / 2) + 'px';
  g.style.top  = (e.clientY - parseFloat(g.style.height) / 2) + 'px';

  // Outside this window: the main process relays the drag to the region
  // under the pointer (region.js), so nothing is reordered here.
  if (window.qlTileDragOut && window.qlTileDragOut.move(e, reorderState)) return;

  // Find which tile the cursor is over (ghost has pointer-events:none)
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const overTile = el?.closest('.app-tile');

  if (overTile && elAppGrid.contains(overTile) && overTile !== reorderState.srcEl) {
    const all = [...elAppGrid.querySelectorAll('.app-tile')];
    const srcPos  = all.indexOf(reorderState.srcEl);
    const overPos = all.indexOf(overTile);
    if (srcPos !== overPos) {
      // Shift: move the source placeholder to its new slot
      if (overPos > srcPos) overTile.after(reorderState.srcEl);
      else                  overTile.before(reorderState.srcEl);
      if (window.qlRadialRefresh) window.qlRadialRefresh();
    }
  }
}

async function handleReorderUp(e) {
  document.removeEventListener('mousemove', handleReorderMove);
  document.removeEventListener('mouseup', handleReorderUp);
  if (!reorderState) return;
  const state = reorderState;
  reorderState = null;

  document.body.classList.remove('ql-dragging');

  if (!state.dragging) return;

  // Kill ghost, restore tile
  state.ghost?.remove();
  state.srcEl.classList.remove('tile-drag-source');

  // Suppress the click that fires immediately after mouseup. Clear on the very
  // next click (capture phase, one-shot) instead of an arbitrary timeout — the
  // click always follows synchronously, so no fallback timer is needed.
  suppressNextClick = true;
  document.addEventListener('click', () => { suppressNextClick = false; }, { once: true, capture: true });

  // Released outside this window: it lands in the region under the pointer,
  // or the drag is cancelled and the tile stays (region.js).
  if (window.qlTileDragOut && window.qlTileDragOut.end(e, state)) return;

  // Derive new order from DOM positions
  const allTiles = [...elAppGrid.querySelectorAll('.app-tile')];
  const newIndex = allTiles.indexOf(state.srcEl);
  const oldIndex = apps.findIndex(a => a.id === state.srcEl.dataset.id);

  if (newIndex !== -1 && oldIndex !== -1 && newIndex !== oldIndex) {
    const [moved] = apps.splice(oldIndex, 1);
    apps.splice(newIndex, 0, moved);
    await saveApps();
  }

  renderGrid(); // canonical re-render from apps array
}

function cancelReorder() {
  document.removeEventListener('mousemove', handleReorderMove);
  document.removeEventListener('mouseup', handleReorderUp);
  if (window.qlTileDragOut) window.qlTileDragOut.cancel();
  if (!reorderState?.dragging) { reorderState = null; return; }
  reorderState.ghost?.remove();
  reorderState.srcEl.classList.remove('tile-drag-source');
  document.body.classList.remove('ql-dragging');
  reorderState = null;
  renderGrid(); // restore original order
}

// ── Grid keyboard navigation and type-to-filter ─────────────────
// (UX Review §6B–D / I2–I3 + P3.) Single keydown router on document so we
// can interleave: arrow-key grid nav, in-grid type-to-filter, '?' cheat-sheet.
let _filterText = '';

function getVisibleTiles() {
  return [...elAppGrid.querySelectorAll('.app-tile:not(.filter-hidden)')];
}

function updateFilterChip() {
  const chip = $('filter-chip');
  if (!chip) return;
  if (_filterText) {
    $('filter-chip-text').textContent = _filterText.toUpperCase();
    chip.classList.remove('hidden');
  } else {
    chip.classList.add('hidden');
  }
}

function applyFilter() {
  const q = _filterText.toLowerCase();
  // Read the precomputed `dataset.nameLower` cached at tile-creation time
  // (see createAppTile). No `apps.find` scan inside the loop — keystroke
  // cost is now O(n) in tile count rather than O(n²). (Senua review M1.)
  const tiles = [...elAppGrid.querySelectorAll('.app-tile')];
  for (const t of tiles) {
    const nameLower = t.dataset.nameLower || '';
    const match = !q || nameLower.includes(q);
    t.classList.toggle('filter-hidden', !match);
    if (document.body.classList.contains('layout-radial')) {
      t.tabIndex = match ? 0 : -1;
      t.setAttribute('aria-disabled', String(!match));
      for (const b of t.querySelectorAll('button')) b.tabIndex = match ? 0 : -1;
    }
  }
  updateFilterChip();
  if (window.qlRadialRefresh) window.qlRadialRefresh();
}

function setFilter(text) {
  _filterText = text;
  applyFilter();
}

function clearFilter() {
  if (!_filterText) return;
  _filterText = '';
  applyFilter();
}

// Compute the number of grid columns from the actual rendered layout —
// gracefully handles the user dragging the window narrow / wide and the
// icon-size slider. Uses the second-row tile's offsetTop discontinuity.
function computeColumnCount(tiles) {
  if (tiles.length <= 1) return tiles.length || 1;
  const firstTop = tiles[0].offsetTop;
  let cols = 1;
  for (let i = 1; i < tiles.length; i++) {
    if (tiles[i].offsetTop !== firstTop) break;
    cols++;
  }
  return cols;
}

function focusTileAtIndex(tiles, idx) {
  if (!tiles.length) return;
  const i = Math.max(0, Math.min(tiles.length - 1, idx));
  tiles[i].focus();
}

function moveTileFocus(direction) {
  const tiles = getVisibleTiles();
  if (!tiles.length) return;
  const focused = document.activeElement;
  const cur = tiles.indexOf(focused);
  if (cur === -1) {
    focusTileAtIndex(tiles, 0);
    return;
  }
  const cols = computeColumnCount(tiles);
  let next = cur;
  if (direction === 'left')  next = cur - 1;
  if (direction === 'right') next = cur + 1;
  if (direction === 'up')    next = cur - cols;
  if (direction === 'down')  next = cur + cols;
  if (next >= 0 && next < tiles.length) focusTileAtIndex(tiles, next);
}

// Single source of truth for app-level keydown. Document-level so we catch
// keys when no specific element has focus. Inputs (text fields, settings
// inputs) opt out via the `editingText` early-return.
document.addEventListener('keydown', (e) => {
  // IME composition guard (Senua review M2, 2026-04-25): on CJK / dead-key
  // layouts the window receives composition events AND keydown for each
  // constituent keystroke. Skip every keypath consequence (filter,
  // navigation, escape) while the IME is composing.
  if (e.isComposing || e.keyCode === 229) return;

  // Keys that must always pass through to native handlers in text fields
  const tag = (e.target && e.target.tagName) || '';
  const editingText = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable);

  // Escape: one press undoes exactly one layer, the innermost present, and
  // nothing else sees it (picker behaviour spec 2026-10-02, Addendum A.2).
  // Inner layers that consume their own Esc before it gets here: IME
  // composition (above), hotkey recording, the open skin list, the rename input.
  // This is the only document-level Esc handler.
  if (e.key === 'Escape') {
    if (_filterText) { clearFilter(); e.preventDefault(); return; }
    if (editMode) { exitEditMode(); e.preventDefault(); return; }
    return; // nothing to undo: Esc does nothing (it never hides the window)
  }

  // Beyond here, only react when no overlay is open and we're not in a text
  // field — type-to-filter and arrow nav must not interfere with settings.
  if (editingText) return;

  // Arrow keys — grid 2D nav
  if (e.key === 'ArrowLeft')  { moveTileFocus('left');  e.preventDefault(); return; }
  if (e.key === 'ArrowRight') { moveTileFocus('right'); e.preventDefault(); return; }
  if (e.key === 'ArrowUp')    { moveTileFocus('up');    e.preventDefault(); return; }
  if (e.key === 'ArrowDown')  { moveTileFocus('down');  e.preventDefault(); return; }

  // Enter / Space launch handled per-tile; if no tile is focused but a
  // filter is active and Enter is pressed, launch the first visible tile.
  if (e.key === 'Enter' && _filterText) {
    const visible = getVisibleTiles();
    if (visible.length) {
      const id = visible[0].dataset.id;
      const appItem = apps.find(a => a.id === id);
      if (appItem) {
        launchApp(appItem.path);
        e.preventDefault();
      }
    }
    return;
  }

  // Backspace edits filter
  if (e.key === 'Backspace' && _filterText) {
    setFilter(_filterText.slice(0, -1));
    e.preventDefault();
    return;
  }

  // Type-to-filter: printable keys with no Ctrl/Alt/Meta modifiers.
  // (Shift is fine — for typed letters Shift produces uppercase.)
  if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
    setFilter(_filterText + e.key);
    e.preventDefault();
    return;
  }
});

// Filter chip × button
(function () {
  const btn = $('filter-chip-clear');
  if (btn) btn.addEventListener('click', () => clearFilter());
})();

// ── Context menu (right-click → edit mode) ────────────────────────────────────
function setupContextMenu() {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (!editMode) {
      enterEditMode();
    }
  });
  // Esc for edit mode lives in the document keydown handler's Escape ladder
  // (one handler, one layer per press).
}

// ── Update banner ─────────────────────────────────────────────────────────────
// setupUpdateListeners is called exactly once (from init()), so tracking the
// unsubscribe callbacks served no purpose — inline the subscriptions.
function setupUpdateListeners() {
  // The updater's messages are the banner's update layer (fix-pass addendum C5).
  window.api.on('update-checking', () => {
    qlBanner.setUpdate('CHECKING FOR UPDATES...', []);
  });
  window.api.on('update-available', (info) => {
    qlBanner.setUpdate(
      `UPDATE AVAILABLE — v${info.version}`,
      [{ label: 'DOWNLOAD', action: 'download' }]
    );
  });
  window.api.on('update-progress', (pct) => {
    qlBanner.updateProgress(pct);
  });
  window.api.on('update-ready', () => {
    qlBanner.setUpdate(
      'UPDATE READY — WILL INSTALL AND RESTART',
      [{ label: 'INSTALL NOW', action: 'install' }]
    );
  });
  window.api.on('update-not-available', () => {
    qlBanner.setUpdate('SYSTEM IS UP TO DATE', [], 3000);
  });
  window.api.on('update-error', (msg) => {
    qlBanner.setUpdate(`UPDATE ERROR: ${msg}`, [], 6000);
    console.warn('Update error:', msg);
  });
  // Every other message is a notice: 8 s, its own ✕; the update message comes back after it.
  window.api.on('store-save-error', () => {
    showNotice('SAVE ERROR — SETTINGS MAY NOT PERSIST');
    console.error('Store save failed');
  });
  // The data file became readable mid-session and main merged it with this
  // session's changes: adopt the merged library and settings. The ack goes
  // out synchronously right after adopting, so main knows every earlier save
  // from here was based on the old copy.
  window.api.on('store-reloaded', ({ seq, apps: mergedApps, settings: mergedSettings }) => {
    apps = Array.isArray(mergedApps) ? mergedApps : apps;
    settings = mergedSettings && typeof mergedSettings === 'object' ? mergedSettings : settings;
    window.api.invoke('store-reload-ack', seq).catch(() => {});
    applySettings();
    renderGrid();
  });
  // Surface launch failures (missing target, exec error) — previously silent.
  // Per UX Review §10 / Critical C3 (NN/g: help users recognize, diagnose,
  // and recover from errors). Truncate long names so the banner stays one line.
  window.api.on('launch-error', ({ name, reason }) => {
    const safeName = String(name || '').slice(0, 60);
    showNotice(`COULD NOT LAUNCH "${safeName}" — ${reason}`);
    console.warn('Launch error:', reason, name);
  });

  // Settings changed in the main process (tray checkbox, the Manager, or this
  // region's theme changed elsewhere): re-read and re-apply them.
  window.api.on('settings-changed-externally', async () => {
    settings = await window.api.invoke('get-settings');
    applySettings();
  });
}

// The banner slot draws one of its two layers (fix-pass addendum C5; banner-layers.js).
// The notice layer's text and ✕ are in --text (base.css, #update-banner.notice); the
// update layer keeps its look. The layer not drawn is not in the DOM at all.
function drawBanner(view) {
  const banner = $('update-banner');
  const actionsEl = $('update-actions');
  if (!view) {
    banner.title = '';
    banner.classList.add('hidden');
    banner.classList.remove('notice');
    elUpdateText.textContent = '';
    actionsEl.innerHTML = '';
    return;
  }
  elUpdateText.textContent = view.text;
  // A Column draws only the update layer's buttons: its message is the slot's tooltip (M4 rulings Q10).
  banner.title = view.title || (view.layer === 'update' ? view.text : '');
  banner.classList.toggle('notice', view.layer === 'notice');
  actionsEl.innerHTML = '';

  view.actions.forEach(({ label, action, disabled }) => {
    const btn = document.createElement('button');
    btn.className = 'update-btn';
    btn.textContent = label;
    btn.disabled = !!disabled;
    btn.addEventListener('click', async () => {
      if (action === 'download') {
        qlBanner.markAction('download', { label: 'DOWNLOADING...', disabled: true });
        await window.api.invoke('download-update');
      } else if (action === 'install') {
        await window.api.invoke('install-update');
      }
    });
    actionsEl.appendChild(btn);
  });

  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'update-btn update-dismiss';
  dismissBtn.textContent = '✕';
  dismissBtn.title = 'Dismiss';
  dismissBtn.setAttribute('aria-label', 'Dismiss');
  dismissBtn.addEventListener('click', () => qlBanner.close(view.layer));
  actionsEl.appendChild(dismissBtn);

  banner.classList.remove('hidden');
}

const qlBanner = QL_BANNER.createBanner({
  draw: drawBanner,
  // Per UX Review §7: the update message's ✕ clears the tray icon's update-available
  // indicator. The main process owns the tray state; fire-and-forget, ignoring
  // rejections (only failure mode is "main process gone"). A notice never calls it (C5).
  dismissUpdate: () => { try { window.api.invoke('dismiss-update').catch(() => {}); } catch { /* noop */ } },
});

/** A notice in the banner slot (a drop's notice, a launch error, SAVE ERROR): 8 s, its own ✕. */
function showNotice(text) {
  if (window.qlRadialNotice && window.qlRadialNotice(text)) return;
  qlBanner.showNotice(text);
}

// ── Button wiring ─────────────────────────────────────────────────────────────
// Settings, the installed-app picker and the cheat-sheet live in the Manager
// window (regions spec 8); a region opens it.
$('btn-settings').addEventListener('click', () => {
  window.api.invoke('region:open-manager', { view: 'settings' });
});

$('btn-hide').addEventListener('click', () => {
  window.api.invoke('hide-window');
});

$('btn-add-edit').addEventListener('click', addAppFromDialog);
$('btn-add-installed').addEventListener('click', () => {
  window.api.invoke('region:open-manager', { view: 'picker' });
});
$('btn-done-edit').addEventListener('click', exitEditMode);

$('btn-random-theme').addEventListener('click', async () => {
  const current = settings.theme || 'cyberpunk';
  const others = ALL_THEMES.filter(t => t !== current);
  settings.theme = others[Math.floor(Math.random() * others.length)];
  applySettings();
  await window.api.invoke('save-settings', settings);
});

// ── Cleanup on unload ─────────────────────────────────────────────────────────
window.addEventListener('beforeunload', () => {
  clearInterval(bannerInterval);
  clearTimeout(bannerFadeTimer);
  qlBanner.destroy();
});

// ── Start ─────────────────────────────────────────────────────────────────────
init();
