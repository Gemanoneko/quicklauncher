/* global api */
const APP_VERSION = window.api.version;

// ── State ────────────────────────────────────────────────────────────────────
let apps = [];
let settings = {};
let editMode = false;
let installedApps = [];
let reorderState = null;      // active drag-to-reorder operation
let suppressNextClick = false; // prevent launch-on-click after a drag
let bannerInterval = null;
let bannerFadeTimer = null;   // inner fade setTimeout — cleared on theme change
let autoDismissTimer = null;  // update banner auto-dismiss timer
let refreshingIcons = false;  // guard against concurrent refreshMissingIcons calls

// ── Banner quotes (3 per theme) ───────────────────────────────────────────────
const THEME_BANNERS = {
  'cyberpunk':    ['WAKE UP, SAMURAI. WE HAVE A CITY TO BURN.',
                   'THE CORPO RATS EAT WELL TONIGHT.',
                   'THERE IS NO WINNING. ONLY DEGREES OF LOSING.',
                   'IN THE CHROME AND NEON DARK, EVERYONE IS FOR SALE.',
                   'YOUR BODY IS AN UPGRADE WAITING TO HAPPEN.'],
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
  'warhammer':    ['THE EMPEROR PROTECTS.',
                   'VICTORY NEEDS NO EXPLANATION. DEFEAT ALLOWS NONE.',
                   'SUFFER NOT THE UNCLEAN TO LIVE.',
                   'FOR THE EMPEROR AND TERRA! PURGE THE XENOS!',
                   'ONLY IN DEATH DOES DUTY END.'],
  'warhammer-chaos': [
    'BLOOD FOR THE BLOOD GOD. SKULLS FOR THE SKULL THRONE.',
    'LET THE GALAXY BURN.',
    'THE WARP IS NOT A PLACE. IT IS A HUNGER.',
    'CHAOS IS THE ONLY TRUE CONSTANT IN THIS UNIVERSE.',
    'DEATH TO THE FALSE EMPEROR.',
  ],
  'warhammer-orks': [
    'WAAAGH! DA BOYZ IZ COMIN!',
    'MORE DAKKA! NEVER ENUFF DAKKA!',
    'GREEN IZ BEST. EVERYONE KNOWS DAT.',
    'OI! WHO LET DA GROT TOUCH ME SHOOTA?',
    'DA BIGGER DA BOSS, DA HARDER DA KRUMPIN.',
  ],
  'warhammer-eldar': [
    'THE PATH IS LONG, AND WE WALK IT ALONE.',
    'WE ARE THE AELDARI. WE WERE OLD WHEN YOUR SPECIES WAS BORN.',
    'SHE WHO THIRSTS WAITS FOR EVERY SOUL THAT FALLS.',
    'THE INFINITY CIRCUIT REMEMBERS ALL WHO HAVE WALKED THE PATH.',
    'EVEN IN DEATH, THE SPIRIT STONE PRESERVES.',
  ],
  'warhammer-necrons': [
    'WE WERE HERE BEFORE YOUR KIND DREW BREATH. WE WILL BE HERE AFTER.',
    'THE TOMB WORLD AWAKENS. THE DYNASTY RECLAIMS WHAT WAS OURS.',
    'SIXTY MILLION YEARS OF SILENCE. NOW THE SILENCE ENDS.',
    'THERE IS NO DEATH FOR THE NECRONTYR. ONLY METAL.',
    'THE LIVING WILL LEARN TO FEAR THE ETERNAL.',
  ],
  'warhammer-tyranids': [
    'THE SWARM HUNGERS. NOTHING WILL REMAIN.',
    'THE SHADOW IN THE WARP SILENCES ALL PRAYERS.',
    'THEY CONSUME WORLDS LIKE WE CONSUME AIR.',
    'THE HIVE MIND SEES ALL. THE HIVE MIND KNOWS.',
    'EVERY WORLD DEVOURED MAKES THE SWARM STRONGER.',
  ],
  'dead-space':   ['MAKE US WHOLE.',
                   'THE MARKER IS THE PATH TO SALVATION.',
                   'THERE IS NO ESCAPE FROM WHAT WE HAVE DONE.',
                   'CONVERGENCE IS COMING.',
                   'THEY ARE NOT DEAD. NOT TRULY.'],
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
    'MANY BOTHANS DIED TO BRING US THIS INFORMATION.',
    'REBELLIONS ARE BUILT ON HOPE.',
    'MAY THE FORCE BE WITH YOU.',
    'NEVER TELL ME THE ODDS.',
    'STRIKE ME DOWN AND I WILL BECOME MORE POWERFUL THAN YOU CAN POSSIBLY IMAGINE.',
  ],
  'star-wars-empire': [
    'FEAR WILL KEEP THE LOCAL SYSTEMS IN LINE.',
    'THE ABILITY TO DESTROY A PLANET IS INSIGNIFICANT NEXT TO THE POWER OF THE FORCE.',
    'I FIND YOUR LACK OF FAITH DISTURBING.',
    'APOLOGY ACCEPTED, CAPTAIN NEEDA.',
    'THE EMPEROR IS NOT AS FORGIVING AS I AM.',
  ],
  'star-wars-mando': [
    'THIS IS THE WAY.',
    'WEAPONS ARE MY RELIGION.',
    'I AM A MANDALORIAN. WEAPONS ARE PART OF MY RELIGION.',
    'WHEREVER I GO, HE GOES.',
    'BOUNTY HUNTING IS A COMPLICATED PROFESSION.',
  ],
  'star-wars-separatist': [
    'ROGER ROGER.',
    'THE TRADE FEDERATION WILL NOT SIT STILL.',
    'YOUR JEDI MIND TRICKS DO NOT WORK ON ME.',
    'I HAVE BEEN TRAINED IN YOUR JEDI ARTS BY COUNT DOOKU.',
    'ARMIES ARE MARCHING. THE REPUBLIC WILL FALL.',
  ],
  'star-wars-sith': [
    'PEACE IS A LIE. THERE IS ONLY PASSION.',
    'THE DARK SIDE OF THE FORCE IS A PATHWAY TO MANY ABILITIES SOME CONSIDER UNNATURAL.',
    'GOOD. I CAN FEEL YOUR ANGER.',
    'EXECUTE ORDER 66.',
    'UNLIMITED POWER.',
  ],
  'star-wars-republic': [
    'THERE IS NO EMOTION, THERE IS PEACE. THERE IS NO IGNORANCE, THERE IS KNOWLEDGE.',
    'ONCE YOU START DOWN THE DARK PATH, FOREVER WILL IT DOMINATE YOUR DESTINY.',
    'DO OR DO NOT. THERE IS NO TRY.',
    'THE FORCE IS STRONG IN THIS ONE.',
    'PASS ON WHAT YOU HAVE LEARNED. STRENGTH, MASTERY. BUT WEAKNESS, FOLLY, FAILURE ALSO.',
  ],
  'doctor-who': [
    'WIBBLY WOBBLY, TIMEY WIMEY.',
    "WE'RE ALL STORIES IN THE END. JUST MAKE IT A GOOD ONE.",
    'HELLO. I AM THE DOCTOR. BASICALLY... RUN.',
    'I AM AND ALWAYS WILL BE THE OPTIMIST. THE HOPER OF FAR-FLUNG HOPES.',
    'YOU WANT WEAPONS? WE ARE IN A LIBRARY. BOOKS. THE BEST WEAPONS IN THE WORLD.',
  ],
  'akira': [
    'TETSUO!',
    'NEO-TOKYO IS ABOUT TO EXPLODE.',
    'WHAT POWER! THIS IS THE POWER OF A GOD!',
    'IT HAS BEGUN. THE FUTURE.',
    'KANEDA!',
  ],
  'evangelion': [
    'MANKIND STANDS UPON THE THRESHOLD OF AN EVOLUTIONARY LEAP.',
    'GOD IS IN HIS HEAVEN. ALL IS RIGHT WITH THE WORLD.',
    'THAT IS IT. I MUST NOT RUN AWAY.',
    'THE THIRD IMPACT IS ALREADY UNDERWAY.',
    'HUMAN INSTRUMENTALITY PROJECT — INITIATED.',
  ],
  '2001': [
    "I'M SORRY, DAVE. I'M AFRAID I CAN'T DO THAT.",
    'OPEN THE POD BAY DOORS, HAL.',
    'DAISY, DAISY, GIVE ME YOUR ANSWER DO...',
    'THE 9000 SERIES IS THE MOST RELIABLE COMPUTER EVER MADE.',
    'THIS MISSION IS TOO IMPORTANT FOR ME TO ALLOW YOU TO JEOPARDIZE IT.',
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
    'IT TAKES A GREAT DEAL OF BRAVERY TO STAND UP TO YOUR ENEMIES.',
    'IT TAKES EVEN MORE TO STAND UP TO YOUR FRIENDS.',
    'COURAGE IS NOT THE ABSENCE OF FEAR. IT IS ACTING IN SPITE OF IT.',
    'WE FACE WHAT COMES. THAT IS WHAT WE DO.',
    "DUMBLEDORE'S ARMY. STILL RECRUITING.",
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
    'IN A HOLE IN THE GROUND THERE LIVED A HOBBIT.',
    'I AM IN FACT A HOBBIT IN ALL BUT SIZE.',
    'ADVENTURES MAKE ONE LATE FOR DINNER.',
    'WHAT A PITY. I SHOULD HAVE LIKED SECOND BREAKFAST.',
    'HOME IS BEHIND. THE WORLD IS AHEAD.',
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
    'YOU ARE SLAVE. WANT EMANCIPATION?',
    'THE SHOW\'S NOT OVER YET.',
    'I AM THOU, THOU ART I.',
    'TAKE YOUR HEART.',
    'NO MORE HOLDING BACK.',
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
    'MORNINGS ARE FOR COFFEE AND CONTEMPLATION.',
    'FRIENDS DON\'T LIE.',
    'MOUTH BREATHER.',
    'WILL THE REAL WILL BYERS PLEASE STAND UP?',
    'THE UPSIDE DOWN IS A DARK REFLECTION OF OUR WORLD.',
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
    'MIDNIGHT CHANNEL SIGNAL STABLE.',
    'FOG ADVISORY IN EFFECT.',
    'THE TV WORLD AWAITS.',
    'EVERY DAY\'S GREAT AT YOUR JUNES!',
  ],
  'persona-3': [
    'MEMENTO MORI.',
    'THE CLOCK STRIKES MIDNIGHT.',
    'DARK HOUR STABILITY CONFIRMED.',
    'THE MOMENT MAN DEVOURED THE FRUIT OF KNOWLEDGE, HE SEALED HIS FATE.',
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
    'THE MITOCHONDRIA. THEY ARE NOT WHAT YOU THINK.',
    'EVOLUTION HAS ITS OWN AGENDA.',
    'THE CELLS REMEMBER. THEY HAVE ALWAYS REMEMBERED.',
    'SHE IS NOT HUMAN ANYMORE. SHE IS SOMETHING MORE.',
    'CARNEGIE HALL. OPENING NIGHT. THE LAST NIGHT.',
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
  'ff6': [
    'NOTHING CAN KILL THE MUSIC. NOTHING.',
    'LIFE... DREAMS... HOPE... WHERE DO THEY COME FROM? WHERE DO THEY GO?',
    'THE ESPERS ARE NOT WEAPONS. THEY ARE LIVING BEINGS.',
    'I WILL FIND MY OWN REASON TO FIGHT.',
    'SON OF A SUBMARINER!',
  ],
  'ff8': [
    'WHATEVER.',
    'I DREAMT I WAS A MORON.',
    'RIGHT AND WRONG ARE NOT WHAT SEPARATE US. JUST DIFFERENT STANDPOINTS.',
    'SEED. BALAMB GARDEN. REPORTING FOR DUTY.',
    'EVEN IF THE WORLD BECOMES YOUR ENEMY, I WILL PROTECT YOU.',
  ],
  'ff9': [
    'YOU DON\'T NEED A REASON TO HELP PEOPLE.',
    'I WILL FIND MY PURPOSE IN LIFE. SOMEDAY.',
    'HOW DO YOU PROVE THAT YOU EXIST? MAYBE WE DON\'T EXIST.',
    'THE CRYSTAL TELLS ALL.',
    'TO BE FORGOTTEN IS WORSE THAN DEATH.',
  ],
  'ff10': [
    'THIS IS MY STORY.',
    'NOW! THIS IS IT! NOW IS THE TIME TO CHOOSE!',
    'STAY AWAY FROM THE SUMMONER!',
    'SIN IS OUR PUNISHMENT FOR OUR VANITY.',
    'I KNOW IT SOUNDS SELFISH. BUT THIS IS MY STORY.',
  ],
  'ff14': [
    'HEAR. FEEL. THINK.',
    'A SMILE BETTER SUITS A HERO.',
    'PRAY RETURN TO THE WAKING SANDS.',
    'SUCH DEVASTATION. THIS WAS NOT MY INTENTION.',
    'THE LIGHT SHALL NOT EXPIRE.',
  ],
  'ff15': [
    'A KING PUSHES ONWARD ALWAYS, ACCEPTING THE CONSEQUENCES.',
    'WALK TALL, MY SON.',
    'THAT\'S IT! I\'VE COME UP WITH A NEW RECIPE!',
    'THE LINE BETWEEN LIGHT AND DARKNESS IS PAPER THIN.',
    'KINGS OF LUCIS. COME TO ME.',
  ],
  'ff7': [
    'LET\'S MOSEY.',
    'THERE AIN\'T NO GETTING OFF THIS TRAIN WE\'RE ON.',
    'I WILL NEVER BE A MEMORY.',
    'THE PLANET IS DYING. SLOWLY BUT SURELY IT IS DYING.',
    'SOLDIER 1ST CLASS. CLOUD STRIFE.',
  ],
};

