/**
 * PDL bingo draft format handler
 * 
 * - one ongoing "season" at a time
 * - turn off when done, to prevent the players table filling up endlessly
 * - turn on with a species pool, natdex default
 * - 
 */

import { PRNG } from "../../sim";

type RequiredField<T, K extends keyof T> = T & { [F in K]: NonNullable<T[F]> };

const formats = {
	// PDL's rollable list; it's fiiine to call it natdex, this plugin is going to be used only by them
	natdex: [
		"Xurkitree", "Bibarel", "Breloom", "Kangaskhan", "Darmanitan-Galar", "Blissey", "Farigiraf", "Centiskorch", "Duraludon", "Swampert", "Moltres-Galar", "Sneasel", "Gholdengo", "Beautifly", "Murkrow", "Mismagius", "Greninja", "Dottler", "Hitmonchan", "Deoxys-Speed", "Zebstrika", "Manaphy", "Volcanion", "Tropius", "Enamorus", "Metagross", "Lycanroc", "Vileplume", "Sharpedo", "Dragonite", "Orthworm", "Luvdisc", "Sandslash-Alola", "Regice", "Magnezone", "Hippowdon", "Vulpix-Alola", "Bellossom", "Lanturn", "Indeedee-F", "Iron Jugulis", "Vikavolt", "Trevenant", "Hypno", "Exploud", "Toedscruel", "Spinda", "Sirfetch’d", "Azumarill", "Krookodile", "Masquerain", "Typhlosion-Hisui", "Articuno-Galar", "Scizor", "Pangoro", "Electivire", "Zapdos-Galar", "Spidops", "Dracozolt", "Beheeyem", "Altaria", "Serperior", "Polteageist", "Diggersby", "Bewear", "Landorus", "Keldeo", "Meowstic", "Wugtrio", "Obstagoon", "Cacturne", "Scrafty", "Venusaur", "basculin-hisui", "Regieleki", "Alomomola", "Liepard", "Seaking", "Appletun", "Ditto", "Donphan", "Ludicolo", "Slowking", "Salamence", "Persian-Alola", "Mudsdale", "Minior", "Conkeldurr", "Klawf", "Quaquaval", "Rhyperior", "Dracovish", "Gigalith", "Necrozma", "Cofagrigus", "Barraskewda", "Archeops", "Probopass", "Chandelure", "Wo-Chien", "Simisage", "Blastoise", "Floatzel", "Kommo-o", "Politoed", "Zeraora", "Araquanid", "Purugly", "Decidueye-Hisui", "Plusle", "Aerodactyl", "Kabutops", "Snorlax", "Aurorus", "Porygon2", "Raichu-Alola", "Skeledirge", "Darmanitan", "Dragalge", "Garbodor", "Rotom-Mow", "Chesnaught", "Shaymin", "Avalugg-Hisui", "Munkidori", "Melmetal", "Rapidash-Galar", "Smeargle", "Ninetales-Alola", "Delibird", "Ceruledge", "Lilligant", "Phione", "Slowbro", "Medicham", "Hitmontop", "Toucannon", "Fezandipiti", "Sneasler", "Wigglytuff", "Okidogi", "Jynx", "Naclstack", "Walrein", "Golem", "Tauros", "Slowbro-Galar", "Mesprit", "Volcarona", "Thievul", "Uxie", "Shiftry", "Victini", "Ferrothorn", "Overqwil", "Ogerpon", "Dipplin", "Pawmot", "Arctozolt", "Gumshoos", "Drampa", "Zamazenta-Crowned", "Basculin", "Whimsicott", "Heatmor", "Gardevoir", "Farfetch’d", "Swanna", "Raichu", "Iron Crown", "Zapdos", "Type: Null", "Piloswine", "Revavroom", "Basculegion", "Mightyena", "Trapinch", "Zarude", "Chimecho", "Walking Wake", "Annihilape", "Nidoqueen", "Durant", "Wailord", "Sunflora", "Shedinja", "Crabominable", "Heatran", "Luxray", "Kleavor", "Glimmora", "Togedemaru", "Chansey", "Pecharunt", "Eiscue", "Bastiodon", "Crustle", "Tornadus", "Pinsir", "Perrserker", "Indeedee", "Gengar", "Pyroar", "Porygon-Z", "Pincurchin", "Meloetta", "Staraptor", "Mr. Mime", "Infernape", "Dewgong", "Beartic", "Entei", "Diancie", "Empoleon", "Pyukumuku", "Talonflame", "Heliolisk", "Misdreavus", "Iron Moth", "Iron Hands", "Golduck", "Exeggutor-Alola", "Tauros-Paldea-Blaze", "Orbeetle", "Goodra-Hisui", "Terapagos", "Simisear", "Great Tusk", "Espeon", "Shelgon", "Rampardos", "Malamar", "Morpeko", "Sableye", "Boltund", "Mimikyu", "Carbink", "Swalot", "Kingler", "Slurpuff", "Ting-Lu", "Comfey", "Muk", "Flapple", "Claydol", "Octillery", "Lopunny", "Ribombee", "Roaring Moon", "Torterra", "Weavile", "Terrakion", "Gothitelle", "Manectric", "Cinccino", "Ogerpon-Cornerstone", "Roserade", "Weezing", "Dunsparce", "Tapu Lele", "Minun", "Umbreon", "Seviper", "Solrock", "Tapu Koko", "Charizard", "Froslass", "Landorus-Therian", "Braviary", "Iron Bundle", "Maractus", "Sliggoo-Hisui", "Scolipede", "Aggron", "Chi-Yu", "Leafeon", "Tatsugiri", "Exeggutor", "Dodrio", "Deoxys-Defense", "Silvally", "Iron Valiant", "Iron Leaves", "Chatot", "Dugtrio-Alola", "Crawdaunt", "Corsola", "Alcremie", "Sandaconda", "Regirock", "Duosion", "Pelipper", "Grimmsnarl", "Raticate", "Swoobat", "Bronzong", "Granbull", "Lurantis", "Parasect", "Toxicroak", "Mantine", "Steelix", "Drifblim", "Gyarados", "Heracross", "Registeel", "Sinistcha", "Runerigus", "Togekiss", "Starmie", "Blacephalon", "Beedrill", "Yanmega", "Armarouge", "Oinkologne", "Stunfisk", "Mandibuzz", "Coalossal", "Nidoking", "Azelf", "Lycanroc-Dusk", "Stunfisk-Galar", "Basculegion-F", "Celebi", "Vaporeon", "Drapion", "Furfrou", "Bouffalant", "Absol", "Audino", "Omastar", "Galvantula", "Victreebel", "Cryogonal", "Aromatisse", "Charjabug", "Grumpig", "Unfezant", "Kilowattrel", "Dragapult", "Pikachu", "Jolteon", "Rhydon", "Suicune", "Baxcalibur", "Mawile", "Salazzle", "Corviknight", "Cursola", "Krokorok", "Torkoal", "Passimian", "Dusknoir", "Wishiwashi", "Milotic", "Mienshao", "Zoroark-Hisui", "Bisharp", "Ninetales", "Rotom-Heat", "Persian", "Glastrier", "Dusclops", "Vigoroth", "Palafin", "Carnivine", "Grapploct", "Vivillon", "Ninjask", "Alakazam", "Tsareena", "Relicanth", "Forretress", "Cinderace", "Slither Wing", "Swellow", "Hitmonlee", "Glalie", "Espathra", "Wobbuffet", "Meowscarada", "Gligar", "Thundurus-Therian", "Eelektross", "Armaldo", "Rillaboom", "Clawitzer", "Arcanine", "Lunatone", "Primeape", "Magearna", "Gastrodon", "Squawkabilly", "Ariados", "Dubwool", "Miltank", "Snover", "Arcanine-Hisui", "Archaludon", "Vulpix", "Watchog", "Slowking-Galar", "Wormadam", "Kingambit", "Jellicent", "Gliscor", "Furret", "Darkrai", "Gallade", "Carracosta", "Zoroark", "Girafarig", "Machamp", "Corsola-Galar", "Dedenne", "Haunter", "Arctovish", "Skarmory", "Nihilego", "Rotom-Wash", "Glimmet", "Bombirdier", "Crocalor", "Marowak", "Simipour", "Ursaluna-Bloodmoon", "Zangoose", "Leavanny", "Houndstone", "Aegislash", "Regigigas", "Noivern", "Sawsbuck", "Camerupt", "Garganacl", "Flygon", "Dhelmise", "Oranguru", "Mr. Rime", "Primarina", "Reuniclus", "Vanilluxe", "Tapu Bulu", "Gogoat", "Clefairy", "Dondozo", "Magmortar", "Banette", "Hoopa", "Jirachi", "Articuno", "Tyranitar", "Musharna", "Chien-Pao", "Goodra", "Rotom-Frost", "Veluza", "Hatterene", "Iron Treads", "Garchomp", "Meganium", "Rotom-Fan", "Rabsca", "Ampharos", "Dachsbun", "Avalugg", "Arbok", "Ursaring", "Ogerpon-Wellspring", "Stantler", "Volbeat", "Honchkrow", "Throh", "Qwilfish-Hisui", "Tentacruel", "Illumise", "Urshifu-Rapid-Strike", "Sigilyph", "Lilligant-Hisui", "Cresselia", "Cherrim", "Tangrowth", "Butterfree", "Thundurus", "Blaziken", "Jumpluff", "Bellibolt", "Enamorus-Therian", "Electrode", "Sandy Shocks", "Falinks", "Sudowoodo", "Magmar", "Whiscash", "Toxapex", "Hydreigon", "Florges", "Cradily", "Lumineon", "Electrode-Hisui", "Raging Bolt", "Pidgeot", "Typhlosion", "Iron Thorns", "Inteleon", "Mabosstiff", "Raikou", "Rapidash", "Gurdurr", "Kricketune", "Iron Boulder", "Clodsire", "Golisopod", "Turtonator", "Kyurem", "Tyrantrum", "Amoonguss", "Tornadus-Therian", "Kingdra", "Samurott", "Celesteela", "Weezing-Galar", "Klefki", "Gorebyss", "Pachirisu", "Urshifu", "Cloyster", "Braviary-Hisui", "Maushold", "Komala", "Spiritomb", "Linoone", "Moltres", "Virizion", "Lapras", "Magcargo", "Wyrdeer", "Slaking", "Frosmoth", "Scovillain", "Electabuzz", "Incineroar", "Stoutland", "Regidrago", "Cobalion", "Arboliva", "Huntail", "Decidueye", "Emolga", "Rotom", "Accelgor", "Emboar", "Fearow", "Cyclizar", "Marowak-Alola", "Haxorus", "Ambipom", "Hariyama", "Castform", "Scream Tail", "Crobat", "Lycanroc-Midnight", "Flareon", "Noctowl", "Hoopa-Unbound", "Kecleon", "Sawk", "Seismitoad", "Dugtrio", "Cramorant", "Latias", "Dudunsparce", "Magneton", "Buzzwole", "Oricorio", "Hydrapple", "Klinklang", "Cetitan", "Delcatty", "Gouging Fire", "Druddigon", "Venomoth", "Tauros-Paldea-Combat", "Copperajah", "Sandslash", "Eldegoss", "Shuckle", "Ogerpon-Hearthflame", "Poliwrath", "Escavalier", "Tinkaton", "Vespiquen", "Delphox", "Skuntank", "Scyther", "Samurott-Hisui", "Gourgeist", "Ledian", "Mothim", "Toxtricity", "Qwilfish", "Abomasnow", "Kartana", "Stonjourner", "Lokix", "Lickilicky", "Guzzlord", "Dustox", "Golem-Alola", "Swadloon", "Bruxish", "Greedent", "Brambleghast", "Golurk", "Spectrier", "Shiinotic", "Feraligatr", "Sylveon", "Ursaluna", "Glaceon", "Brute Bonnet", "Barbaracle", "Tauros-Paldea-Aqua", "Muk-Alola", "Sceptile", "Quagsire", "Hawlucha", "Lucario", "Grafaiai", "Flamigo", "Xatu", "Latios", "Stakataka", "Mamoswine", "Tapu Fini", "Palossand", "Clefable", "Raticate-Alola", "Excadrill", "Houndoom", "Drednaw", "Thwackey", "Mew", "Venusaur-Mega", "Charizard-Mega-X", "Charizard-Mega-Y", "Blastoise-Mega", "Beedrill-Mega", "Pidgeot-Mega", "Alakazam-Mega", "Slowbro-Mega", "Gengar-Mega", "Kangaskhan-Mega", "Pinsir-Mega", "Gyarados-Mega", "Aerodactyl-Mega", "Mewtwo-Mega-X", "Mewtwo-Mega-Y", "Ampharos-Mega", "Steelix-Mega", "Scizor-Mega", "Heracross-Mega", "Houndoom-Mega", "Tyranitar-Mega", "Sceptile-Mega", "Blaziken-Mega", "Swampert-Mega", "Gardevoir-Mega", "Sableye-Mega", "Mawile-Mega", "Aggron-Mega", "Medicham-Mega", "Manectric-Mega", "Sharpedo-Mega", "Camerupt-Mega", "Altaria-Mega", "Banette-Mega", "Absol-Mega", "Glalie-Mega", "Salamence-Mega", "Metagross-Mega", "Latias-Mega", "Latios-Mega", "Lopunny-Mega", "Garchomp-Mega", "Lucario-Mega", "Abomasnow-Mega", "Gallade-Mega", "Audino-Mega", "Diancie-Mega",
	].map(toID),
	paldex: [
		"Sprigatito", "Floragato", "Meowscarada", "Fuecoco", "Crocalor", "Skeledirge", "Quaxly", "Quaxwell", "Quaquaval", "Lechonk", "Oinkologne", "Tarountula", "Spidops", "Nymble", "Lokix", "Hoppip", "Skiploom", "Jumpluff", "Fletchling", "Fletchinder", "Talonflame", "Pawmi", "Pawmo", "Pawmot", "Houndour", "Houndoom", "Yungoos", "Gumshoos", "Skwovet", "Greedent", "Sunkern", "Sunflora", "Kricketot", "Kricketune", "Scatterbug", "Spewpa", "Vivillon", "Combee", "Vespiquen", "Rookidee", "Corvisquire", "Corviknight", "Happiny", "Chansey", "Blissey", "Azurill", "Marill", "Azumarill", "Surskit", "Masquerain", "Buizel", "Floatzel", "Wooper", "Clodsire", "Psyduck", "Golduck", "Chewtle", "Drednaw", "Igglybuff", "Jigglypuff", "Wigglytuff", "Ralts", "Kirlia", "Gardevoir", "Gallade", "Drowzee", "Hypno", "Gastly", "Haunter", "Gengar", "Tandemaus", "Maushold", "Pichu", "Pikachu", "Raichu", "Fidough", "Dachsbun", "Slakoth", "Vigoroth", "Slaking", "Bounsweet", "Steenee", "Tsareena", "Smoliv", "Dolliv", "Arboliva", "Bonsly", "Sudowoodo", "Rockruff", "Lycanroc", "Rolycoly", "Carkol", "Coalossal", "Shinx", "Luxio", "Luxray", "Starly", "Staravia", "Staraptor", "Oricorio", "Mareep", "Flaaffy", "Ampharos", "Petilil", "Lilligant", "Shroomish", "Breloom", "Applin", "Flapple", "Appletun", "Spoink", "Grumpig", "Squawkabilly", "Misdreavus", "Mismagius", "Makuhita", "Hariyama", "Crabrawler", "Crabominable", "Salandit", "Salazzle", "Phanpy", "Donphan", "Cufant", "Copperajah", "Gible", "Gabite", "Garchomp", "Nacli", "Naclstack", "Garganacl", "Wingull", "Pelipper", "Magikarp", "Gyarados", "Arrokuda", "Barraskewda", "Basculin", "Gulpin", "Swalot", "Meowth", "Persian", "Drifloon", "Drifblim", "Flabe\u0301be\u0301", "Floette", "Florges", "Diglett", "Dugtrio", "Torkoal", "Numel", "Camerupt", "Bronzor", "Bronzong", "Axew", "Fraxure", "Haxorus", "Mankey", "Primeape", "Annihilape", "Meditite", "Medicham", "Riolu", "Lucario", "Charcadet", "Armarouge", "Ceruledge", "Barboach", "Whiscash", "Tadbulb", "Bellibolt", "Goomy", "Sliggoo", "Goodra", "Croagunk", "Toxicroak", "Wattrel", "Kilowattrel", "Eevee", "Vaporeon", "Jolteon", "Flareon", "Espeon", "Umbreon", "Leafeon", "Glaceon", "Sylveon", "Dunsparce", "Dudunsparce", "Deerling", "Sawsbuck", "Girafarig", "Farigiraf", "Grimer", "Muk", "Maschiff", "Mabosstiff", "Toxel", "Toxtricity", "Dedenne", "Pachirisu", "Shroodle", "Grafaiai", "Stantler", "Foongus", "Amoonguss", "Voltorb", "Electrode", "Magnemite", "Magneton", "Magnezone", "Ditto", "Growlithe", "Arcanine", "Teddiursa", "Ursaring", "Zangoose", "Seviper", "Swablu", "Altaria", "Skiddo", "Gogoat", "Tauros", "Litleo", "Pyroar", "Stunky", "Skuntank", "Zorua", "Zoroark", "Sneasel", "Weavile", "Murkrow", "Honchkrow", "Gothita", "Gothorita", "Gothitelle", "Sinistea", "Polteageist", "Mimikyu", "Klefki", "Indeedee", "Bramblin", "Brambleghast", "Toedscool", "Toedscruel", "Tropius", "Fomantis", "Lurantis", "Klawf", "Capsakid", "Scovillain", "Cacnea", "Cacturne", "Rellor", "Rabsca", "Venonat", "Venomoth", "Pineco", "Forretress", "Scyther", "Scizor", "Heracross", "Flittle", "Espathra", "Hippopotas", "Hippowdon", "Sandile", "Krokorok", "Krookodile", "Silicobra", "Sandaconda", "Mudbray", "Mudsdale", "Larvesta", "Volcarona", "Bagon", "Shelgon", "Salamence", "Tinkatink", "Tinkatuff", "Tinkaton", "Hatenna", "Hattrem", "Hatterene", "Impidimp", "Morgrem", "Grimmsnarl", "Wiglett", "Wugtrio", "Bombirdier", "Finizen", "Palafin", "Varoom", "Revavroom", "Cyclizar", "Orthworm", "Sableye", "Shuppet", "Banette", "Falinks", "Hawlucha", "Spiritomb", "Noibat", "Noivern", "Dreepy", "Drakloak", "Dragapult", "Glimmet", "Glimmora", "Rotom", "Greavard", "Houndstone", "Oranguru", "Passimian", "Komala", "Larvitar", "Pupitar", "Tyranitar", "Stonjourner", "Eiscue", "Pincurchin", "Sandygast", "Palossand", "Slowpoke", "Slowbro", "Slowking", "Shellos", "Gastrodon", "Shellder", "Cloyster", "Qwilfish", "Luvdisc", "Finneon", "Lumineon", "Bruxish", "Alomomola", "Skrelp", "Dragalge", "Clauncher", "Clawitzer", "Tynamo", "Eelektrik", "Eelektross", "Mareanie", "Toxapex", "Flamigo", "Dratini", "Dragonair", "Dragonite", "Snom", "Frosmoth", "Snover", "Abomasnow", "Delibird", "Cubchoo", "Beartic", "Snorunt", "Glalie", "Froslass", "Cryogonal", "Cetoddle", "Cetitan", "Bergmite", "Avalugg", "Rufflet", "Braviary", "Pawniard", "Bisharp", "Kingambit", "Deino", "Zweilous", "Hydreigon", "Veluza", "Dondozo", "Tatsugiri", "Great Tusk", "Scream Tail", "Brute Bonnet", "Flutter Mane", "Slither Wing", "Sandy Shocks", "Iron Treads", "Iron Bundle", "Iron Hands", "Iron Jugulis", "Iron Moth", "Iron Thorns", "Frigibax", "Arctibax", "Baxcalibur", "Gimmighoul", "Gholdengo", "Wo-Chien", "Chien-Pao", "Ting-Lu", "Chi-Yu", "Roaring Moon", "Iron Valiant", "Koraidon", "Miraidon",
	].map(toID),
	galardex: [
		"Grookey", "Thwackey", "Rillaboom", "Scorbunny", "Raboot", "Cinderace", "Sobble", "Drizzile", "Inteleon", "Blipbug", "Dottler", "Orbeetle", "Caterpie", "Metapod", "Butterfree", "Grubbin", "Charjabug", "Vikavolt", "Hoothoot", "Noctowl", "Rookidee", "Corvisquire", "Corviknight", "Skwovet", "Greedent", "Pidove", "Tranquill", "Unfezant", "Nickit", "Thievul", "Zigzagoon", "Linoone", "Obstagoon", "Wooloo", "Dubwool", "Lotad", "Lombre", "Ludicolo", "Seedot", "Nuzleaf", "Shiftry", "Chewtle", "Drednaw", "Purrloin", "Liepard", "Yamper", "Boltund", "Bunnelby", "Diggersby", "Minccino", "Cinccino", "Bounsweet", "Steenee", "Tsareena", "Oddish", "Gloom", "Vileplume", "Bellossom", "Budew", "Roselia", "Roserade", "Wingull", "Pelipper", "Joltik", "Galvantula", "Electrike", "Manectric", "Vulpix", "Ninetales", "Growlithe", "Arcanine", "Vanillite", "Vanillish", "Vanilluxe", "Swinub", "Piloswine", "Mamoswine", "Delibird", "Snorunt", "Glalie", "Froslass", "Baltoy", "Claydol", "Mudbray", "Mudsdale", "Dwebble", "Crustle", "Golett", "Golurk", "Munna", "Musharna", "Natu", "Xatu", "Stufful", "Bewear", "Snover", "Abomasnow", "Krabby", "Kingler", "Wooper", "Quagsire", "Corphish", "Crawdaunt", "Nincada", "Ninjask", "Shedinja", "Tyrogue", "Hitmonlee", "Hitmonchan", "Hitmontop", "Pancham", "Pangoro", "Klink", "Klang", "Klinklang", "Combee", "Vespiquen", "Bronzor", "Bronzong", "Ralts", "Kirlia", "Gardevoir", "Gallade", "Drifloon", "Drifblim", "Gossifleur", "Eldegoss", "Cherubi", "Cherrim", "Stunky", "Skuntank", "Tympole", "Palpitoad", "Seismitoad", "Duskull", "Dusclops", "Dusknoir", "Machop", "Machoke", "Machamp", "Gastly", "Haunter", "Gengar", "Magikarp", "Gyarados", "Goldeen", "Seaking", "Remoraid", "Octillery", "Shellder", "Cloyster", "Feebas", "Milotic", "Basculin", "Wishiwashi", "Pyukumuku", "Trubbish", "Garbodor", "Sizzlipede", "Centiskorch", "Rolycoly", "Carkol", "Coalossal", "Diglett", "Dugtrio", "Drilbur", "Excadrill", "Roggenrola", "Boldore", "Gigalith", "Timburr", "Gurdurr", "Conkeldurr", "Woobat", "Swoobat", "Noibat", "Noivern", "Onix", "Steelix", "Arrokuda", "Barraskewda", "Meowth", "Perrserker", "Persian", "Milcery", "Alcremie", "Cutiefly", "Ribombee", "Ferroseed", "Ferrothorn", "Pumpkaboo", "Gourgeist", "Pichu", "Pikachu", "Raichu", "Eevee", "Vaporeon", "Jolteon", "Flareon", "Espeon", "Umbreon", "Leafeon", "Glaceon", "Sylveon", "Applin", "Flapple", "Appletun", "Espurr", "Meowstic", "Swirlix", "Slurpuff", "Spritzee", "Aromatisse", "Dewpider", "Araquanid", "Wynaut", "Wobbuffet", "Farfetch\u2019d", "Sirfetch\u2019d", "Chinchou", "Lanturn", "Croagunk", "Toxicroak", "Scraggy", "Scrafty", "Stunfisk", "Shuckle", "Barboach", "Whiscash", "Shellos", "Gastrodon", "Wimpod", "Golisopod", "Binacle", "Barbaracle", "Corsola", "Cursola", "Impidimp", "Morgrem", "Grimmsnarl", "Hatenna", "Hattrem", "Hatterene", "Salandit", "Salazzle", "Pawniard", "Bisharp", "Throh", "Sawk", "Koffing", "Weezing", "Bonsly", "Sudowoodo", "Cleffa", "Clefairy", "Clefable", "Togepi", "Togetic", "Togekiss", "Munchlax", "Snorlax", "Cottonee", "Whimsicott", "Rhyhorn", "Rhydon", "Rhyperior", "Gothita", "Gothorita", "Gothitelle", "Solosis", "Duosion", "Reuniclus", "Karrablast", "Escavalier", "Shelmet", "Accelgor", "Elgyem", "Beheeyem", "Cubchoo", "Beartic", "Rufflet", "Braviary", "Vullaby", "Mandibuzz", "Skorupi", "Drapion", "Litwick", "Lampent", "Chandelure", "Inkay", "Malamar", "Sneasel", "Weavile", "Sableye", "Mawile", "Maractus", "Sigilyph", "Riolu", "Lucario", "Torkoal", "Mimikyu", "Cufant", "Copperajah", "Qwilfish", "Frillish", "Jellicent", "Mareanie", "Toxapex", "Cramorant", "Toxel", "Toxtricity", "Toxtricity-Low-Key", "Silicobra", "Sandaconda", "Hippopotas", "Hippowdon", "Durant", "Heatmor", "Helioptile", "Heliolisk", "Hawlucha", "Trapinch", "Vibrava", "Flygon", "Axew", "Fraxure", "Haxorus", "Yamask", "Runerigus", "Cofagrigus", "Honedge", "Doublade", "Aegislash", "Ponyta", "Rapidash", "Sinistea", "Polteageist", "Indeedee", "Phantump", "Trevenant", "Morelull", "Shiinotic", "Oranguru", "Passimian", "Morpeko", "Falinks", "Drampa", "Turtonator", "Togedemaru", "Snom", "Frosmoth", "Clobbopus", "Grapploct", "Pincurchin", "Mantyke", "Mantine", "Wailmer", "Wailord", "Bergmite", "Avalugg", "Dhelmise", "Lapras", "Lunatone", "Solrock", "Mime Jr.", "Mr. Mime", "Mr. Rime", "Darumaka", "Darmanitan", "Stonjourner", "Eiscue", "Duraludon", "Rotom", "Ditto", "Dracozolt", "Arctozolt", "Dracovish", "Arctovish", "Charmander", "Charmeleon", "Charizard", "Type: Null", "Silvally", "Larvitar", "Pupitar", "Tyranitar", "Deino", "Zweilous", "Hydreigon", "Goomy", "Sliggoo", "Goodra", "Jangmo-o", "Hakamo-o", "Kommo-o", "Dreepy", "Drakloak", "Dragapult",
	].map(toID),
	sinnohdex: [
		"Turtwig", "Grotle", "Torterra", "Chimchar", "Monferno", "Infernape", "Piplup", "Prinplup", "Empoleon", "Starly", "Staravia", "Staraptor", "Bidoof", "Bibarel", "Kricketot", "Kricketune", "Shinx", "Luxio", "Luxray", "Abra", "Kadabra", "Alakazam", "Magikarp", "Gyarados", "Budew", "Roselia", "Roserade", "Zubat", "Golbat", "Crobat", "Geodude", "Graveler", "Golem", "Onix", "Steelix", "Cranidos", "Rampardos", "Shieldon", "Bastiodon", "Machop", "Machoke", "Machamp", "Psyduck", "Golduck", "Burmy", "Wormadam", "Mothim", "Wurmple", "Silcoon", "Beautifly", "Cascoon", "Dustox", "Combee", "Vespiquen", "Pachirisu", "Buizel", "Floatzel", "Cherubi", "Cherrim", "Shellos", "Gastrodon", "Heracross", "Aipom", "Ambipom", "Drifloon", "Drifblim", "Buneary", "Lopunny", "Gastly", "Haunter", "Gengar", "Misdreavus", "Mismagius", "Murkrow", "Honchkrow", "Glameow", "Purugly", "Goldeen", "Seaking", "Barboach", "Whiscash", "Chingling", "Chimecho", "Stunky", "Skuntank", "Meditite", "Medicham", "Bronzor", "Bronzong", "Ponyta", "Rapidash", "Bonsly", "Sudowoodo", "Mime Jr.", "Mr. Mime", "Happiny", "Chansey", "Blissey", "Cleffa", "Clefairy", "Clefable", "Chatot", "Pichu", "Pikachu", "Raichu", "Hoothoot", "Noctowl", "Spiritomb", "Gible", "Gabite", "Garchomp", "Munchlax", "Snorlax", "Unown", "Riolu", "Lucario", "Wooper", "Quagsire", "Wingull", "Pelipper", "Girafarig", "Hippopotas", "Hippowdon", "Azurill", "Marill", "Azumarill", "Skorupi", "Drapion", "Croagunk", "Toxicroak", "Carnivine", "Remoraid", "Octillery", "Finneon", "Lumineon", "Tentacool", "Tentacruel", "Feebas", "Milotic", "Mantyke", "Mantine", "Snover", "Abomasnow", "Sneasel", "Weavile", "Uxie", "Mesprit", "Azelf", "Dialga", "Palkia", "Manaphy", "Rotom", "Gligar", "Gliscor", "Nosepass", "Probopass", "Ralts", "Kirlia", "Gardevoir", "Gallade", "Lickitung", "Lickilicky", "Eevee", "Vaporeon", "Jolteon", "Flareon", "Espeon", "Umbreon", "Leafeon", "Glaceon", "Swablu", "Altaria", "Togepi", "Togetic", "Togekiss", "Houndour", "Houndoom", "Magnemite", "Magneton", "Magnezone", "Tangela", "Tangrowth", "Yanma", "Yanmega", "Tropius", "Rhyhorn", "Rhydon", "Rhyperior", "Duskull", "Dusclops", "Dusknoir", "Porygon", "Porygon2", "Porygon-Z", "Scyther", "Scizor", "Elekid", "Electabuzz", "Electivire", "Magby", "Magmar", "Magmortar", "Swinub", "Piloswine", "Mamoswine", "Snorunt", "Glalie", "Froslass", "Absol", "Giratina",
	].map(toID),
	hoenndex: [
		"Abra", "Absol", "Aggron", "Alakazam", "Altaria", "Anorith", "Armaldo", "Aron", "Azumarill", "Azurill", "Bagon", "Baltoy", "Banette", "Barboach", "Beautifly", "Beldum", "Bellossom", "Blaziken", "Breloom", "Budew", "Cacnea", "Cacturne", "Camerupt", "Carvanha", "Cascoon", "Castform", "Chimecho", "Chinchou", "Chingling", "Clamperl", "Claydol", "Combusken", "Corphish", "Corsola", "Cradily", "Crawdaunt", "Crobat", "Delcatty", "Dodrio", "Doduo", "Donphan", "Dusclops", "Dusknoir", "Duskull", "Dustox", "Electrike", "Electrode", "Exploud", "Feebas", "Flygon", "Froslass", "Gallade", "Gardevoir", "Geodude", "Girafarig", "Glalie", "Gloom", "Golbat", "Goldeen", "Golduck", "Golem", "Gorebyss", "Graveler", "Grimer", "Grovyle", "Grumpig", "Gulpin", "Gyarados", "Hariyama", "Heracross", "Horsea", "Huntail", "Igglybuff", "Illumise", "Jigglypuff", "Kadabra", "Kecleon", "Kingdra", "Kirlia", "Koffing", "Lairon", "Lanturn", "Latias", "Latios", "Lileep", "Linoone", "Lombre", "Lotad", "Loudred", "Ludicolo", "Lunatone", "Luvdisc", "Machamp", "Machoke", "Machop", "Magcargo", "Magikarp", "Magnemite", "Magneton", "Magnezone", "Makuhita", "Manectric", "Marill", "Marshtomp", "Masquerain", "Mawile", "Medicham", "Meditite", "Metagross", "Metang", "Mightyena", "Milotic", "Minun", "Mudkip", "Muk", "Natu", "Nincada", "Ninetales", "Ninjask", "Nosepass", "Numel", "Nuzleaf", "Oddish", "Pelipper", "Phanpy", "Pichu", "Pikachu", "Pinsir", "Plusle", "Poochyena", "Probopass", "Psyduck", "Raichu", "Ralts", "Regice", "Regirock", "Registeel", "Relicanth", "Rhydon", "Rhyhorn", "Rhyperior", "Roselia", "Roserade", "Sableye", "Salamence", "Sandshrew", "Sandslash", "Sceptile", "Seadra", "Seaking", "Sealeo", "Seedot", "Seviper", "Sharpedo", "Shedinja", "Shelgon", "Shiftry", "Shroomish", "Shuppet", "Silcoon", "Skarmory", "Skitty", "Slaking", "Slakoth", "Slugma", "Snorunt", "Solrock", "Spheal", "Spinda", "Spoink", "Starmie", "Staryu", "Surskit", "Swablu", "Swalot", "Swampert", "Swellow", "Taillow", "Tentacool", "Tentacruel", "Torchic", "Torkoal", "Trapinch", "Treecko", "Tropius", "Vibrava", "Vigoroth", "Vileplume", "Volbeat", "Voltorb", "Vulpix", "Wailmer", "Wailord", "Walrein", "Weezing", "Whiscash", "Whismur", "Wigglytuff", "Wingull", "Wobbuffet", "Wurmple", "Wynaut", "Xatu", "Zangoose", "Zigzagoon", "Zubat",
	].map(toID),
} as const satisfies Record<string, ID[]>;