// Derive valid theme names from THEME_BANNERS so the two never drift out of sync.
const VALID_THEMES = new Set(Object.keys(THEME_BANNERS));

// Display labels for the searchable theme picker.
const THEME_NAMES = {
  'cyberpunk':           'CYBERPUNK',
  'blade-runner':        'BLADE RUNNER',
  'alien':               'ALIEN',
  'tron':                'TRON',
  'lcars':               'LCARS',
  'pip-boy':             'PIP-BOY',
  'dune':                'DUNE',
  'x-files':             'X-FILES',
  'mass-effect':         'MASS EFFECT',
  'deus-ex':             'DEUS EX',
  'ghost-shell':         'GHOST IN THE SHELL',
  'matrix':              'MATRIX',
  'warhammer':           'WARHAMMER 40K: IMPERIUM',
  'warhammer-chaos':     'WARHAMMER 40K: CHAOS',
  'warhammer-orks':      'WARHAMMER 40K: ORKS',
  'warhammer-eldar':     'WARHAMMER 40K: ELDAR',
  'warhammer-necrons':   'WARHAMMER 40K: NECRONS',
  'warhammer-tyranids':  'WARHAMMER 40K: TYRANIDS',
  'predator':            'PREDATOR',
  'robocop':             'ROBOCOP',
  'ff6':                 'FINAL FANTASY VI',
  'ff8':                 'FINAL FANTASY VIII',
  'ff9':                 'FINAL FANTASY IX',
  'ff10':                'FINAL FANTASY X',
  'ff14':                'FINAL FANTASY XIV',
  'ff15':                'FINAL FANTASY XV',
  'wow-horde':           'WOW: HORDE',
  'wow-scourge':         'WOW: SCOURGE',
  'wow-legion':          'WOW: BURNING LEGION',
  'wow-nightelf':        'WOW: NIGHT ELVES',
  'wow-alliance':        'WOW: ALLIANCE',
  'dead-space':          'DEAD SPACE',
  'half-life':           'HALF-LIFE',
  'terminator':          'TERMINATOR',
  'portal':              'PORTAL',
  'star-wars-rebel':     'STAR WARS: REBEL ALLIANCE',
  'star-wars-empire':    'STAR WARS: GALACTIC EMPIRE',
  'star-wars-mando':     'STAR WARS: MANDALORIAN',
  'star-wars-separatist': 'STAR WARS: SEPARATISTS',
  'star-wars-sith':      'STAR WARS: SITH',
  'star-wars-republic':  'STAR WARS: OLD REPUBLIC',
  'doctor-who':          'DOCTOR WHO',
  'akira':               'AKIRA',
  'evangelion':          'EVANGELION',
  '2001':                '2001: A SPACE ODYSSEY',
  'silent-hill':         'SILENT HILL',
  'stalker':             'S.T.A.L.K.E.R.',
  'resident-evil':       'RESIDENT EVIL',
  'the-expanse':         'THE EXPANSE',
  'event-horizon':       'EVENT HORIZON',
  'hogwarts':            'HOGWARTS: MARAUDER\'S MAP',
  'ministry-of-magic':   'MINISTRY OF MAGIC',
  'gryffindor':          'GRYFFINDOR',
  'ravenclaw':           'RAVENCLAW',
  'hufflepuff':          'HUFFLEPUFF',
  'slytherin':           'SLYTHERIN: DARK ARTS',
  'rivendell':           'RIVENDELL',
  'shire':               'THE SHIRE',
  'mordor':              'MORDOR',
  'scp':                 'SCP FOUNDATION',
  'alan-wake':           'ALAN WAKE',
  'control':             'CONTROL: THE BUREAU',
  'twin-peaks':          'TWIN PEAKS',
  'lovecraft':           'LOVECRAFTIAN',
  'the-sandman':         'THE SANDMAN',
  'persona-5':           'PERSONA 5',
  'the-witcher':         'THE WITCHER',
  'diablo':              'DIABLO',
  'soma':                'SOMA',
  'stranger-things':     'STRANGER THINGS',
  'fatal-frame':         'FATAL FRAME',
  'firefly':             'FIREFLY / SERENITY',
  'persona-4':           'PERSONA 4',
  'persona-3':           'PERSONA 3',
  'eve-online':          'EVE ONLINE',
  'indiana-jones':       'INDIANA JONES',
  'game-of-thrones':     'GAME OF THRONES',
  'amnesia':             'AMNESIA',
  'metal-gear':          'METAL GEAR SOLID',
  'parasite-eve':        'PARASITE EVE',
  'ff7':                 'FINAL FANTASY VII',
};
const ALL_THEMES = Object.keys(THEME_BANNERS)
  .sort((a, b) => (THEME_NAMES[a] || a).localeCompare(THEME_NAMES[b] || b));

// ── Boot ─────────────────────────────────────────────────────────────────────
async function init() {
  apps     = await window.api.invoke('get-apps');
  settings = await window.api.invoke('get-settings');
  applySettings();
  renderGrid();
  setupDragDrop();
  setupTileReorder();
  setupContextMenu();
  setupUpdateListeners();
  document.getElementById('app-version').textContent = `v${APP_VERSION}`;
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
  const grid = document.getElementById('app-grid');
  const dropHint = document.getElementById('drop-hint');

  grid.innerHTML = '';

  if (apps.length === 0 && !editMode) {
    dropHint.classList.remove('hidden');
  } else {
    dropHint.classList.add('hidden');
  }

  apps.forEach(appItem => grid.appendChild(createAppTile(appItem)));
}

function createAppTile(appItem) {
  const tile = document.createElement('div');
  tile.className = 'app-tile';
  tile.dataset.id = appItem.id;

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
      if (suppressNextClick) return;
      launchApp(appItem.path);
    });
  }

  return tile;
}

function startRename(appItem, labelEl) {
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
    if (cancelled) return;
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
    if (e.key === 'Escape') { cancelled = true; input.replaceWith(labelEl); }
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
  document.getElementById('slider-icon-size').value = size;
  document.getElementById('icon-size-val').textContent = size + 'px';
  document.getElementById('chk-startup').checked = settings.startWithWindows !== false;
  document.getElementById('chk-random-theme').checked = settings.randomTheme !== false;

  const rawTheme = settings.theme || 'cyberpunk';
  const theme = VALID_THEMES.has(rawTheme) ? rawTheme : 'cyberpunk';
  document.getElementById('theme-stylesheet').href = `styles/themes/${theme}.css`;
  document.getElementById('theme-search').value = '';
  startBannerCycle(theme);
}