/**
 * [1,75]
 * 
 * B: 1-15,
 * I: 16-30,
 * N: 31-45,
 * G: 46-60,
 * O: 61-75.
 */
type BingoNum = number & { __isBingoNum: true };

export const bingo = new class {

	rng: PRNG | null = null;
	format: keyof typeof formats | null = null;

	// each board is 25 pairs of unique number and species
	boards: [BingoNum, ID][][] | null = null;
	// userid, boards index
	players: Record<ID, number> | null = null;
	// this is what we've rolled so far
	rolls: Set<BingoNum> | null = null;
	// when started, rolls every 5 seconds
	timer: NodeJS.Timeout | null = null;
	// ?
	timerCallback: (() => boolean) | null = null;

	off() {
		if (!this.isOn()) {
			return false;
		}
		this.rng = null!;
		this.format = null!;
		this.boards = null!;
		this.players = null!;
		this.rolls = null!;
		this.stopTimer();
		return true;
	}

	on(format?: typeof this.format) {
		if (this.isOn()) {
			return false;
		}
		this.rng = new PRNG();
		this.format = format || 'natdex';
		this.boards = [];
		this.players = {} as any;
		this.rolls = new Set();
		// don't set timer -- that should be done after player signups.
		return true;
	}

	isOn(): this is RequiredField<typeof this, 'rng' | 'format' | 'boards' | 'players' | 'rolls'> {
		return this.format !== null;
	}

	// we're generating a fresh board and assigning it.
	// each cell holds a number between 0 - 75 and a species.
	generateBoard(index: number) {
		if (!this.isOn()) {
			throw new Error('Can not generate a board because the plugin is off.');
		}
		this.boards[index] = [];
		const board = this.boards[index];
		const speciesPool = new Set(formats[this.format]);
		// this is not the same logic that PDL uses -- they have ranges for each cell.
		for (let i = 0; i < 5; i++) {
			const numPool = new Set(Array(15).fill(null).map((_, numInRange) => (i * 15) + numInRange + 1 as BingoNum));
			for (let j = 0; j < 5; j++) {
				const num = this.rng.sample([...numPool]);
				numPool.delete(num);
				const species = this.rng.sample([...speciesPool]);
				speciesPool.delete(species);
				board[(i * 5) + j] = [num, species];
			}
		}
		board.sort(([a], [b]) => a - b);
	}

	// we're drawing a number from the available pool.
	roll() {
		if (!this.isOn()) {
			throw new Error('Can not roll a number because the plugin is off.');
		}
		const unrolled = Array(75).fill(null).map((_, i) => i + 1 as BingoNum).filter((x) => !this.rolls.has(x));
		if (!unrolled.length) {
			this.off();
			throw new Error('PDL Bingo ran out of numbers');
		}
		const next = this.rng.sample(unrolled);
		this.rolls.add(next);
		return next;
	}

	// we've drawn a number from the available pool;
	// we're checking whether a board has a matching number.
	findBoardSpecies(index: number, roll: BingoNum) {
		if (!this.isOn()) {
			throw new Error('Can not check board because the plugin is off.');
		}
		const board = this.boards[index];
		const cell = board?.find(([num]) => num === roll);
		if (!cell) {
			return null;
		}
		return cell[1];
	}

	// add a player and assign the first available board to them.
	// returns false if there are no free boards.
	addPlayer(player: ID) {
		if (!this.isOn()) {
			throw new Error('Can not add player because the plugin is off.');
		}
		let next = null;
		const taken = Object.values(this.players);
		for (let i = 0; i < this.boards.length; i++) {
			if (!taken.includes(i)) {
				next = i;
				break;
			}
		}
		if (next === null) {
			return false;
		}
		this.players[player] = next;
		return true;
	}

	removePlayer(player: ID) {
		if (!this.isOn()) {
			throw new Error('Can not remove player because the plugin is off.');
		}
		if (!(player in this.players)) {
			return false;
		}
		delete this.players[player];
		return true;
	}

	// we have players with boards assigned to them, and we've been drawing numbers.
	// we're calculating a player's current team, 0 - 6 pokemon.
	getTeam(player: ID) {
		if (!this.isOn()) {
			throw new Error('Can not get team because the plugin is off.');
		}
		if (!(player in this.players)) {
			return null;
		}
		const team: ID[] = [];
		// the first up to 6 matching pokemon will be the team
		for (const roll of this.rolls) {
			const species = this.findBoardSpecies(this.players[player], roll);
			if (species) {
				team.push(species);
				if (team.length === 6) {
					break;
				}
			}
		}
		return team;
	}

	// bound function to preserve `this`
	tickTimer = () => {
		const roll = this.roll();

		// ...

		this.timerCallback?.();
	}

	startTimer() {
		if (this.timer) {
			return false;
		}
		this.timer = setInterval(this.tickTimer);
		return true;
	}

	stopTimer() {
		if (!this.timer) {
			return false;
		}
		clearInterval(this.timer);
		this.timer = null;
		this.timerCallback = null;
		return true;
	}

	smogonID(text: string) {
		const parsed = text.toLowerCase().replace(/[^a-z0-9 -]+/g, '').replace(/ +/g, '-');
		if (parsed.startsWith('pumpkaboo')) {
			return 'pumpkaboo' as ID;
		}
		if (parsed.startsWith('gourgeist')) {
			return 'gourgeist' as ID;
		}
		return parsed as ID;
	}

};