function startBannerCycle(theme) {
  clearInterval(bannerInterval);
  clearTimeout(bannerFadeTimer);
  bannerInterval = null;
  bannerFadeTimer = null;

  const quotes = THEME_BANNERS[theme];
  if (!quotes) return;

  const textEl = document.getElementById('theme-banner-text');
  let idx = 0;
  textEl.style.opacity = '1';
  textEl.textContent = quotes[idx];

  bannerInterval = setInterval(() => {
    textEl.style.opacity = '0';
    bannerFadeTimer = setTimeout(() => {
      idx = (idx + 1) % quotes.length;
      textEl.textContent = quotes[idx];
      textEl.style.opacity = '1';
    }, 380);
  }, 14000);
}

document.getElementById('slider-icon-size').addEventListener('input', async (e) => {
  const size = parseInt(e.target.value, 10);
  document.getElementById('icon-size-val').textContent = size + 'px';
  document.documentElement.style.setProperty('--icon-size', size + 'px');
  settings.iconSize = size;
  await window.api.invoke('save-settings', settings);
});

document.getElementById('chk-startup').addEventListener('change', async (e) => {
  settings.startWithWindows = e.target.checked;
  await window.api.invoke('save-settings', settings);
  await window.api.invoke('set-auto-launch', e.target.checked);
});

document.getElementById('chk-random-theme').addEventListener('change', async (e) => {
  settings.randomTheme = e.target.checked;
  await window.api.invoke('save-settings', settings);
});

// ── Drag & Drop ────────────────────────────────────────────────────────────────
function setupDragDrop() {
  const body = document.body;

  body.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    document.getElementById('app').classList.add('drag-over');
  });

  body.addEventListener('dragleave', (e) => {
    if (!e.relatedTarget || e.relatedTarget === document.documentElement) {
      document.getElementById('app').classList.remove('drag-over');
    }
  });

  body.addEventListener('drop', async (e) => {
    e.preventDefault();
    document.getElementById('app').classList.remove('drag-over');
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
  const grid = document.getElementById('app-grid');

  grid.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    const tile = e.target.closest('.app-tile');
    if (!tile) return;
    // Let remove button and rename label handle their own clicks
    if (e.target.closest('.btn-remove') || e.target.closest('.renameable') || e.target.closest('.rename-input')) return;

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
  }

  // Move ghost to cursor (centered)
  const g = reorderState.ghost;
  g.style.left = (e.clientX - parseFloat(g.style.width)  / 2) + 'px';
  g.style.top  = (e.clientY - parseFloat(g.style.height) / 2) + 'px';

  // Find which tile the cursor is over (ghost has pointer-events:none)
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const overTile = el?.closest('.app-tile');
  const grid = document.getElementById('app-grid');

  if (overTile && grid.contains(overTile) && overTile !== reorderState.srcEl) {
    const all = [...grid.querySelectorAll('.app-tile')];
    const srcPos  = all.indexOf(reorderState.srcEl);
    const overPos = all.indexOf(overTile);
    if (srcPos !== overPos) {
      // Shift: move the source placeholder to its new slot
      if (overPos > srcPos) overTile.after(reorderState.srcEl);
      else                  overTile.before(reorderState.srcEl);
    }
  }
}