export const destroy = () => bingo.off();

export const commands: Chat.ChatCommands = {

	pdlbingo: {

		prep: 'prepare',
		prepare(target, room, user, connection, cmd, message) {
			const format = toID(target);
			if (format && !(format === 'natdex' || (format in formats))) {
				throw new Chat.ErrorMessage(`Valid formats: natdex, ${Object.keys(formats).join(', ')}.`);
			}
			if(!bingo.on(format as any)) {
				throw new Chat.ErrorMessage('Bingo is already on.');
			}
			for (let i = 0; i < 18; i++) {
				bingo.generateBoard(i);
			}
			this.sendReply('Prepared 18 boards; Bingo plugin is now on.');
		},

		stop() {
			if(!bingo.off()) {
				throw new Chat.ErrorMessage('Bingo is already off.');
			}
			this.sendReply('Bingo stopped.');
		},

		boards() {
			if (!bingo.isOn()) {
				throw new Chat.ErrorMessage('Bingo is currently off.');
			}
			if (!bingo.boards.length) {
				throw new Chat.ErrorMessage('There are no boards currently.');
			}
			this.runBroadcast();
			this.sendReplyBox(
				// TODO: CSS
				// .pdlbingo { display: flex; flex-wrap: wrap; }
				// .pdlbingo th { text-align: center; }
				<div class="pdlbingo ladder">
					{bingo.boards.map((board, boardIndex) => (
						<div class="infobox">
							<table>
								<caption>
									{boardIndex}. {Object.entries(bingo.players)
										.filter(([userid, i]) => i === boardIndex)
										.map(([userid]) => userid)
										.join(', ') || '-'}
								</caption>
								<tbody>
									<tr>
										<th scope="col">B</th>
										<th scope="col">I</th>
										<th scope="col">N</th>
										<th scope="col">G</th>
										<th scope="col">O</th>
									</tr>
									{Array(5).fill(null).map((_, row) => (
										<tr>
											{board.filter((_, cell) => cell % 5 === row).map(([num, id]) => (
												<td>
													<img
														src={`https://www.smogon.com/forums/media/minisprites/${bingo.smogonID(Dex.species.get(id).name)}.png`}
														alt={id}
													></img>
													{num}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					))}
				</div>
			);
		},

	},

};