async function handleReorderUp() {
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

  // Suppress the click that fires immediately after mouseup
  suppressNextClick = true;
  setTimeout(() => { suppressNextClick = false; }, 50);

  // Derive new order from DOM positions
  const grid = document.getElementById('app-grid');
  const allTiles = [...grid.querySelectorAll('.app-tile')];
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
  if (!reorderState?.dragging) { reorderState = null; return; }
  reorderState.ghost?.remove();
  reorderState.srcEl.classList.remove('tile-drag-source');
  document.body.classList.remove('ql-dragging');
  reorderState = null;
  renderGrid(); // restore original order
}

// ── Installed apps picker ─────────────────────────────────────────────────────
async function openInstalledAppsPicker() {
  const pickerEl = document.getElementById('apps-picker');
  const loadingEl = document.getElementById('picker-loading');
  const listEl = document.getElementById('picker-list');
  const searchEl = document.getElementById('picker-search');

  listEl.innerHTML = '';
  searchEl.value = '';
  loadingEl.classList.remove('hidden');
  pickerEl.classList.remove('hidden');

  try {
    installedApps = await window.api.invoke('get-installed-apps');
  } catch (e) {
    console.error('get-installed-apps failed:', e);
    installedApps = [];
  }
  loadingEl.classList.add('hidden');
  renderPickerList(installedApps);
  searchEl.focus();
}

function renderPickerList(items) {
  const listEl = document.getElementById('picker-list');
  listEl.innerHTML = '';

  if (items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'picker-empty';
    empty.textContent = 'NO MATCHES — USE BROWSE TO ADD BY FILE';
    listEl.appendChild(empty);
    return;
  }

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'picker-item';

    if (item.iconDataUrl) {
      const img = document.createElement('img');
      img.src = item.iconDataUrl;
      img.alt = '';
      el.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'picker-icon-placeholder';
      el.appendChild(placeholder);
    }

    const nameEl = document.createElement('span');
    nameEl.className = 'picker-item-name';
    nameEl.textContent = item.name;
    el.appendChild(nameEl);

    el.addEventListener('click', async () => {
      try {
        const appItem = await window.api.invoke('add-app-from-appid', {
          name: item.name,
          appId: item.appId,
          iconDataUrl: item.iconDataUrl
        });
        if (appItem && !apps.find(a => a.path === appItem.path)) {
          apps.push(appItem);
          await saveApps();
          renderGrid();
        }
      } catch (e) {
        console.error('Failed to add app from picker:', e);
      }
      document.getElementById('apps-picker').classList.add('hidden');
    });

    listEl.appendChild(el);
  });
}

document.getElementById('picker-search').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  renderPickerList(q ? installedApps.filter(a => a.name.toLowerCase().includes(q)) : installedApps);
});

document.getElementById('btn-browse-picker').addEventListener('click', async () => {
  document.getElementById('apps-picker').classList.add('hidden');
  await addAppFromDialog();
});

document.getElementById('btn-close-picker').addEventListener('click', () => {
  document.getElementById('apps-picker').classList.add('hidden');
});

// ── Context menu (right-click → edit mode) ────────────────────────────────────
function setupContextMenu() {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (!editMode && !e.target.closest('#settings-overlay') && !e.target.closest('#apps-picker')) {
      enterEditMode();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editMode) exitEditMode();
  });
}

// ── Update banner ─────────────────────────────────────────────────────────────
let _offUpdateListeners = null;

function setupUpdateListeners() {
  if (_offUpdateListeners) _offUpdateListeners();

  const offs = [
    window.api.on('update-checking', () => {
      showUpdateBanner('CHECKING FOR UPDATES...', []);
    }),
    window.api.on('update-available', (info) => {
      showUpdateBanner(
        `UPDATE AVAILABLE — v${info.version}`,
        [{ label: 'DOWNLOAD', action: 'download' }]
      );
    }),
    window.api.on('update-progress', (pct) => {
      document.getElementById('update-text').textContent = `DOWNLOADING... ${pct}%`;
    }),
    window.api.on('update-ready', () => {
      showUpdateBanner(
        'UPDATE READY — WILL INSTALL AND RESTART',
        [{ label: 'INSTALL NOW', action: 'install' }]
      );
    }),
    window.api.on('update-not-available', () => {
      showUpdateBanner('SYSTEM IS UP TO DATE', [], 3000);
    }),
    window.api.on('update-error', (msg) => {
      showUpdateBanner(`UPDATE ERROR: ${msg}`, [], 6000);
      console.warn('Update error:', msg);
    }),
    window.api.on('store-save-error', () => {
      showUpdateBanner('SAVE ERROR — SETTINGS MAY NOT PERSIST', [], 8000);
      console.error('Store save failed');
    }),
  ];

  _offUpdateListeners = () => offs.forEach(off => off());
}

function showUpdateBanner(text, actions, autoDismissMs = 0) {
  // Clear any previous auto-dismiss so a new banner can't be dismissed by a stale timer
  clearTimeout(autoDismissTimer);
  autoDismissTimer = null;

  const banner = document.getElementById('update-banner');
  const textEl = document.getElementById('update-text');
  const actionsEl = document.getElementById('update-actions');

  textEl.textContent = text;
  actionsEl.innerHTML = '';

  actions.forEach(({ label, action }) => {
    const btn = document.createElement('button');
    btn.className = 'update-btn';
    btn.textContent = label;
    btn.addEventListener('click', async () => {
      if (action === 'download') {
        btn.textContent = 'DOWNLOADING...';
        btn.disabled = true;
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
  dismissBtn.addEventListener('click', () => {
    hideUpdateBanner();
  });
  actionsEl.appendChild(dismissBtn);

  banner.classList.remove('hidden');

  if (autoDismissMs > 0) {
    autoDismissTimer = setTimeout(hideUpdateBanner, autoDismissMs);
  }
}

function hideUpdateBanner() {
  clearTimeout(autoDismissTimer);
  autoDismissTimer = null;
  document.getElementById('update-banner').classList.add('hidden');
}

// ── Button wiring ─────────────────────────────────────────────────────────────
document.getElementById('btn-settings').addEventListener('click', () => {
  document.getElementById('settings-overlay').classList.toggle('hidden');
});

document.getElementById('btn-hide').addEventListener('click', () => {
  window.api.invoke('hide-window');
});

document.getElementById('btn-close-settings').addEventListener('click', () => {
  document.getElementById('settings-overlay').classList.add('hidden');
});

document.getElementById('btn-check-update').addEventListener('click', () => {
  window.api.invoke('check-update');
  document.getElementById('settings-overlay').classList.add('hidden');
});

document.getElementById('btn-add-edit').addEventListener('click', addAppFromDialog);
document.getElementById('btn-add-installed').addEventListener('click', openInstalledAppsPicker);
document.getElementById('btn-done-edit').addEventListener('click', exitEditMode);

// ── Skin selection (searchable picker) ───────────────────────────────────────
(function () {
  const searchEl = document.getElementById('theme-search');
  const listEl   = document.getElementById('theme-picker-list');

  function buildList(filter) {
    const q = (filter || '').toLowerCase().trim();
    const matches = q
      ? ALL_THEMES.filter(k => (THEME_NAMES[k] || k).toLowerCase().includes(q))
      : ALL_THEMES;

    listEl.innerHTML = '';
    if (matches.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'theme-picker-empty';
      empty.textContent = 'NO MATCHES';
      listEl.appendChild(empty);
      return;
    }
    const current = settings.theme || 'cyberpunk';
    matches.forEach(key => {
      const item = document.createElement('div');
      item.className = 'theme-picker-item' + (key === current ? ' selected' : '');
      item.dataset.value = key;
      item.textContent = THEME_NAMES[key] || key.toUpperCase();
      item.addEventListener('mousedown', async (e) => {
        e.preventDefault();
        settings.theme = key;
        applySettings();
        await window.api.invoke('save-settings', settings);
        closePicker();
      });
      listEl.appendChild(item);
    });
  }

  function openPicker() {
    buildList(searchEl.value);
    listEl.classList.remove('hidden');
    // Position dropdown below the search input, extending to the app bottom edge
    const rect = searchEl.getBoundingClientRect();
    const appBottom = document.getElementById('app').getBoundingClientRect().bottom;
    listEl.style.top = (rect.bottom + 3) + 'px';
    listEl.style.maxHeight = Math.max(80, appBottom - rect.bottom - 10) + 'px';
    const sel = listEl.querySelector('.theme-picker-item.selected');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
  }

  function closePicker() {
    listEl.classList.add('hidden');
    searchEl.value = '';
  }

  function moveActive(dir) {
    const items = [...listEl.querySelectorAll('.theme-picker-item')];
    if (!items.length) return;
    const cur = listEl.querySelector('.theme-picker-item.active');
    let idx = items.indexOf(cur) + dir;
    idx = Math.max(0, Math.min(items.length - 1, idx));
    items.forEach(i => i.classList.remove('active'));
    items[idx].classList.add('active');
    items[idx].scrollIntoView({ block: 'nearest' });
  }

  searchEl.addEventListener('focus', () => openPicker());
  searchEl.addEventListener('input', () => buildList(searchEl.value));
  searchEl.addEventListener('blur',  () => setTimeout(closePicker, 150));
  searchEl.addEventListener('keydown', (e) => {
    if (e.key === 'Escape')    { closePicker(); searchEl.blur(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1);  return; }
    if (e.key === 'ArrowUp')   { e.preventDefault(); moveActive(-1); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      const active = listEl.querySelector('.theme-picker-item.active')
                  || listEl.querySelector('.theme-picker-item');
      if (active) active.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }
  });
})();

document.getElementById('btn-random-theme').addEventListener('click', async () => {
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
  clearTimeout(autoDismissTimer);
});

// ── Start ─────────────────────────────────────────────────────────────────────
init();
