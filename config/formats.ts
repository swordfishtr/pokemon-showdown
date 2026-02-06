// Note: This is the list of formats
// The rules that formats use are stored in data/rulesets.ts
/*
If you want to add custom formats, create a file in this folder named: "custom-formats.ts"

Paste the following code into the file and add your desired formats and their sections between the brackets:
--------------------------------------------------------------------------------
// Note: This is the list of formats
// The rules that formats use are stored in data/rulesets.ts

export const Formats: FormatList = [
];
--------------------------------------------------------------------------------

If you specify a section that already exists, your format will be added to the bottom of that section.
New sections will be added to the bottom of the specified column.
The column value will be ignored for repeat sections.
*/

import { FormatData } from '../sim/dex-formats';

const spmnm: Partial<FormatData> = {
	// Mix and Mega
	onBegin() {
		for (const pokemon of this.getAllPokemon()) {
			pokemon.m.originalSpecies = pokemon.baseSpecies.name;
		}
	},
	onSwitchIn(pokemon) {
		const originalSpecies = this.dex.species.get((pokemon.species as any).originalSpecies);
		if (originalSpecies.exists && pokemon.m.originalSpecies !== originalSpecies.baseSpecies) {
			// Place volatiles on the Pokémon to show its mega-evolved condition and details
			this.add('-start', pokemon, originalSpecies.requiredItems?.[0] || originalSpecies.requiredItem || originalSpecies.requiredMove, '[silent]');
			const oSpecies = this.dex.species.get(pokemon.m.originalSpecies);
			if (oSpecies.types.length !== pokemon.species.types.length || oSpecies.types[1] !== pokemon.species.types[1] ||
				oSpecies.types[0] !== pokemon.species.types[0]) {
				this.add('-start', pokemon, 'typechange', pokemon.species.types.join('/'), '[silent]');
			}
		}
	},
	onSwitchOut(pokemon) {
		const originalSpecies = this.dex.species.get((pokemon.species as any).originalSpecies);
		if (originalSpecies.exists && pokemon.m.originalSpecies !== originalSpecies.baseSpecies) {
			this.add('-end', pokemon, originalSpecies.requiredItems?.[0] || originalSpecies.requiredItem || originalSpecies.requiredMove, '[silent]');
		}
	},
	// Shared Power
	getSharedPower(pokemon) {
		const sharedPower = new Set<string>();
		for (const ally of pokemon.side.pokemon) {
			if (pokemon.battle.ruleTable.isRestricted(`ability:${ally.baseAbility}`)) continue;
			if (ally.previouslySwitchedIn > 0) {
				if (pokemon.battle.dex.currentMod !== 'sharedpower' && ['trace', 'mirrorarmor'].includes(ally.baseAbility)) {
					sharedPower.add('noability');
					continue;
				}
				sharedPower.add(ally.baseAbility);
			}
		}
		sharedPower.delete(pokemon.baseAbility);
		return sharedPower;
	},
	onBeforeSwitchIn(pokemon) {
		let format = this.format;
		if (!format.getSharedPower) format = this.dex.formats.get('gen9sharedpower');
		for (const ability of format.getSharedPower!(pokemon)) {
			const effect = 'ability:' + this.toID(ability);
			pokemon.volatiles[effect] = this.initEffectState({ id: effect, target: pokemon });
			if (!pokemon.m.abils) pokemon.m.abils = [];
			if (!pokemon.m.abils.includes(effect)) pokemon.m.abils.push(effect);
		}
	},
};

const draftteams: Partial<FormatData> = {
	validateTeam(team, options) {
		const TeamValidator: typeof import('../sim/team-validator').TeamValidator =
			require('../sim/team-validator').TeamValidator;
		return new TeamValidator('[Gen 9] ND Generations Draft [Gen 4]').validateTeam(team, options) ?? undefined;
	},
};
const draftteamsvgc: Partial<FormatData> = {
	validateTeam(team, options) {
		const TeamValidator: typeof import('../sim/team-validator').TeamValidator =
			require('../sim/team-validator').TeamValidator;
		return new TeamValidator('[Gen 9] ND Generations Draft [Gen 4 VGC]').validateTeam(team, options) ?? undefined;
	},
};

export const Formats: import('../sim/dex-formats').FormatList = [

	// region Generations Draft League

	{
		section: 'Generations Draft',
		column: 1,
	},
	{
		name: "[Gen 9] ND Generations Draft [Gen 4]",
		mod: 'generationsdraftgen4',
		ruleset: ['Standard Generations', 'Terastal Clause', '35 Pokes Mega Clause'],
		unbanlist: [
			'Abomasnow-Base', 'Abomasnow-Mega', 'Aipom', 'Ambipom', 'Azelf', 'Bastiodon', 'Bibarel', 'Bidoof', 'Blissey', 'Bonsly', 'Bronzong', 'Bronzor', 'Budew', 'Buizel', 'Buneary', 'Burmy', 'Carnivine', 'Chansey', 'Chatot', 'Cherrim-Base', 'Cherubi', 'Chimchar', 'Chimecho-Base', 'Chimecho-Mega', 'Chingling', 'Combee', 'Cranidos', 'Cresselia', 'Croagunk', 'Drapion', 'Drifblim', 'Drifloon', 'Dusclops', 'Dusknoir', 'Duskull', 'Eevee-Base', 'Electabuzz', 'Electivire', 'Elekid', 'Empoleon', 'Espeon', 'Finneon', 'Flareon', 'Floatzel', 'Froslass-Base', 'Froslass-Mega', 'Gabite', 'Gallade-Base', 'Garchomp-Base', 'Garchomp-Mega', 'Gardevoir-Base', 'Gardevoir-Mega', 'Gastrodon', 'Gible', 'Glaceon', 'Glalie-Base', 'Glalie-Mega', 'Glameow', 'Gligar', 'Gliscor', 'Grotle', 'Happiny', 'Heatran-Base', 'Hippopotas', 'Hippowdon', 'Honchkrow', 'Infernape', 'Jolteon', 'Kirlia', 'Kricketot', 'Kricketune', 'Leafeon', 'Lickilicky', 'Lickitung', 'Lopunny-Base', 'Lopunny-Mega', 'Lucario-Base', 'Lumineon', 'Luxio', 'Luxray', 'Magby', 'Magmar', 'Magmortar', 'Magnemite', 'Magneton', 'Magnezone', 'Mamoswine', 'Manaphy', 'Mantine', 'Mantyke', 'Mesprit', 'Mime Jr.', 'Misdreavus', 'Mismagius', 'Monferno', 'Mothim', 'Mr. Mime-Base', 'Mr. Mime-Galar', 'Mr. Rime', 'Munchlax', 'Murkrow', 'Nosepass', 'Pachirisu', 'Phione', 'Piloswine', 'Piplup', 'Porygon', 'Porygon-Z', 'Porygon2', 'Prinplup', 'Probopass', 'Purugly', 'Ralts', 'Rampardos', 'Regice', 'Regidrago', 'Regieleki', 'Regigigas', 'Regirock', 'Registeel', 'Rhydon', 'Rhyhorn', 'Rhyperior', 'Riolu', 'Roselia', 'Roserade', 'Rotom-Base', 'Rotom-Fan', 'Rotom-Frost', 'Rotom-Heat', 'Rotom-Mow', 'Rotom-Wash', 'Sandy Shocks', 'Shaymin-Base', 'Shellos', 'Shieldon', 'Shinx', 'Skorupi', 'Skuntank', 'Sneasel-Base', 'Sneasel-Hisui', 'Snorlax', 'Snorunt', 'Snover', 'Spiritomb', 'Staraptor-Base', 'Staraptor-Mega', 'Staravia', 'Starly', 'Stunky', 'Sudowoodo', 'Swinub', 'Sylveon', 'Tangela', 'Tangrowth', 'Togekiss', 'Togepi', 'Togetic', 'Torterra', 'Toxicroak', 'Turtwig', 'Umbreon', 'Uxie', 'Vaporeon', 'Vespiquen', 'Weavile', 'Wormadam-Base', 'Wormadam-Sandy', 'Wormadam-Trash', 'Yanma', 'Yanmega',

			'Abomasite', 'Chimechite', 'Froslassite', 'Garchompite', 'Gardevoirite', 'Glalitite', 'Lopunnite', 'Staraptite',
			'Belue Berry', 'Watmel Berry', 'Pamtre Berry', 'Durin Berry',
		],
	},
	{
		name: "[Gen 9] ND Generations Draft [Gen 4 VGC]",
		mod: 'generationsdraftgen4vgc',
		gameType: 'doubles',
		ruleset: [
			'Standard Generations', 'Tera Type Preview', '35 Pokes Mega Clause',
			'!Sleep Clause Mod', '!DryPass Clause', '!!Adjust Level = 50',
			'Min Team Size = 6', 'Picked Team Size = 4', 'Best Of = 3', 'Item Clause = 1',
		],
		unbanlist: [
			'Abomasnow-Base', 'Abomasnow-Mega', 'Aipom', 'Ambipom', 'Azelf', 'Bastiodon', 'Bibarel', 'Bidoof', 'Blissey', 'Bonsly', 'Bronzong', 'Bronzor', 'Budew', 'Buizel', 'Buneary', 'Burmy', 'Carnivine', 'Chansey', 'Chatot', 'Cherrim-Base', 'Cherubi', 'Chimchar', 'Chimecho-Base', 'Chimecho-Mega', 'Chingling', 'Combee', 'Cranidos', 'Croagunk', 'Drapion', 'Drifblim', 'Drifloon', 'Dusclops', 'Dusknoir', 'Duskull', 'Eevee-Base', 'Electabuzz', 'Electivire', 'Elekid', 'Empoleon', 'Espeon', 'Finneon', 'Flareon', 'Floatzel', 'Froslass-Base', 'Froslass-Mega', 'Gabite', 'Gallade-Base', 'Gallade-Mega', 'Garchomp-Base', 'Garchomp-Mega', 'Gardevoir-Base', 'Gastrodon', 'Gible', 'Glaceon', 'Glalie-Base', 'Glalie-Mega', 'Glameow', 'Gligar', 'Gliscor', 'Grotle', 'Happiny', 'Heatran-Base', 'Hippopotas', 'Hippowdon', 'Honchkrow', 'Infernape', 'Iron Valiant', 'Jolteon', 'Kirlia', 'Kricketot', 'Kricketune', 'Leafeon', 'Lickilicky', 'Lickitung', 'Lopunny-Base', 'Lucario-Base', 'Lumineon', 'Luxio', 'Luxray', 'Magby', 'Magmar', 'Magmortar', 'Magnemite', 'Magneton', 'Magnezone', 'Mamoswine', 'Mantine', 'Mantyke', 'Mesprit', 'Mime Jr.', 'Misdreavus', 'Mismagius', 'Monferno', 'Mothim', 'Mr. Mime-Base', 'Mr. Mime-Galar', 'Mr. Rime', 'Munchlax', 'Murkrow', 'Nosepass', 'Pachirisu', 'Phione', 'Piloswine', 'Piplup', 'Porygon', 'Porygon-Z', 'Porygon2', 'Prinplup', 'Probopass', 'Purugly', 'Ralts', 'Rampardos', 'Regice', 'Regidrago', 'Regieleki', 'Regigigas', 'Regirock', 'Registeel', 'Rhydon', 'Rhyhorn', 'Rhyperior', 'Riolu', 'Roselia', 'Roserade', 'Rotom-Base', 'Rotom-Fan', 'Rotom-Frost', 'Rotom-Heat', 'Rotom-Mow', 'Rotom-Wash', 'Sandy Shocks', 'Shaymin-Base', 'Shellos', 'Shieldon', 'Shinx', 'Skorupi', 'Skuntank', 'Sneasel-Base', 'Sneasel-Hisui', 'Sneasler', 'Snorlax', 'Snorunt', 'Snover', 'Spiritomb', 'Staraptor-Base', 'Staraptor-Mega', 'Staravia', 'Starly', 'Stunky', 'Sudowoodo', 'Swinub', 'Sylveon', 'Tangela', 'Tangrowth', 'Togekiss', 'Togepi', 'Togetic', 'Torterra', 'Toxicroak', 'Turtwig', 'Umbreon', 'Uxie', 'Vaporeon', 'Vespiquen', 'Weavile', 'Wormadam-Base', 'Wormadam-Sandy', 'Wormadam-Trash', 'Yanma', 'Yanmega',

			'Abomasite', 'Chimechite', 'Froslassite', 'Galladite', 'Garchompite', 'Glalitite', 'Staraptite',
			'Belue Berry', 'Watmel Berry', 'Pamtre Berry', 'Durin Berry',
		],
	},
	{
		name: "[Gen 9] ND Generations Draft [Gen 3]",
		mod: 'gen9',
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Blaziken-Base', 'Latias-Base', 'Latios-Base', 'Manectric-Mega', 'Deoxys-Speed', 'Jirachi', 'Metagross-Base', 'Salamence-Base', 'Gardevoir-Base', 'Aggron-Mega', 'Sceptile-Mega', 'Sharpedo-Mega', 'Pelipper', 'Regieleki', 'Azumarill', 'Breloom', 'Flygon', 'Sableye-Mega', 'Milotic', 'Regidrago', 'Registeel', 'Roserade', 'Swampert-Base', 'Crawdaunt', 'Deoxys-Defense', 'Froslass-Base', 'Gallade-Base', 'Absol-Mega', 'Glalie-Mega', 'Obstagoon', 'Regirock', 'Swellow', 'Claydol', 'Hariyama', 'Ludicolo', 'Masquerain', 'Medicham-Base', 'Banette-Mega', 'Camerupt-Mega', 'Regice', 'Torkoal', 'Aggron-Base', 'Cradily', 'Dusknoir', 'Exploud', 'Gorebyss', 'Linoone-Base', 'Manectric-Base', 'Probopass', 'Sableye-Base', 'Altaria-Base', 'Armaldo', 'Cacturne', 'Camerupt-Base', 'Dusclops', 'Huntail', 'Sceptile-Base', 'Swalot', 'Wailord', 'Walrein', 'Zangoose', 'Absol-Base', 'Chimecho-Base', 'Combusken', 'Linoone-Galar', 'Mawile-Base', 'Ninjask', 'Regigigas', 'Relicanth', 'Sharpedo-Base', 'Shiftry', 'Slaking', 'Vigoroth', 'Whiscash', 'Banette-Base', 'Glalie-Base', 'Grumpig', 'Illumise', 'Kecleon', 'Metang', 'Roselia', 'Sealeo', 'Seviper', 'Trapinch', 'Tropius', 'Volbeat', 'Clamperl', 'Lairon', 'Lunatone', 'Marshtomp', 'Mightyena', 'Minun', 'Plusle', 'Shedinja', 'Shelgon', 'Solrock', 'Spinda', 'Vibrava', 'Wailmer', 'Anorith', 'Aron', 'Azurill', 'Bagon', 'Baltoy', 'Barboach', 'Beautifly', 'Beldum', 'Budew', 'Cacnea', 'Carvanha', 'Cascoon', 'Castform-Base', 'Chingling', 'Corphish', 'Delcatty', 'Duskull', 'Dustox', 'Electrike', 'Feebas', 'Zigzagoon-Galar', 'Grovyle', 'Gulpin', 'Kirlia', 'Lileep', 'Lombre', 'Lotad', 'Loudred', 'Luvdisc', 'Makuhita', 'Marill', 'Meditite', 'Mudkip', 'Nincada', 'Nosepass', 'Numel', 'Nuzleaf', 'Poochyena', 'Ralts', 'Seedot', 'Shroomish', 'Shuppet', 'Silcoon', 'Skitty', 'Slakoth', 'Snorunt', 'Spheal', 'Spoink', 'Surskit', 'Swablu', 'Taillow', 'Torchic', 'Treecko', 'Whismur', 'Wingull', 'Wobbuffet', 'Wurmple', 'Wynaut', 'Zigzagoon-Base',
		],
	},
	{
		name: "[Gen 9] ND Generations Draft [Gen 2]",
		mod: 'gen9',
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Pikachu-Base', 'Raichu-Base', 'Clefairy', 'Clefable-Base', 'Jigglypuff', 'Wigglytuff', 'Zubat', 'Golbat', 'Oddish',
			'Gloom', 'Vileplume', 'Poliwag', 'Poliwhirl', 'Poliwrath', 'Slowpoke', 'Slowbro', 'Onix', 'Hitmonlee',
			'Hitmonchan', 'Chansey', 'Horsea', 'Seadra', 'Scyther', 'Jynx', 'Electabuzz', 'Magmar', 'Eevee-Base',
			'Vaporeon', 'Jolteon', 'Flareon', 'Porygon', 'Chikorita', 'Bayleef', 'Meganium-Base', 'Cyndaquil', 'Quilava',
			'Typhlosion', 'Totodile', 'Croconaw', 'Feraligatr-Base', 'Sentret', 'Furret', 'Hoothoot', 'Noctowl', 'Ledyba',
			'Ledian', 'Spinarak', 'Ariados', 'Crobat', 'Chinchou', 'Lanturn', 'Pichu-Base', 'Cleffa', 'Igglybuff',
			'Togepi', 'Togetic', 'Natu', 'Xatu', 'Mareep', 'Flaaffy', 'Ampharos', 'Bellossom', 'Marill',
			'Azumarill', 'Sudowoodo', 'Politoed', 'Hoppip', 'Skiploom', 'Jumpluff', 'Aipom', 'Sunkern', 'Sunflora',
			'Yanma', 'Wooper', 'Quagsire', 'Espeon', 'Umbreon', 'Murkrow', 'Slowking', 'Misdreavus', 'Unown',
			'Wobbuffet', 'Girafarig', 'Pineco', 'Forretress', 'Dunsparce', 'Gligar', 'Steelix', 'Snubbull', 'Granbull',
			'Qwilfish', 'Scizor', 'Shuckle', 'Heracross', 'Sneasel', 'Teddiursa', 'Ursaring', 'Slugma', 'Magcargo',
			'Swinub', 'Piloswine', 'Corsola', 'Remoraid', 'Octillery', 'Delibird', 'Mantine', 'Skarmory-Base', 'Houndour',
			'Houndoom', 'Kingdra', 'Phanpy', 'Donphan', 'Porygon2', 'Stantler', 'Smeargle', 'Tyrogue', 'Hitmontop',
			'Smoochum', 'Elekid', 'Magby', 'Miltank', 'Blissey', 'Raikou', 'Entei', 'Suicune', 'Larvitar',
			'Pupitar', 'Tyranitar', 'Lugia', 'Ho-Oh', 'Celebi', 'Azurill', 'Wynaut', 'Ambipom', 'Mismagius',
			'Honchkrow', 'Bonsly', 'Happiny', 'Mantyke', 'Weavile', 'Electivire', 'Magmortar', 'Togekiss', 'Yanmega',
			'Leafeon', 'Glaceon', 'Gliscor', 'Mamoswine', 'Porygon-Z', 'Sylveon', 'Cursola', 'Wyrdeer', 'Kleavor',
			'Ursaluna', 'Sneasler', 'Overqwil', 'Clodsire', 'Farigiraf', 'Dudunsparce', 'Great Tusk', 'Scream Tail', 'Flutter Mane',
			'Iron Treads', 'Iron Bundle', 'Iron Thorns', 'Walking Wake', 'Gouging Fire', 'Raging Bolt',
		],
	},
	{
		name: "[Gen 9] ND Generations Draft [Gen 1]",
		mod: 'gen9',
		ruleset: ['Standard Generations', '35 Pokes Mega Clause'],
		unbanlist: [
			'Bulbasaur', 'Ivysaur', 'Venusaur-Base', 'Charmander', 'Charmeleon', 'Charizard-Base', 'Squirtle', 'Wartortle', 'Blastoise-Base',
			'Caterpie', 'Metapod', 'Butterfree', 'Weedle', 'Kakuna', 'Beedrill-Base', 'Pidgey', 'Pidgeotto', 'Pidgeot-Base',
			'Rattata', 'Raticate-Base', 'Raticate-Alola', 'Spearow', 'Fearow', 'Ekans', 'Arbok', 'Pikachu-Base', 'Raichu-Base', 'Sandshrew',
			'Sandslash', 'Nidoran-F', 'Nidorina', 'Nidoqueen', 'Nidoran-M', 'Nidorino', 'Nidoking', 'Clefairy', 'Clefable-Base',
			'Vulpix', 'Ninetales', 'Jigglypuff', 'Wigglytuff', 'Zubat', 'Golbat', 'Oddish', 'Gloom', 'Vileplume',
			'Paras', 'Parasect', 'Venonat', 'Venomoth', 'Diglett', 'Dugtrio', 'Meowth-Base', 'Meowth-Alola', 'Meowth-Galar', 'Persian', 'Psyduck',
			'Golduck', 'Mankey', 'Primeape', 'Growlithe', 'Arcanine', 'Poliwag', 'Poliwhirl', 'Poliwrath', 'Abra',
			'Kadabra', 'Alakazam-Base', 'Machop', 'Machoke', 'Machamp', 'Bellsprout', 'Weepinbell', 'Victreebel-Base', 'Tentacool',
			'Tentacruel', 'Geodude', 'Graveler', 'Golem', 'Ponyta', 'Rapidash', 'Slowpoke', 'Slowbro-Base', 'Slowbro-Galar', 'Magnemite',
			'Magneton', 'Farfetch’d', 'Doduo', 'Dodrio', 'Seel', 'Dewgong', 'Grimer', 'Muk', 'Shellder',
			'Cloyster', 'Gastly', 'Haunter', 'Gengar-Base', 'Onix', 'Drowzee', 'Hypno', 'Krabby', 'Kingler',
			'Voltorb', 'Electrode', 'Exeggcute', 'Exeggutor', 'Cubone', 'Marowak-Base', 'Marowak-Alola', 'Hitmonlee', 'Hitmonchan', 'Lickitung',
			'Koffing', 'Weezing', 'Rhyhorn', 'Rhydon', 'Chansey', 'Tangela', 'Kangaskhan-Base', 'Horsea', 'Seadra',
			'Goldeen', 'Seaking', 'Staryu', 'Starmie-Base', 'Mr. Mime', 'Scyther', 'Jynx', 'Electabuzz', 'Magmar',
			'Pinsir-Base', 'Tauros', 'Magikarp', 'Gyarados-Base', 'Lapras', 'Ditto', 'Eevee-Base', 'Vaporeon', 'Jolteon',
			'Flareon', 'Porygon', 'Omanyte', 'Omastar', 'Kabuto', 'Kabutops', 'Aerodactyl-Base', 'Snorlax', 'Articuno',
			'Zapdos', 'Moltres', 'Dratini', 'Dragonair', 'Dragonite-Base', 'Mewtwo-Base', 'Mew', 'Crobat', 'Pichu-Base',
			'Cleffa', 'Igglybuff', 'Bellossom', 'Politoed', 'Espeon', 'Umbreon', 'Slowking', 'Steelix-Base', 'Scizor-Base',
			'Kingdra', 'Porygon2', 'Hitmontop', 'Smoochum', 'Elekid', 'Magby', 'Blissey', 'Mime Jr.', 'Happiny',
			'Munchlax', 'Magnezone', 'Lickilicky', 'Rhyperior', 'Tangrowth', 'Electivire', 'Magmortar', 'Leafeon', 'Glaceon',
			'Porygon-Z', 'Sylveon', 'Meltan', 'Melmetal', 'Perrserker', 'Sirfetch’d', 'Mr. Rime', 'Kleavor', 'Toedscool',
			'Toedscruel', 'Wiglett', 'Wugtrio', 'Annihilape', 'Scream Tail', 'Sandy Shocks',
		],
	},
	{
		section: 'Re-Generations',
		column: 1,
	},
	{
		// WIP
		name: "[Gen 9] Re-Generations 1.1",
		mod: 'regenerations11',
		ruleset: [
			'Obtainable', 'Team Preview', 'HP Percentage Mod', 'Cancel Mod', 'Endless Battle Clause', 'Sleep Clause Mod', 'Forme Clause',
			'Nickname Clause', 'OHKO Clause', 'DryPass Clause', 'Moody Clause', 'Terastal Clause', 'Evasion Clause',
			'!Evasion Abilities Clause', 'Evasion Abilities Extended Clause', 'Accuracy Clause Mod',
		],
		banlist: [
			'ND Uber', 'ND AG', 'ND OU', 'ND UUBL', 'ND UU', 'ND RUBL', 'ND RU', 'ND NFE', 'ND LC',
			'Attract', 'Hidden Power', 'Last Respects', 'Shed Tail', 'Revival Blessing', 'Take Heart',
			'Focus Band', 'King\'s Rock', 'Razor Fang', 'Quick Claw', 'Berserk Gene',
			'Bug Gem', 'Dark Gem', 'Dragon Gem', 'Electric Gem', 'Fairy Gem', 'Fighting Gem', 'Fire Gem', 'Flying Gem', 'Ghost Gem',
			'Grass Gem', 'Ground Gem', 'Ice Gem', 'Poison Gem', 'Psychic Gem', 'Rock Gem', 'Steel Gem', 'Water Gem',
			'Shadow Tag', 'Quick Draw', 'Cute Charm',
		],
		unbanlist: [
			 'Aerodactyl-Base', 'Alakazam-Base', 'Annihilape', 'Arcanine-Hisui', 'Blastoise-Base', 'Beedrill-G', 'Butterfree-G', 'Charizard-Base', 'Clefable-Base', 'Ditto', 'Dragonite-Base', 'Exeggutor-Alola', 'Flareon', 'Gengar-Base', 'Iron Goro', 'Iron Soke', 'Jolteon', 'Kingdra', 'Machamp', 'Muk-Base', 'Ninetales-Alola', 'Pidgeot-Base', 'Pinsir-Base', 'Rhyperior', 'Sandslash-Alola', 'Sandy Shocks', 'Scream Tail', 'Snorlax', 'Tangrowth', 'Tauros-Base', 'Trembler', 'Usurperr', 'Valkaryia', 'Vaporeon', 'Venusaur-Base',
		],
	},
	{
		name: "[Gen 9] Re-Generations 1.0",
		mod: 'regenerations10',
		ruleset: [
			'Obtainable', 'Team Preview', 'HP Percentage Mod', 'Cancel Mod', 'Endless Battle Clause', 'Sleep Clause Mod', 'Forme Clause',
			'Nickname Clause', 'OHKO Clause', 'DryPass Clause', 'Moody Clause', 'Terastal Clause', 'Evasion Clause',
			'!Evasion Abilities Clause', 'Evasion Abilities Extended Clause', 'Accuracy Clause Mod',
		],
		banlist: [
			'ND Uber', 'ND AG', 'ND OU', 'ND UUBL', 'ND UU', 'ND RUBL', 'ND RU', 'ND NFE', 'ND LC',
			'Attract', 'Hidden Power', 'Last Respects', 'Shed Tail', 'Revival Blessing', 'Take Heart',
			'Focus Band', 'King\'s Rock', 'Razor Fang', 'Quick Claw', 'Berserk Gene',
			'Bug Gem', 'Dark Gem', 'Dragon Gem', 'Electric Gem', 'Fairy Gem', 'Fighting Gem', 'Fire Gem', 'Flying Gem', 'Ghost Gem',
			'Grass Gem', 'Ground Gem', 'Ice Gem', 'Poison Gem', 'Psychic Gem', 'Rock Gem', 'Steel Gem', 'Water Gem',
			'Shadow Tag', 'Quick Draw', 'Cute Charm',
		],
		unbanlist: [
			 'Aerodactyl-Base', 'Alakazam-Base', 'Annihilape', 'Arcanine-Hisui', 'Blastoise-Base', 'Beedrill-G', 'Butterfree-G', 'Charizard-Base', 'Clefable-Base', 'Ditto', 'Dragonite-Base', 'Exeggutor-Alola', 'Flareon', 'Gengar-Base', 'Iron Goro', 'Iron Soke', 'Jolteon', 'Kingdra', 'Machamp', 'Muk-Base', 'Ninetales-Alola', 'Pidgeot-Base', 'Pinsir-Base', 'Rhyperior', 'Sandslash-Alola', 'Sandy Shocks', 'Scream Tail', 'Snorlax', 'Tangrowth', 'Tauros-Base', 'Trembler', 'Usurperr', 'Valkaryia', 'Vaporeon', 'Venusaur-Base',
		],
	},
	{
		section: 'Draft Events',
		column: 1,
	},
	{
		name: "[Gen 9] Dual Monotype Draft",
		desc: 'Monotype draft with 2 types (in the less restrictive sense).',
		mod: 'gen9',
		ruleset: [
			'Standard', 'Evasion Abilities Clause', 'Terastal Clause', 'Double Same Type Clause', 'DryPass Clause', 'Moody Clause',
			'Min Level = 100', 'Min Team Size = 6',
		],
		banlist: [
			'Revival Blessing', 'Last Respects', 'Shed Tail', 'King\'s Rock', 'Razor Fang', 'Quick Claw',
		],
	},
	{
		name: "[Gen 9] NatDex Draft",
		mod: 'gen9',
		ruleset: ['Standard Draft', '+Unobtainable', '+Past', 'Min Source Gen = 1'],
	},
	{
		name: "[Gen 9] NatDex Draft (Tera Preview)",
		mod: 'gen9',
		ruleset: ['Standard Draft', '+Unobtainable', '+Past', 'Min Source Gen = 1', 'Tera Type Preview'],
	},
	{
		section: 'Draft Teams',
		column: 1,
	},
	{
		name: '[Ver] aedena',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Weavile', 'Lopunny-Mega', 'Mismagius', 'Rhyperior', 'Mantine', 'Wormadam-Trash', 'Kricketune', 'Rotom-Heat', 'Grotle',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Ver] ZygardeFGC',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Heatran-Base', 'Manaphy', 'Staraptor-Mega', 'Gligar', 'Umbreon', 'Roserade', 'Glalie-Base', 'Luxio',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Ver] Conn',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Garchomp-Base', 'Gardevoir-Mega', 'Magneton', 'Sneasel-Base', 'Porygon', 'Skuntank', 'Monferno', 'Prinplup', 'Cresselia', 'Duskull',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Ver] Mr.Smiles',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Azelf', 'Gastrodon', 'Rotom-Mow', 'Sylveon', 'Magmortar', 'Dusknoir', 'Staraptor-Base', 'Chatot'
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Ver] mirav3d',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Gliscor', 'Empoleon', 'Regieleki', 'Gallade-Base', 'Floatzel', 'Murkrow', 'Mr. Mime-Galar', 'Rotom-Base',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Ver] bbnate',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Mamoswine', 'Rotom-Wash', 'Magnezone', 'Yanmega', 'Drapion', 'Misdreavus', 'Magmar', 'Leafeon', 'Sudowoodo',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Ver] DMBeeeez',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Garchomp-Mega', 'Togekiss', 'Vaporeon', 'Bronzong', 'Tangrowth', 'Espeon', 'Purugly', 'Hippopotas',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Ver] gaillardia',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Chimecho-Mega', 'Infernape', 'Regirock', 'Roselia', 'Sandy Shocks', 'Lumineon', 'Regidrago', 'Ambipom',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Val] Mizuri',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Garchomp-Base', 'Weavile', 'Chimecho-Mega', 'Togekiss', 'Mantine', 'Rotom-Base', 'Sudowoodo',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Val] Mailducks',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Gardevoir-Mega', 'Magnezone', 'Regidrago', 'Gligar', 'Jolteon', 'Honchkrow', 'Dusclops',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Val] demirab1',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Manaphy', 'Infernape', 'Rotom-Mow', 'Snorlax', 'Dusknoir', 'Rhyperior', 'Mr. Mime-Base', 'Sneasel-Hisui',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Val] Hannah',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Heatran-Base', 'Lopunny-Mega', 'Rotom-Wash', 'Yanmega', 'Espeon', 'Piloswine', 'Roselia', 'Prinplup',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Val] Staniel',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Froslass-Mega', 'Empoleon', 'Toxicroak', 'Rotom-Heat', 'Shaymin-Base', 'Staraptor-Base', 'Gabite', 'Chimecho-Base',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Val] htz_Attila',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Staraptor-Mega', 'Tangela', 'Drapion', 'Bronzong', 'Magmortar', 'Electivire', 'Gastrodon', 'Froslass-Base',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Val] Jaime Deflin',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Gliscor', 'Regieleki', 'Gardevoir-Base', 'Mamoswine', 'Vaporeon', 'Magmar', 'Misdreavus', 'Porygon',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Val] Flabermaber',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Hippowdon', 'Garchomp-Mega', 'Lucario-Base', 'Tangrowth', 'Mismagius', 'Phione', 'Togetic', 'Kricketune',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Acu] Dodo',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Garchomp-Base', 'Azelf', 'Magnezone', 'Manaphy', 'Umbreon', 'Rotom-Base', 'Sudowoodo', 'Stunky',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Acu] Marquis',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Lopunny-Mega', 'Rotom-Heat', 'Mesprit', 'Mismagius', 'Rhyperior', 'Sneasel-Base', 'Roselia', 'Munchlax', 'Prinplup', 'Bronzor',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Acu] Mr. Noob',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Gliscor', 'Regieleki', 'Roserade', 'Floatzel', 'Porygon-Z', 'Mr. Mime-Base', 'Murkrow', 'Monferno', 'Kricketune',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Acu] Maki',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Gardevoir-Mega', 'Empoleon', 'Tangrowth', 'Froslass-Base', 'Rhydon', 'Drapion', 'Rotom-Fan', 'Purugly', 'Gible',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Acu] deltazero',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Cresselia', 'Lucario-Base', 'Gastrodon', 'Snorlax', 'Jolteon', 'Leafeon', 'Dusknoir', 'Staravia', 'Rampardos',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Acu] Dark',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Heatran-Base', 'Rotom-Wash', 'Mamoswine', 'Staraptor-Base', 'Torterra', 'Sylveon', 'Drifloon', 'Yanma',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Acu] Banjax',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Froslass-Mega', 'Infernape', 'Gligar', 'Bronzong', 'Rotom-Mow', 'Vaporeon', 'Sneasel-Hisui', 'Misdreavus', 'Porygon',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Acu] Axel',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Weavile', 'Regidrago', 'Porygon2', 'Registeel', 'Shaymin-Base', 'Mantine', 'Magmar', 'Togetic',
		],
		validateTeam: draftteams.validateTeam,
	},
	{
		name: '[Cor VGC] ZygardeFGC',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Staraptor-Mega', 'Rotom-Heat', 'Gastrodon', 'Azelf', 'Roserade', 'Togetic', 'Registeel', 'Toxicroak', 'Sudowoodo', 'Lickilicky',
		],
		validateTeam: draftteamsvgc.validateTeam,
	},
	{
		name: '[Cor VGC] Hog',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Porygon2', 'Rhyperior', 'Mr. Mime-Base', 'Staraptor-Base', 'Weavile', 'Lucario-Base', 'Rotom-Frost', 'Lumineon',
		],
		validateTeam: draftteamsvgc.validateTeam,
	},
	{
		name: '[Cor VGC] Skye',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Sylveon', 'Bronzong', 'Abomasnow-Mega', 'Empoleon', 'Gallade-Base', 'Magmortar', 'Dusknoir', 'Glaceon', 'Vespiquen',
		],
		validateTeam: draftteamsvgc.validateTeam,
	},
	{
		name: '[Cor VGC] Masterriolu',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Murkrow', 'Regidrago', 'Regieleki', 'Mamoswine', 'Floatzel', 'Ambipom', 'Tangrowth', 'Drapion', 'Flareon', 'Probopass',
		],
		validateTeam: draftteamsvgc.validateTeam,
	},
	{
		name: '[Cor VGC] Jaime Delfin',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Sneasler', 'Heatran-Base', 'Garchomp-Mega', 'Sandy Shocks', 'Iron Valiant', 'Vaporeon', 'Leafeon', 'Chansey', 'Blissey',
		],
		validateTeam: draftteamsvgc.validateTeam,
	},
	{
		name: '[Cor VGC] Moonbird',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Garchomp-Base', 'Chimecho-Mega', 'Gardevoir-Base', 'Rotom-Mow', 'Riolu', 'Rhydon', 'Mantine', 'Sneasel-Hisui', 'Monferno', 'Happiny',
		],
		validateTeam: draftteamsvgc.validateTeam,
	},
	{
		name: '[Cor VGC] Anthropomorphic_Blob',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Togekiss', 'Gallade-Mega', 'Rotom-Wash', 'Gliscor', 'Mismagius', 'Porygon-Z', 'Rampardos', 'Umbreon', 'Lopunny-Base', 'Drifloon',
		],
		validateTeam: draftteamsvgc.validateTeam,
	},
	{
		name: '[Cor VGC] Aves',
		challengeShow: false,
		searchShow: false,
		ruleset: ['Standard Generations'],
		unbanlist: [
			'Froslass-Mega', 'Infernape', 'Abomasnow-Base', 'Electabuzz', 'Uxie', 'Snorlax', 'Yanmega', 'Skuntank', 'Bronzor',
		],
		validateTeam: draftteamsvgc.validateTeam,
	},
	{
		section: 'Partner Communities',
		column: 1,
	},
	{
		name: '[Gen 9] 4v4 DUU',
		desc: 'Usage based UU VGC.',
		mod: 'gen9',
		gameType: 'doubles',
		// bestOfDefault: true,
		ruleset: [
			'Flat Rules', '!! Adjust Level = 50', 'Min Source Gen = 9', 'VGC Timer', 'Force Open Team Sheets', 'Evasion Moves Clause',
		],
		banlist: [
			'Urshifu', 'Flutter Mane', 'Incineroar', 'Raging Bolt', 'Landorus-I', 'Rillaboom', 'Ogerpon-Wellspring', 'Ogerpon-Hearthflame', 'Tornadus-I', 'Chien-Pao', 'Amoonguss', 'Farigiraf', 'Indeedee-F', 'Iron Crown', 'Gholdengo', 'Dragonite-Base', 'Gouging Fire', 'Ursaluna', 'Chi-Yu', 'Regidrago', 'Porygon2', 'Dondozo', 'Entei', 'Ting-Lu', 'Torkoal', 'Roaring Moon',
			// Banned via tiering action
			'Enamorus-I', 'Articuno-Base', 'Annihilape', 'Sneasler',
			'Commander',
			'Bright Powder', 'King\'s Rock', 'Razor Fang',
		],
	},
	{
		name: '[Gen 9] 4v4 DUU (Bo3)',
		desc: 'Usage based UU VGC.',
		mod: 'gen9',
		gameType: 'doubles',
		// bestOfDefault: true,
		ruleset: [
			'Flat Rules', '!! Adjust Level = 50', 'Min Source Gen = 9', 'VGC Timer', 'Force Open Team Sheets', 'Evasion Moves Clause', 'Best Of = 3',
		],
		banlist: [
			'Urshifu', 'Flutter Mane', 'Incineroar', 'Raging Bolt', 'Landorus-I', 'Rillaboom', 'Ogerpon-Wellspring', 'Ogerpon-Hearthflame', 'Tornadus-I', 'Chien-Pao', 'Amoonguss', 'Farigiraf', 'Indeedee-F', 'Iron Crown', 'Gholdengo', 'Dragonite-Base', 'Gouging Fire', 'Ursaluna', 'Chi-Yu', 'Regidrago', 'Porygon2', 'Dondozo', 'Entei', 'Ting-Lu', 'Torkoal', 'Roaring Moon',
			// Banned via tiering action
			'Enamorus-I', 'Articuno-Base', 'Annihilape', 'Sneasler',
			'Commander',
			'Bright Powder', 'King\'s Rock', 'Razor Fang',
		],
	},
	{
		name: '[Gen 9] ND VGC LC',
		desc: 'VGC with unevolved pokemon only.',
		mod: 'gen9',
		gameType: 'doubles',
		// bestOfDefault: true,
		ruleset: [
			'Standard Doubles', 'NatDex Mod', 'Picked Team Size = 4', 'Little Cup', '!! Max Level = 50', 'Z-Move Clause', 'Terastal Clause', '!Species Clause', 'Forme Clause', 'Item Clause = 1', 'Evasion Clause', 'VGC Timer', 'Limit One Restricted', 'Open Team Sheets',
		],
		restricted: [
			'Scyther', 'Tangela', 'Stantler', 'Sneasel-Hisui', 'Qwilfish-Hisui', 'Murkrow', 'Misdreavus', 'Gligar', 'Girafarig', 'Cottonee', 'Clamperl', 'Basculin-White-Striped', 'Sneasel', 'Corsola-Galar',
		],
		banlist: [
			'Duraludon', 'Type: Null',
			'Commander', 'Power Construct', 'Shadow Tag', 'Assist',
		],
	},
	{
		name: '[Gen 9] ND VGC LC (Bo3)',
		desc: 'VGC with unevolved pokemon only.',
		mod: 'gen9',
		gameType: 'doubles',
		// bestOfDefault: true,
		ruleset: [
			'Standard Doubles', 'NatDex Mod', 'Picked Team Size = 4', 'Little Cup', '!! Max Level = 50', 'Z-Move Clause', 'Terastal Clause', '!Species Clause', 'Forme Clause', 'Item Clause = 1', 'Evasion Clause', 'VGC Timer', 'Limit One Restricted', 'Open Team Sheets', 'Best Of = 3',
		],
		restricted: [
			'Scyther', 'Tangela', 'Stantler', 'Sneasel-Hisui', 'Qwilfish-Hisui', 'Murkrow', 'Misdreavus', 'Gligar', 'Girafarig', 'Cottonee', 'Clamperl', 'Basculin-White-Striped', 'Sneasel', 'Corsola-Galar',
		],
		banlist: [
			'Duraludon', 'Type: Null',
			'Commander', 'Power Construct', 'Shadow Tag', 'Assist',
		],
	},

	// endregion

	// region 35 Pokes Main

	{
		section: '35 Pokes 2026',
		column: 2,
	},
	{
		name: "[Gen 9] ND 35 Pokes [Feb 2026]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		unbanlist: [
			'Articuno-Galar', 'Aurorus', 'Bellossom', 'Bewear', 'Blastoise-Base', 'Dodrio', 'Entei', 'Falinks-Base', 'Flygon', 'Furret', 'Goodra-Hisui', 'Gumshoos-Base', 'Heliolisk', 'Hydrapple', 'Indeedee-F', 'Iron Thorns', 'Leavanny', 'Lickilicky', 'Ludicolo', 'Maractus', 'Meganium-Base', 'Polteageist', 'Probopass', 'Regieleki', 'Rhyperior', 'Seismitoad', 'Shiinotic', 'Slaking', 'Spidops', 'Spiritomb', 'Unfezant', 'Vanilluxe', 'Victreebel-Base', 'Weezing-Galar', 'Wyrdeer',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Jan 2026]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		unbanlist: [
			'Carracosta', 'Celebi', 'Cinccino', 'Cobalion', 'Cradily', 'Dedenne', 'Fezandipiti', 'Gabite', 'Granbull', 'Greedent', 'Hatterene', 'Heatmor', 'Houndstone', 'Indeedee-M', 'Lilligant-Base', 'Medicham-Base', 'Orbeetle', 'Oricorio-Pom-Pom', 'Overqwil', 'Pincurchin', 'Pinsir-Base', 'Rotom-Wash', 'Samurott-Base', 'Scovillain-Base', 'Sharpedo-Base', 'Shedinja', 'Shiftry', 'Steelix-Base', 'Tropius', 'Type: Null', 'Typhlosion-Hisui', 'Tyrantrum', 'Veluza', 'Vivillon', 'Whimsicott',
		],
	},
	{
		section: '35 Pokes 2025',
		column: 2,
	},
	{
		name: "[Gen 9] ND 35 Pokes [Dec 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		unbanlist: [
			'Mamoswine', 'Oricorio-Baile', 'Galvantula', 'Bombirdier', 'Gothitelle', 'Drampa-Base', 'Perrserker', 'Glastrier', 'Klinklang', 'Walrein', 
			'Uxie', 'Vanilluxe', 'Serperior', 'Revavroom', 'Falinks-Base', 'Braviary-Hisui', 'Wyrdeer', 'Beedrill-Base', 'Blastoise-Base', 'Squawkabilly-Green', 
			'Swoobat', 'Lurantis-Base', 'Hypno', 'Scrafty-Base', 'Sinistcha', 'Cyclizar', 'Mothim', 'Mismagius', 'Goodra-Base', 'Mandibuzz', 'Delcatty', 
			'Skarmory-Base', 'Cherrim-Base', 'Centiskorch', 'Wishiwashi',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Nov 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy',
			'Altaria-Base', 'Ampharos-Base', 'Arbok', 'Armaldo', 'Calyrex-Base', 'Castform-Base', 'Dewgong', 'Drifblim', 'Emolga', 'Fearow', 'Furret', 'Glalie-Base', 'Gumshoos-Base', 'Heliolisk', 'Jumpluff', 'Kecleon', 'Ludicolo', 'Lunatone', 'Luxray', 'Lycanroc-Midnight', 'Meowstic-M', 'Primeape', 'Pupitar', 'Pyroar-Base', 'Rampardos', 'Scovillain-Base', 'Silvally-Fairy', 'Simisage', 'Sneasel-Hisui', 'Spidops', 'Swalot', 'Thievul', 'Tinkaton', 'Whiscash', 'Zangoose',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Oct 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy',
			'Ambipom', 'Armarouge', 'Articuno-Base', 'Basculegion-F', 'Bibarel', 'Copperajah', 'Corviknight', 'Crobat', 'Dudunsparce', 'Dugtrio-Alola', 'Farigiraf', 'Floatzel', 'Froslass-Base', 'Golem-Alola', 'Hippowdon', 'Magmortar', 'Meganium-Base', 'Moltres-Base', 'Muk-Alola', 'Munkidori', 'Nidoking', 'Ninjask', 'Orthworm', 'Perrserker', 'Porygon-Z', 'Pyukumuku', 'Sandslash-Base', 'Sigilyph', 'Simisear', 'Sirfetch’d', 'Steelix-Base', 'Tauros-Base', 'Tauros-Paldea-Aqua', 'Weezing-Galar', 'Zoroark-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Sep 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy',
			'Arbok', 'Avalugg-Base', 'Cacturne', 'Chesnaught-Base', 'Clodsire', 'Cobalion', 'Crawdaunt', 'Eldegoss', 'Empoleon', 'Falinks-Base', 'Feraligatr-Base', 'Ferrothorn', 'Florges', 'Galvantula', 'Grimmsnarl', 'Klawf', 'Lucario-Base', 'Ludicolo', 'Mantine', 'Marowak-Alola', 'Milotic', 'Musharna', 'Overqwil', 'Pincurchin', 'Primeape', 'Regice', 'Sceptile-Base', 'Scolipede-Base', 'Silvally-Dragon', 'Slurpuff', 'Torterra', 'Toxicroak', 'Trapinch', 'Vikavolt-Base', 'Wormadam-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Aug 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy',
			'Amoonguss', 'Arcanine-Base', 'Basculegion-F', 'Beartic', 'Brambleghast', 'Chandelure-Base', 'Chesnaught-Base', 'Cobalion', 'Copperajah', 'Cramorant-Base', 'Cursola', 'Dugtrio-Base', 'Eldegoss', 'Flygon', 'Froslass-Base', 'Frosmoth', 'Gabite', 'Gardevoir-Base', 'Hatterene', 'Heliolisk', 'Incineroar', 'Jolteon', 'Liepard', 'Maractus', 'Maushold', 'Oricorio-Pom-Pom', 'Overqwil', 'Shedinja', 'Stoutland', 'Sylveon', 'Scizor-Base', 'Toxicroak', 'Uxie', 'Weavile', 'Yanmega',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Jul 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy',
			'Arctovish', 'Azumarill', 'Blastoise-Base', 'Boltund', 'Bouffalant', 'Brambleghast', 'Braviary-Base', 'Chimecho-Base', 'Cofagrigus', 'Dachsbun', 'Darmanitan-Base', 'Delibird', 'Drakloak', 'Feraligatr-Base', 'Floatzel', 'Flygon', 'Grapploct', 'Incineroar', 'Kleavor', 'Lunatone', 'Mabosstiff', 'Marowak-Alola', 'Meowstic-F', 'Minun', 'Obstagoon', 'Persian-Alola', 'Primeape', 'Rapidash-Base', 'Raticate-Base', 'Reuniclus', 'Rotom-Mow', 'Sandaconda', 'Silvally-Ground', 'Simisage', 'Slowbro-Galar', 'Slowking-Base', 'Slowking-Galar', 'Starmie-Base', 'Tentacruel', 'Toedscruel',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Jun 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy',
			'Arbok', 'Archeops', 'Arctozolt', 'Bruxish', 'Calyrex-Base', 'Ditto', 'Drakloak', 'Dugtrio-Alola', 'Electrode-Base',
			'Escavalier', 'Espeon', 'Furfrou', 'Glimmora-Base', 'Grapploct', 'Honchkrow', 'Klawf', 'Lunatone', 'Luvdisc',
			'Masquerain', 'Mienshao', 'Mimikyu-Base', 'Orbeetle', 'Primeape', 'Purugly', 'Quaquaval', 'Rabsca', 'Simipour',
			'Simisage', 'Slowking-Base', 'Slowking-Galar', 'Smeargle', 'Tangrowth', 'Toedscruel', 'Tyranitar-Base', 'Uxie',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [May 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy',
			'Inteleon', 'Dragonair', 'Vivillon', 'Heatmor', 'Cinccino', 'Lopunny-Base', 'Politoed', 'Skarmory-Base', 'Maushold',
			'Nidoking', 'Jumpluff', 'Ribombee-Base', 'Mudsdale', 'Drednaw', 'Meganium-Base', 'Kecleon', 'Barraskewda', 'Goodra-Base',
			'Carbink', 'Raichu-Base', 'Honchkrow', 'Venusaur-Base', 'Cofagrigus', 'Lokix', 'Frosmoth', 'Pinsir-Base', 'Empoleon',
			'Shiinotic', 'Hitmontop', 'Claydol', 'Tangrowth', 'Swoobat', 'Swellow', 'Mienshao', 'Ninetales-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Apr 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy',
			'Kingdra', 'Crustle', 'Corsola-Base', 'Dipplin', 'Dusknoir', 'Drampa-Base', 'Pincurchin', 'Type: Null', 'Camerupt-Base',
			'Rotom-Base', 'Raticate-Base', 'Bombirdier', 'Cradily', 'Beedrill-Base', 'Gastrodon', 'Donphan', 'Chimecho-Base', 'Coalossal',
			'Dustox', 'Dedenne', 'Kecleon', 'Flareon', 'Cyclizar', 'Grumpig', 'Tentacruel', 'Miltank', 'Arcanine-Base',
			'Shelgon', 'Spinda', 'Wormadam-Sandy', 'Exploud', 'Marowak-Base', 'Hypno', 'Furret', 'Bastiodon',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Mar 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Gourgeist-Small', 'Kingler', 'Rapidash-Base', 'Accelgor', 'Ariados', 'Magcargo', 'Sudowoodo', 'Qwilfish-Base', 'Eldegoss',
			'Stunfisk-Base', 'Raichu-Base', 'Klawf', 'Scolipede-Base', 'Gabite', 'Jynx', 'Linoone-Base', 'Unfezant', 'Revavroom',
			'Appletun', 'Kabutops', 'Wyrdeer', 'Charizard-Base', 'Grafaiai', 'Golem-Base', 'Medicham-Base', 'Thievul', 'Lucario-Base',
			'Mantine', 'Wormadam-Trash', 'Morpeko-Base', 'Drifblim', 'Granbull', 'Swalot', 'Aggron-Base', 'Luxray',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Feb 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Rapidash-Galar', 'Whiscash', 'Scrafty-Base', 'Uxie', 'Arbok', 'Zangoose', 'Carnivine', 'Persian-Alola', 'Emolga',
			'Araquanid-Base', 'Pincurchin', 'Hitmonchan', 'Maractus', 'Dewgong', 'Spinda', 'Breloom', 'Parasect', 'Sigilyph',
			'Ambipom', 'Zygarde-10%', 'Tauros-Base', 'Glalie-Base', 'Golduck', 'Pangoro', 'Weezing-Base', 'Zweilous', 'Pinsir-Base',
			'Musharna', 'Cacturne', 'Regigigas', 'Arctozolt', 'Bewear', 'Kecleon', 'Alcremie', 'Togedemaru-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Jan 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Clodsire', 'Comfey', 'Probopass', 'Bellibolt', 'Wugtrio', 'Unown', 'Shiftry', 'Swanna', 'Houndoom-Base',
			'Oricorio-Pom-Pom', 'Cursola', 'Slowbro-Base', 'Goodra-Base', 'Torkoal', 'Shaymin-Base', 'Infernape', 'Mesprit', 'Alcremie',
			'Golurk-Base', 'Dachsbun', 'Vileplume', 'Scyther', 'Donphan', 'Toedscruel', 'Sawsbuck', 'Reuniclus', 'Spiritomb',
			'Type: Null', 'Virizion', 'Absol-Base', 'Flapple', 'Crawdaunt', 'Kecleon', 'Jynx', 'Kingdra',
		],
	},
	{
		section: '35 Pokes 2024',
		column: 2,
	},
	{
		name: "[Gen 9] ND 35 Pokes [Dec 2024 AG]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes', '!35 Pokes Mega Clause'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Golem-Alola', 'Zoroark-Base', 'Pyukumuku', 'Guzzlord', 'Wugtrio', 'Garbodor', 'Aurorus', 'Morpeko-Base', 'Walrein',
			'Roserade', 'Ribombee-Base', 'Carracosta', 'Perrserker', 'Cryogonal', 'Appletun', 'Primarina', 'Pachirisu', 'Banette-Base',
			'Celebi', 'Avalugg-Base', 'Wo-Chien', 'Pupitar', 'Cetitan', 'Milotic', 'Scovillain-Base', 'Dipplin', 'Chandelure-Base',
			'Toxicroak', 'Magmortar', 'Yanmega', 'Cacturne', 'Luvdisc', 'Mawile-Base', 'Jumpluff', 'Rotom-Frost',
			'Jolteon', 'Lokix', 'Okidogi', 'Banette-Mega', 'Mawile-Mega',
			'Bug Gem', 'Dark Gem', 'Dragon Gem', 'Electric Gem', 'Fairy Gem', 'Fighting Gem', 'Fire Gem', 'Flying Gem', 'Ghost Gem',
			'Grass Gem', 'Ground Gem', 'Ice Gem', 'Poison Gem', 'Psychic Gem', 'Rock Gem', 'Steel Gem', 'Water Gem',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Dec 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Golem-Alola', 'Zoroark-Base', 'Pyukumuku', 'Guzzlord', 'Wugtrio', 'Garbodor', 'Aurorus', 'Morpeko-Base', 'Walrein',
			'Roserade', 'Ribombee-Base', 'Carracosta', 'Perrserker', 'Cryogonal', 'Appletun', 'Primarina', 'Pachirisu', 'Banette-Base',
			'Celebi', 'Avalugg-Base', 'Wo-Chien', 'Pupitar', 'Cetitan', 'Milotic', 'Scovillain-Base', 'Dipplin', 'Chandelure-Base',
			'Toxicroak', 'Magmortar', 'Yanmega', 'Cacturne', 'Luvdisc', 'Mawile-Base', 'Jumpluff', 'Rotom-Frost',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Nov 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Wishiwashi-Base', 'Ampharos-Base', 'Tsareena', 'Glaceon', 'Centiskorch', 'Frosmoth', 'Exeggutor-Base', 'Shelgon', 'Granbull',
			'Guzzlord', 'Reuniclus', 'Spiritomb', 'Unown', 'Shedinja', 'Lurantis-Base', 'Gabite', 'Gourgeist-Base', 'Ledian',
			'Golduck', 'Qwilfish-Base', 'Pinsir-Base', 'Gumshoos-Base', 'Wigglytuff', 'Arbok', 'Dusknoir', 'Araquanid-Base', 'Kecleon',
			'Exeggutor-Alola', 'Trapinch', 'Appletun', 'Turtonator', 'Drampa-Base', 'Gorebyss', 'Gourgeist-Super', 'Galvantula',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Oct 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Ninjask', 'Perrserker', 'Klinklang', 'Snorlax', 'Houndstone', 'Amoonguss', 'Seviper', 'Rhydon', 'Vigoroth',
			'Bellossom', 'Sandaconda', 'Samurott-Base', 'Honchkrow', 'Scyther', 'Clawitzer', 'Bisharp', 'Sinistcha-Base', 'Guzzlord',
			'Porygon-Z', 'Sylveon', 'Sudowoodo', 'Vikavolt-Base', 'Noivern', 'Blastoise-Base', 'Dudunsparce', 'Dugtrio-Alola', 'Gengar-Base',
			'Emboar-Base', 'Munkidori', 'Zoroark-Hisui', 'Stoutland', 'Accelgor', 'Stunfisk-Base', 'Magmortar', 'Doublade',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Sep 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Starmie-Base', 'Muk-Alola', 'Krookodile', 'Slowking-Galar', 'Gabite', 'Florges', 'Bellibolt', 'Rotom-Fan', 'Beartic',
			'Hatterene', 'Fearow', 'Simisage', 'Pyroar-Base', 'Politoed', 'Mudsdale', 'Manectric-Base', 'Rhydon', 'Simisear',
			'Basculin-White-Striped', 'Swalot', 'Wyrdeer', 'Klawf', 'Flareon', 'Wugtrio', 'Glimmora-Base', 'Clodsire', 'Armaldo',
			'Togedemaru-Base', 'Toxicroak', 'Arctibax', 'Komala', 'Spidops', 'Sandslash-Alola', 'Dustox', 'Accelgor',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Aug 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Mandibuzz', 'Braviary-Base', 'Dusclops', 'Sawk', 'Corsola-Base', 'Maushold-Base', 'Vivillon', 'Runerigus', 'Chesnaught-Base',
			'Rotom-Heat', 'Dhelmise', 'Illumise', 'Seviper', 'Boltund', 'Braviary-Hisui', 'Mamoswine', 'Charizard-Base', 'Smeargle',
			'Donphan', 'Musharna', 'Muk-Alola', 'Frosmoth', 'Sableye-Base', 'Blissey', 'Heracross-Base', 'Eelektross-Base', 'Trapinch',
			'Fezandipiti', 'Golem-Alola', 'Lanturn', 'Quagsire', 'Squawkabilly-Yellow', 'Cradily', 'Scizor-Base', 'Vanilluxe',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Jul 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Venusaur-Base', 'Shiftry', 'Mabosstiff', 'Donphan', 'Rotom-Heat', 'Garbodor', 'Blastoise-Base', 'Oricorio-Pom-Pom', 'Tinkaton',
			'Lilligant-Base', 'Claydol', 'Brambleghast', 'Noctowl', 'Aggron-Base', 'Rapidash-Galar', 'Muk-Base', 'Rampardos', 'Houndoom-Base',
			'Masquerain', 'Dachsbun', 'Cloyster', 'Rotom-Mow', 'Flareon', 'Eiscue-Base', 'Hitmontop', 'Charizard-Base', 'Primeape',
			'Shedinja', 'Pawmot', 'Goodra-Base', 'Mantine', 'Furret', 'Slurpuff', 'Torterra', 'Scrafty-Base', 'Yanmega',
			'Mamoswine', 'Dondozo', 'Porygon2', 'Kingdra', 'Chesnaught-Base', 'Ferrothorn', 'Zebstrika', 'Regice',
			'Slowking-Base', 'Klawf', 'Trapinch',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Jun 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Mimikyu-Base', 'Cacturne', 'Mabosstiff', 'Cyclizar', 'Raticate-Alola', 'Wyrdeer', 'Pincurchin', 'Slowbro-Galar', 'Arboliva',
			'Heliolisk', 'Trapinch', 'Runerigus', 'Gabite', 'Illumise', 'Probopass', 'Banette-Base', 'Exeggutor-Base', 'Registeel',
			'Squawkabilly-Base', 'Delphox-Base', 'Spidops', 'Indeedee-M', 'Scyther', 'Fearow', 'Magcargo', 'Walrein', 'Crabominable-Base',
			'Toxicroak', 'Bellibolt', 'Rotom-Wash', 'Avalugg-Base', 'Raichu-Alola', 'Sirfetch’d', 'Talonflame', 'Kricketune',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [May 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Carbink', 'Mantine', 'Dusknoir', 'Cryogonal', 'Milotic', 'Mr. Mime-Base', 'Hitmonchan', 'Shiinotic', 'Beheeyem',
			'Drampa-Base', 'Oinkologne-F', 'Dustox', 'Sunflora', 'Raichu-Alola', 'Meowstic-Base', 'Dachsbun', 'Calyrex-Base', 'Arbok',
			'Octillery', 'Maushold-Base', 'Grafaiai', 'Torkoal', 'Miltank', 'Froslass-Base', 'Ariados', 'Sableye-Base', 'Cherrim-Base',
			'Simisear', 'Salazzle-Base', 'Zoroark-Base', 'Emolga', 'Wobbuffet', 'Klawf', 'Delcatty', 'Drakloak',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Apr 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Lokix', 'Sandslash-Alola', 'Altaria-Base', 'Gengar-Base', 'Drampa-Base', 'Dugtrio-Alola', 'Stoutland', 'Golisopod-Base', 'Abomasnow-Base',
			'Frosmoth', 'Fezandipiti', 'Golduck', 'Vespiquen', 'Decidueye-Base', 'Charizard-Base', 'Hippowdon', 'Rabsca', 'Coalossal',
			'Houndstone', 'Leafeon', 'Glaceon', 'Slowking-Base', 'Manectric-Base', 'Alomomola', 'Accelgor', 'Mismagius', 'Dachsbun',
			'Tentacruel', 'Sandslash-Base', 'Tinkaton', 'Roserade', 'Sableye-Base', 'Palossand', 'Cobalion', 'Garbodor',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Mar 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Oricorio-Base', 'Wigglytuff', 'Phione', 'Politoed', 'Ninjask', 'Samurott-Base', 'Galvantula', 'Mesprit', 'Scrafty-Base',
			'Rotom-Fan', 'Greedent', 'Seaking', 'Swampert-Base', 'Weezing-Galar', 'Shelgon', 'Leafeon', 'Cacturne', 'Turtonator',
			'Magmortar', 'Lilligant-Base', 'Sirfetch’d', 'Oricorio-Sensu', 'Persian-Alola', 'Farigiraf', 'Pinsir-Base', 'Primeape', 'Tatsugiri-Base',
			'Dugtrio-Alola', 'Flygon', 'Regice', 'Ditto', 'Grafaiai', 'Pidgeot-Base', 'Palossand', 'Ribombee-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Feb 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Tauros-Paldea-Blaze', 'Ceruledge', 'Klinklang', 'Houndstone', 'Gothitelle', 'Snorlax', 'Sandslash-Base', 'Morpeko-Base', 'Sawk',
			'Nidoqueen', 'Lickilicky', 'Shiftry', 'Vanilluxe', 'Jynx', 'Wormadam-Trash', 'Vigoroth', 'Mr. Rime', 'Skarmory-Base',
			'Tyrantrum', 'Aromatisse', 'Primarina', 'Golem-Alola', 'Maushold-Base', 'Pangoro', 'Malamar-Base', 'Clodsire', 'Klawf',
			'Meganium-Base', 'Quagsire', 'Toxicroak', 'Wugtrio', 'Walrein', 'Raichu-Base', 'Serperior', 'Zebstrika',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Jan 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Hatterene', 'Drakloak', 'Luvdisc', 'Tangrowth', 'Snorlax', 'Starmie-Base', 'Ursaring', 'Appletun', 'Stoutland',
			'Musharna', 'Chatot', 'Masquerain', 'Gorebyss', 'Kecleon', 'Avalugg-Hisui', 'Rhyperior', 'Beedrill-Base', 'Meowstic-F',
			'Probopass', 'Dewgong', 'Braviary-Base', 'Houndoom-Base', 'Gothitelle', 'Crobat', 'Tentacruel', 'Eldegoss', 'Seaking',
			'Lapras', 'Ferrothorn', 'Dubwool', 'Araquanid-Base', 'Yanmega', 'Dudunsparce', 'Slowking-Base', 'Lucario-Base',
		],
	},
	{
		section: '35 Pokes 2023',
		column: 2,
	},
	{
		name: "[Gen 9] ND 35 Pokes [Dec 2023]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Mabosstiff', 'Eelektross-Base', 'Camerupt-Base', 'Grapploct', 'Drifblim', 'Ampharos-Base', 'Lurantis-Base', 'Gyarados-Base', 'Hypno',
			'Druddigon', 'Durant', 'Chesnaught-Base', 'Gastrodon', 'Eldegoss', 'Pelipper', 'Dodrio', 'Wailord', 'Emolga',
			'Dachsbun', 'Drampa-Base', 'Trevenant', 'Passimian', 'Beautifly', 'Tyranitar-Base', 'Regirock', 'Stunfisk-Galar', 'Morpeko-Base',
			'Jumpluff', 'Heatmor', 'Froslass-Base', 'Audino-Base', 'Cetitan', 'Pincurchin', 'Cradily', 'Ninetales-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Nov 2023]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Copperajah', 'Dhelmise', 'Mudsdale', 'Veluza', 'Bellossom', 'Tropius', 'Cramorant-Base', 'Jellicent', 'Boltund',
			'Scolipede-Base', 'Typhlosion-Base', 'Klefki', 'Metagross-Base', 'Swoobat', 'Honchkrow', 'Cursola', 'Revavroom', 'Swampert-Base',
			'Garbodor', 'Electivire', 'Slurpuff', 'Jynx', 'Bombirdier', 'Mismagius', 'Wyrdeer', 'Lanturn', 'Carnivine',
			'Kangaskhan-Base', 'Bellibolt', 'Kingdra', 'Perrserker', 'Steelix-Base', 'Alcremie', 'Heliolisk', 'Beartic',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Oct 2023 B]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Liepard', 'Dragalge-Base', 'Clefable-Base', 'Clodsire', 'Gigalith', 'Cacturne', 'Porygon2', 'Shuckle', 'Emboar-Base',
			'Doublade', 'Phione', 'Lumineon', 'Toucannon', 'Mandibuzz', 'Cinccino', 'Avalugg-Hisui', 'Sceptile-Base', 'Toedscruel',
			'Hitmontop', 'Golem-Alola', 'Dugtrio-Base', 'Mr. Rime', 'Ariados', 'Pachirisu', 'Ambipom', 'Volbeat', 'Centiskorch',
			'Shiinotic', 'Poliwrath', 'Stoutland', 'Banette-Base', 'Aurorus', 'Mawile-Base', 'Sableye-Base', 'Orthworm',
			'Rotom-Mow', 'Sandslash-Alola', 'Toxicroak', 'Roserade', 'Lopunny-Base', 'Luxray', 'Solrock', 'Cryogonal', 'Noctowl',
			// 'Xatu', banned
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Oct 2023]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Liepard', 'Dragalge-Base', 'Clefable-Base', 'Clodsire', 'Gigalith', 'Cacturne', 'Porygon2', 'Mimikyu-Base', 'Scovillain-Base',
			'Lycanroc-Base', 'Jolteon', 'Bisharp', 'Togekiss', 'Starmie-Base', 'Shuckle', 'Emboar-Base', 'Doublade', 'Phione',
			'Lumineon', 'Toucannon', 'Mandibuzz', 'Rotom-Base', 'Falinks-Base', 'Magnezone', 'Dondozo', 'Brambleghast', 'Goodra-Base',
			'Articuno-Base', 'Cinccino', 'Avalugg-Hisui', 'Sceptile-Base', 'Toedscruel', 'Hitmontop', 'Golem-Alola', 'Dugtrio-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Sep 2023]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Zoroark-Hisui', 'Yanmega', 'Mothim', 'Rapidash-Galar', 'Drapion', 'Chimecho-Base', 'Espeon', 'Vaporeon', 'Mamoswine',
			'Vespiquen', 'Barbaracle-Base', 'Shedinja', 'Alakazam-Base', 'Glaceon', 'Staraptor-Base', 'Electrode-Hisui', 'Lickilicky', 'Whiscash',
			'Cherrim-Base', 'Armaldo', 'Slowking-Base', 'Kingler', 'Dudunsparce', 'Watchog', 'Flygon', 'Granbull', 'Decidueye-Base',
			'Flareon', 'Bronzong', 'Rampardos', 'Fearow', 'Relicanth', 'Hitmonlee', 'Altaria-Base', 'Tinkaton',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Aug 2023]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Vileplume', 'Swanna', 'Yanmega', 'Heracross-Base', 'Nidoking', 'Leafeon', 'Kricketune', 'Swellow', 'Comfey',
			'Bibarel', 'Empoleon', 'Ludicolo', 'Tangrowth', 'Simisear', 'Parasect', 'Krookodile', 'Eelektross-Base', 'Abomasnow-Base',
			'Avalugg-Base', 'Bastiodon', 'Dusclops', 'Minior-Base', 'Masquerain', 'Victreebel-Base', 'Rabsca', 'Linoone-Base', 'Omastar',
			'Politoed', 'Ledian', 'Donphan', 'Magcargo', 'Bombirdier', 'Dedenne', 'Butterfree', 'Jynx',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes [Jul 2023]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy', 'Shed Tail',
			'Leavanny', 'Masquerain', 'Eiscue-Base', 'Torterra', 'Dragonair', 'Runerigus', 'Swalot', 'Muk-Alola', 'Musharna',
			'Hippowdon', 'Alomomola', 'Aggron-Base', 'Umbreon', 'Galvantula', 'Pawmot', 'Quagsire', 'Slurpuff', 'Sigilyph',
			'Vaporeon', 'Blastoise-Base', 'Aegislash-Base', 'Scizor-Base', 'Spiritomb', 'Golisopod-Base', 'Clawitzer', 'Ninetales-Base', 'Delphox-Base',
			'Typhlosion-Base', 'Marowak-Base', 'Porygon-Z', 'Jumpluff', 'Absol-Base', 'Porygon2', 'Rotom-Frost', 'Rotom-Mow',
		],
	},

	// endregion

	// region 35 Pokes Side

	{
		section: '35 Pokes Randomized',
		column: 3
	},
	{
		name: "[Gen 9] 35 Factory",
		desc: `Randomized teams of Pok&eacute;mon for a generated 35 Pokes tier with sets that are competitively viable.`,
		mod: 'gen9',
		team: 'random35Factory',
		ruleset: ['Standard NatDex', '!Obtainable Formes', '!Species Clause', 'Forme Clause', '!Evasion Clause', 'Terastal Clause'],
		onBegin() {
			this.add(`raw|<div class="broadcast-blue"><b>35 Factory Tier: ${this.teamGenerator.factoryTier}</b></div>`);
		},
	},
	{
		section: '35 Pokes Perfect',
		column: 3
	},
	{
		name: "[Gen 9] ND 35 Pokes Perfect [A1]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Silvally > 1', 'Light Clay',
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy',
			'Kangaskhan-Base', 'Wigglytuff', 'Komala', 'Haunter', 'Golurk-Base', 'Cofagrigus', 'Glalie-Base', 'Mr. Rime', 'Kadabra', 'Medicham-Base', 'Hitmonchan', 'Poliwrath', 'Simipour', 'Mantine', 'Silvally-Flying', 'Archeops', 'Klawf', 'Aurorus', 'Mawile-Base', 'Togedemaru-Base', 'Electrode-Base', 'Vikavolt-Base', 'Pinsir-Base', 'Wormadam-Trash', 'Simisage', 'Shiinotic', 'Victreebel-Base', 'Skuntank', 'Silvally-Dark', 'Guzzlord', 'Silvally-Dragon', 'Turtonator', 'Simisear', 'Camerupt-Base', 'Sandslash-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Perfect [A2]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		banlist: [
			'Silvally > 1', 'Light Clay',
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy',
			'Cacturne', 'Seviper', 'Komala', 'Leafeon', 'Copperajah', 'Rotom-Fan', 'Armaldo', 'Mr. Rime', 'Cryogonal', 'Medicham-Base', 'Silvally-Psychic', 'Silvally-Fighting', 'Toxicroak', 'Mantine', 'Purugly', 'Archeops', 'Toucannon', 'Aurorus', 'Mawile-Base', 'Togedemaru-Base', 'Frogadier', 'Vikavolt-Base', 'Pinsir-Base', 'Wugtrio', 'Dragonair', 'Shiinotic', 'Dusknoir', 'Skuntank', 'Silvally-Dark', 'Runerigus', 'Misdreavus', 'Turtonator', 'Rapidash-Base', 'Camerupt-Base', 'Sandslash-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Perfect [A3]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes', '!Sleep Clause Mod', 'Sleep Moves Clause'],
		banlist: [
			'Silvally > 1', 'Light Clay', 'Silvally-Steel + Swords Dance',
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy',
			'Archeops', 'Aromatisse', 'Aurorus', 'Braviary-Base', 'Cacturne', 'Centiskorch', 'Copperajah', 'Donphan', 'Drampa-Base', 'Dusknoir', 'Eelektross-Base', 'Escavalier', 'Forretress', 'Gurdurr', 'Guzzlord', 'Hitmonchan', 'Kadabra', 'Kangaskhan-Base', 'Mantine', 'Mesprit', 'Mismagius', 'Mr. Rime', 'Passimian', 'Rapidash-Base', 'Rhydon', 'Roserade', 'Rotom-Fan', 'Runerigus', 'Samurott-Base', 'Silvally-Fairy', 'Silvally-Poison', 'Silvally-Steel', 'Skuntank', 'Tentacruel', 'Tsareena', 'Turtonator', 'Vikavolt-Base',
		],
	},
	{
		name: "[Gen 3] 35 Pokes Perfect [B1]",
		mod: 'perfectb1',
		validatorMod: 'gen9',
		ruleset: [
			// from Custom Game
			'HP Percentage Mod', 'Cancel Mod', 'Endless Battle Clause',
			// from 35 Pokes / Natdex
			'Obtainable', '+Unobtainable', '+Past', 'Sketch Post-Gen 7 Moves', 'Nickname Clause', 'OHKO Clause', 'Evasion Clause',
			'Sleep Clause Mod', 'Forme Clause',
			// B1 specific
			'One Boost Passer Clause',

			'#empoleon+sandstream+anchorshot',
			'#articuno+snowwarning+batonpass',
			'#electivire+encore',
			'#rapidash+regenerator+rapidspin',
			'#klinklang+superpower',
			'#farigiraf+toughclaws+firefang',
			'#seismitoad+bulkup+roar',
			'#raichualola+swiftswim',
			'#noivern+haze+pursuit',
			'#altaria+saltcure+wish',
			'#claydol+scrappy+rapidspin',
			'#armaldo+unaware+spikes',
			'#escavalier+speedswap',
			'#uxie+whirlwind',
			'#glalie+angershell',
			'#centiskorch+firstimpression+stoneedge',
			'#rotom+hydropump+overheat',
			'#decidueye+sharpness',
			'#spiritomb+cursedbody+recover',
			'#charizard+dragonsmaw+aeroblast',
			'#chesnaught+lingeringaroma',
			'#weezing+bodypress',
			'#wochien+pursuit',
			'#lickilicky+slackoff',
			'#scrafty+rapidspin',
			'#seviper+icescales+pursuit',
			'#bouffalant+guts+quickattack',
			'#nihilego+solarpower+hydrosteam+sunnyday',
			'#persianalola+ceaselessedge',
			'#probopass+levitate+spikes',
			'#donphan+rockypayload+closecombat',
			'#vespiquen+magicguard+bravebird',
			'#meganium+fireblast+takeheart',
			'#hakamoo+swordofruin',
			'#lapras+filter+rapidspin',
		],
		banlist: [
			'ND Uber', 'ND AG', 'ND OU', 'ND UUBL', 'ND UU', 'ND RUBL', 'ND RU', 'ND NFE', 'ND LC',
			'Stealth Rock', 'U-Turn', 'Volt Switch', 'Flip Turn', 'Teleport', 'Choice Scarf', 'Heavy-Duty Boots', 'Defog', 'Electric Terrain', 'Psychic Terrain', 'Misty Terrain', 'Grassy Terrain',
		],
		unbanlist: [
			'Empoleon', 'Articuno-Base', 'Electivire', 'Rapidash-Base', 'Klinklang', 'Farigiraf', 'Seismitoad', 'Raichu-Alola', 'Noivern', 'Altaria-Base', 'Claydol', 'Armaldo', 'Escavalier', 'Uxie', 'Glalie-Base', 'Centiskorch', 'Rotom-Base', 'Decidueye-Base', 'Spiritomb', 'Charizard-Base', 'Chesnaught-Base', 'Weezing-Base', 'Wo-Chien', 'Lickilicky', 'Scrafty-Base', 'Seviper', 'Bouffalant', 'Nihilego', 'Persian-Alola', 'Probopass', 'Donphan', 'Vespiquen', 'Meganium-Base', 'Hakamo-o', 'Lapras',
		],
	},
	{
		name: "[Gen 5] 35 Pokes Perfect [B2]",
		mod: 'perfectb2',
		validatorMod: 'gen9',
		ruleset: [
			// from Custom Game
			'Team Preview', 'HP Percentage Mod', 'Cancel Mod', 'Endless Battle Clause',
			// from 35 Pokes / Natdex
			'Obtainable', '+Unobtainable', '+Past', 'Sketch Post-Gen 7 Moves', 'Nickname Clause', 'OHKO Clause', 'Evasion Clause',
			'Sleep Moves Clause', 'Forme Clause',
			// B2 specific
			'One Boost Passer Clause', 'Gems Clause',

			'#irontreads+sandstream',
			'#regice+snowwarning+aurasphere',
			'#scyther+deltastream+wish',
			'#bombirdier+darkestlariat+rapidspin',
			'#shaymin+levitate+nastyplot',
			'#tentacruel+poisontouch',
			'#arcanine+aurasphere+energyball',
			'#dusknoir+ironfist+drainpunch',
			'#nidoqueen+calmmind',
			'#decidueyehisui+unburden+meteorbeam',
			'#cyclizar+courtchange+heartswap',
			'#oranguru+unaware+slackoff',
			'#dudunsparce+levitate',
			'#klinklang+sunsteelstrike+temperflare',
			'#grapploct+regenerator+spikes',
			'#drapion+merciless+focuspunch',
			'#flapple+quickattack+aerilate',
			'#rotomfan+wanderingspirit+roost',
			'#pinsir+toughclaws+spikes',
			'#lycanrocmidnight+accelerock',
			'#passimian+machpunch+wish',
			'#bronzong+healbell',
			'#camerupt+shoreup+spikes',
			'#gardevoir+prankster',
			'#drifblim+mindblown',
			'#gourgeist+technician',
			'#piloswine+glaciallance+rockpolish',
			'#lapras+magicguard+spikes',
			'#bellibolt+rapidspin+surf',
			'#coalossal+clearsmog+knockoff',
			'#guzzlord+vesselofruin+spikes',
			'#centiskorch+punkrock+torchsong',
			'#feraligatr+intimidate+jetpunch',
			'#golemalola+trickroom',
			'#unfezant+guts',
		],
		banlist: [
			'ND Uber', 'ND AG', 'ND OU', 'ND UUBL', 'ND UU', 'ND RUBL', 'ND RU', 'ND NFE', 'ND LC',
			'Stealth Rock', 'U-Turn', 'Volt Switch', 'Flip Turn', 'Teleport', 'Choice Scarf', 'Heavy-Duty Boots', 'Defog', 'Electric Terrain', 'Psychic Terrain', 'Misty Terrain', 'Grassy Terrain', 'Hidden Power',
		],
		unbanlist: [
			'Iron Treads', 'Regice', 'Scyther', 'Bombirdier', 'Shaymin-Base', 'Tentacruel', 'Camerupt-Base', 'Arcanine-Base', 'Dusknoir', 'Nidoqueen', 'Decidueye-Hisui', 'Cyclizar', 'Oranguru', 'Dudunsparce', 'Grapploct', 'Guzzlord', 'Drapion', 'Flapple', 'Rotom-Fan', 'Pinsir-Base', 'Lycanroc-Midnight', 'Passimian', 'Klinklang', 'Bronzong', 'Gardevoir-Base', 'Drifblim', 'Gourgeist-Base', 'Piloswine', 'Lapras', 'Bellibolt', 'Coalossal', 'Centiskorch', 'Feraligatr-Base', 'Golem-Alola', 'Unfezant',
		],
	},
	{
		name: "[Gen 5] 35 Pokes Perfect [B3]",
		mod: 'perfectb3',
		desc: 'mm wuz here',
		validatorMod: 'gen9',
		ruleset: [
			// from Custom Game
			'Team Preview', 'HP Percentage Mod', 'Cancel Mod', 'Endless Battle Clause',
			// from 35 Pokes / Natdex
			'Obtainable', '+Unobtainable', '+Past', 'Sketch Post-Gen 7 Moves', 'Nickname Clause', 'OHKO Clause', 'Evasion Clause',
			'Sleep Moves Clause', 'Forme Clause',
			// Melten hates cheese now
			'DryPass Clause', 'Gems Clause',

			'#accelgor+nastyplot+stickyweb',
			'#ampharos+drizzle+electroshot',
			'#dracovish-fishiousrend+rapidspin',
			'#noctowl+bloodmoon',
			'#dragalge+mortalspin',
			'#corviknight+toxic+whirlwind',
			'#frosmoth+roost',
			'#hoopa-nastyplot',
			'#glaceon+snowwarning',
			'#gliscor-poisonheal',
			'#grumpig+magicbounce+luminacrash',
			'#heliolisk+sandforce+earthpower',
			'#hydreigon-levitate+klutz',
			'#ironleaves-swordsdance',
			'#chesnaught-bellydrum+hornleech',
			'#hitmonlee+thunderouskick',
			'#obstagoon+pursuit+wildcharge',
			'#braixen+drought+morningsun',
			'#luxray+galvanize+courtchange',
			'#glimmora-toxicdebris',
			'#sandslashalola+refrigerate+mountaingale',
			'#escavalier+spikes',
			'#skeledirge-torchsong',
			'#mismagius-nastyplot+healingwish',
			'#gyarados-dragondance',
			'#registeel+magnetpull+tachyoncutter',
			'#cherrim+geomancy',
			'#crustle+sandstream-shellsmash',
			'#mukalola+waterabsorb+mortalspin',
			'#milotic-recover',
			'#hariyama+rapidspin',
			'#turtonator-shellarmor+cloudnine',
			'#sandaconda-sandspit-glare+thousandarrows',
			'#nidoking-sheerforce+neuroforce',
			'#gigalith-sandstream+accelerock',
		],
		banlist: [
			'ND Uber', 'ND AG', 'ND OU', 'ND UUBL', 'ND UU', 'ND RUBL', 'ND RU', 'ND NFE', 'ND LC',
			'Stealth Rock', 'U-turn', 'Teleport', 'Scald', 'Close Combat', 'Hidden Power', 'Defog', 'Shed Tail', 'Outrage',
			'Heavy-Duty Boots', 'Choice Scarf',
		],
		unbanlist: [
			'Accelgor', 'Ampharos-Base', 'Braixen', 'Cherrim-Base', 'Chesnaught-Base', 'Corviknight', 'Crustle', 'Dracovish', 'Dragalge-Base', 'Escavalier', 'Frosmoth', 'Gigalith', 'Glaceon', 'Glimmora-Base', 'Gliscor', 'Grumpig', 'Gyarados-Base', 'Hariyama', 'Heliolisk', 'Hitmonlee', 'Hoopa-Confined', 'Hydreigon', 'Iron Leaves', 'Luxray', 'Milotic', 'Mismagius', 'Muk-Alola', 'Nidoking', 'Noctowl', 'Obstagoon', 'Registeel', 'Sandaconda', 'Sandslash-Alola', 'Skeledirge', 'Turtonator',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Perfect [C1]",
		mod: 'gen9',
		ruleset: [
			'Standard 35 Pokes', '!Sleep Clause Mod', 'Sleep Moves Clause',

			'#liepard+bugbuzz+flamethrower',
			'#weezing+rapidspin',
			'#wigglytuff+regenerator+fleurcannon',
			'#aromatisse+lingeringaroma',
			'#silvally+cloudnine+stealthrock',
			'#gogoat+grassysurge',
			'#solrock+psychicsurge+victorydance',
			'#lickilicky+mistysurge+moonlight',
			'#dedenne+solarpower',
			'#klinklang+electricsurge+spikes',
			'#steelix+rockypayload+shoreup',
			'#jynx+sapsipper',
			'#wailord+unaware+thunder',
			'#rotomfrost+refrigerate',
			'#magcargo+drought',
			'#camerupt+moldbreaker+shoreup',
			'#palossand+sandstream',
			'#relicanth+sandrush+honeclaws',
			'#lumineon+drizzle',
			'#granbull+slushrush+glaciallance',
			'#delibird+snowwarning+burningbulwark+flipturn',
			'#haunter+flashfire+flamethrower',
			'#guzzlord+eartheater+stealthrock',
			'#mabosstiff+strongjaw',
			'#toxicroak+lightningrod',
			'#mothim+blizzard+hurricane',
			'#avalugg+chillyreception',
			'#dhelmise+grasspelt',
		],
		banlist: [
			'Light Clay',
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy',
			'Dhelmise', 'Liepard', 'Weezing-Base', 'Wigglytuff', 'Aromatisse', 'Togedemaru-Base', 'Silvally-Base', 'Gogoat', 'Hitmontop', 'Solrock', 'Raichu-Alola', 'Lickilicky', 'Dedenne', 'Klinklang', 'Leavanny', 'Exeggutor-Base', 'Steelix-Base', 'Medicham-Base', 'Jynx', 'Wailord', 'Rotom-Frost', 'Magcargo', 'Camerupt-Base', 'Palossand', 'Relicanth', 'Lumineon', 'Granbull', 'Delibird', 'Talonflame', 'Haunter', 'Guzzlord', 'Mabosstiff', 'Toxicroak', 'Mothim', 'Avalugg-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Perfect [D1]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes', '!Sleep Clause Mod', 'Sleep Moves Clause'],
		banlist: [
			'Eviolite', 'Download', 'Analytic',
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy',
			'Staravia', 'Charjabug', 'Ponyta-Base', 'Krokorok', 'Quilladin', 'Porygon', 'Hattrem', 'Tinkatuff', 'Floette-Base', 'Gimmighoul-Base', 'Gastly', 'Staryu', 'Luxio', 'Cubchoo', 'Amaura', 'Gloom', 'Stufful', 'Mankey', 'Carkol', 'Yanma', 'Grimer-Alola', 'Meowth-Alola', 'Cufant', 'Vibrava', 'Voltorb-Hisui', 'Gothorita', 'Lampent', 'Slowpoke-Galar', 'Palpitoad', 'Sandshrew-Alola', 'Anorith', 'Goomy', 'Mantyke', 'Snubbull', 'Aipom',
		],
	},
	{
		name: "[Gen 7] 35 Pokes Perfect [E1]",
		mod: 'gen7',
		ruleset: ['Standard', '!Sleep Clause Mod', 'Sleep Moves Clause', 'Evasion Abilities Clause'],
		banlist: ['All Pokemon', 'Regenerator', 'Dynamic Punch'],
		unbanlist: [
			'Golurk-Base', 'Flareon', 'Lycanroc-Base', 'Togedemaru-Base', 'Froslass-Base', 'Roserade', 'Magmortar', 'Abomasnow-Base', 'Abomasnow-Mega', 'Audino-Base', 'Audino-Mega', 'Banette-Base', 'Banette-Mega', 'Blastoise-Base', 'Blastoise-Mega', 'Noivern', 'Bronzong', 'Diancie-Base', 'Flygon', 'Forretress', 'Gallade-Base', 'Garbodor', 'Gigalith', 'Golisopod-Base', 'Guzzlord', 'Hariyama', 'Moltres-Base', 'Milotic', 'Miltank', 'Primeape', 'Rotom-Frost', 'Seismitoad', 'Shaymin-Base', 'Silvally-Fairy', 'Skuntank', 'Swellow', 'Vikavolt-Base', 'Xatu', 'Zoroark-Base',
		],
		onValidateSet(set) {
			const problems: string[] = [];
			const megaUsers: string[] = ['blastoise', 'abomasnow', 'audino', 'banette'];
			const zUsers: string[] = ['golurk', 'flareon', 'lycanroc', 'primeape', 'rotomfrost', 'roserade', 'magmortar'];
			const speciesid = this.toID(set.species);
			const item = this.dex.items.get(set.item);
			if (item.megaStone && !megaUsers.includes(speciesid)) {
				problems.push(`${set.name} is not allowed to hold a Mega Stone in E1.`);
			}
			if (item.zMove && !zUsers.includes(speciesid)) {
				problems.push(`${set.name} is not allowed to hold a Z Crystal in E1.`);
			}
			if(problems.length) return problems;
		},
		onBegin() {
			const megaUsers: string[] = ['blastoise', 'abomasnow', 'audino', 'banette'];
			const zUsers: string[] = ['golurk', 'flareon', 'lycanroc', 'primeape', 'rotomfrost', 'roserade', 'magmortar'];
			this.add('rule', `Perfect E1: Only the following Pokemon can hold Mega Stones: ${megaUsers.join(', ')}`);
			this.add('rule', `Perfect E1: Only the following Pokemon can hold Z Crystals: ${zUsers.join(', ')}`);
			this.add('rule', `Perfect E1: Pokemon can not have Regenerator.`);
			this.add('rule', `Perfect E1: Pokemon can not have Dynamic Punch.`);
		},
	},
	{
		name: "[Gen 9] ND 35 Pokes Perfect [F1]",
		mod: 'gen9',
		ruleset: [
			'Standard 35 Pokes', '!Sleep Clause Mod', 'Sleep Moves Clause',

			'#dustox+simple+malignantchain',
			'#beedrill+adaptability+headlongrush+victorydance',
			'#armaldo+recover+uturn',
			'#corsola+hugepower',
			'#absol+sheerforce',
			'#mawile+gigatonhammer+moonlight',
			'#tropius+galewings+clangingscales+oblivionwing',
			'#castform+scrappy+clangoroussoul+judgment',
			'#camerupt+waterabsorb+aurasphere',
			'#mightyena+fishiousrend+wish',
			'#wugtrio+noguard+tripleaxel',
			'#mienfoo+supercellslam',
			'#gastly+neutralizinggas',
			'#frillish+infernalparade',
			'#pachirisu+drizzle+rapidspin',
			'#abra+magicbounce+rapidspin',
			'#grumpig+sparklingaria',
			'#glalie+galvanize+rapidspin',
			'#dewgong+unaware+surgingstrikes',
			'#heatmor+drought+spikes',
			'#pidgeot+noguard+focusblast',
			'#stunfiskgalar+wellbakedbody+ironhead',
			'#simisage+trace+copycat',
			'#dedenne+triage+calmmind',
			'#appletun+defog',
			'#fearow+guts',
			'#rampardos+rockhead',
			'#zweilous+prankster+partingshot+willowisp',
			'#crocalor+toxic',
			'#plusle+soulheart+energyball+mistball+weatherball',
			'#seviper+adaptability+earthpower',
			'#banette+speedboost',
			'#wobbuffet+magicguard+mortalspin+seismictoss',
			'#gumshoos+jawlock',
			'#granbull+trickroom',
		],
		banlist: [
			'Light Clay',
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy',
			'Abra', 'Absol-Base', 'Appletun', 'Armaldo', 'Banette-Base', 'Beedrill-Base', 'Camerupt-Base', 'Castform-Base', 'Corsola-Base', 'Crocalor', 'Dedenne', 'Dewgong', 'Dustox', 'Fearow', 'Frillish', 'Gastly', 'Glalie-Base', 'Granbull', 'Grumpig', 'Gumshoos-Base', 'Heatmor', 'Mawile-Base', 'Mienfoo', 'Mightyena', 'Pachirisu', 'Pidgeot-Base', 'Plusle', 'Rampardos', 'Seviper', 'Simisage', 'Stunfisk-Galar', 'Tropius', 'Wobbuffet', 'Wugtrio', 'Zweilous',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Perfect [Z1]",
		mod: 'gen9',
		ruleset: [
			'Standard NatDex', '!Evasion Clause', 'Evasion Moves Clause', 'Evasion Items Clause', 'Mega Rayquaza Clause', 'Z-Move Clause', 'Terastal Clause',
		],
		banlist: ['ND AG', 'pokemontag:allmoves', 'Regenerator', 'Zacian-Crowned + Iron Head', 'Jirachi', 'Zamazenta-Crowned + Iron Head'],
		unbanlist: [
			'Weather Ball', 'Hidden Power', 'U-Turn', 'Overheat', 'Giga Impact', 'Retaliate', 'Acrobatics', 'Aqua Ring', 'Aqua Tail', 'Aromatherapy', 'Assist', 'Belly Drum', 'Body Press', 'Stockpile', 'Thunder', 'Bounce', 'Earth Power', 'Clear Smog', 'Psychic Noise', 'Crunch', 'Destiny Bond', 'Dragon Breath', 'Feint Attack', 'Freeze Dry', 'Grass Knot', 'Work Up', 'Ice Punch', 'Incinerate', 'Trick', 'Hex', 'Rock Slide', 'Iron Head', 'Alluring Voice', 'Sludge', 'Thief',
		],
	},
	{
		section: '35 Pokes Perfect (WIP)',
		column: 3
	},
	{
		name: "[Gen 9] ND 35 Pokes Perfect [C2]",
		mod: 'gen9',
		ruleset: [
			'Standard 35 Pokes',

			'#klinklang+hadronengine+spikes+superpower',
			'#aromatisse+mistysurge+spikes',
			'#jynx+psychicsurge',
			'#gogoat+grassysurge+woodhammer',
			'#hakamoo+orichalcumpulse+bitterblade+stealthrock',
			'#emolga+drizzle+hurricane+surf',
			'#glalie+snowwarning+auroraveil+partingshot',
			'#magcargo+sandstream',
			'#leavanny+sapsipper',
			'#dhelmise+waterabsorb',
			'#exeggutor+regenerator+weatherball',
			'#raichualola+swiftswim',
			'#rotomfrost+solarpower+overheat',
			'#carbink+icebody+chillyreception',
			'#wigglytuff+regenerator+fleurcannon',
			'#lickilicky+unaware',
			'#stoutland+slushrush',
			'#camerupt+grasspelt+morningsun+saltcure',
			'#steelix+sandforce',
			'#palossand+raindish+sandsearstorm',
			'#relicanth+sandrush+coil',
			'#wailord+primordialsea+thunder',
			'#swanna+solarpower+heatwave+hydrosteam',
			'#avalugg+galvanize',
			'#haunter+flashfire+flamethrower',
			'#mabosstiff+strongjaw',
			'#guzzlord+sandforce+stealthrock',
			'#pinsir+protosynthesis+megahorn',
			'#medicham+jetpunch',
			'#togedemaru+spikes',
			'#weezing+rapidspin',
			'#silvallypoison+naturepower+sludgebomb',
			'#mothim+hurricane+thunder',
		],
		banlist: [
			'Ultranecrozium Z', 'Solganium Z', 'Lunalium Z', 'Mewnium Z', 'Marshadium Z',
		],
		unbanlist: [
			'Booster Energy',
			'Klinklang', 'Aromatisse', 'Jynx', 'Gogoat', 'Hakamo-o', 'Emolga', 'Glalie-Base', 'Magcargo', 'Leavanny', 'Dhelmise', 'Exeggutor-Base', 'Medicham-Base', 'Raichu-Alola', 'Togedemaru-Base', 'Rotom-Frost', 'Carbink', 'Wigglytuff', 'Lickilicky', 'Stoutland', 'Talonflame', 'Camerupt-Base', 'Steelix-Base', 'Palossand', 'Relicanth', 'Wailord', 'Swanna', 'Avalugg-Base', 'Hitmontop', 'Weezing-Base', 'Haunter', 'Silvally-Poison', 'Mabosstiff', 'Guzzlord', 'Mothim', 'Pinsir-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Perfect [VGC-1]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: [
			'Standard 35 Pokes VGC', '!Terastal Clause', '!35 Pokes Hidden Power Clause', 'Force Open Team Sheets',
		],
		unbanlist: [
			'Altaria-Base', 'Bisharp', 'Brambleghast', 'Bruxish', 'Ceruledge', 'Electrode-Hisui', 'Excadrill-Base', 'Gastrodon', 'Gothitelle', 'Hariyama', 'Hatterene', 'Heliolisk', 'Hippowdon', 'Lilligant-Hisui', 'Lucario-Base', 'Ludicolo', 'Lycanroc-Base', 'Mamoswine', 'Maushold', 'Moltres-Galar', 'Munkidori', 'Oranguru', 'Overqwil', 'Politoed', 'Primarina', 'Regidrago', 'Salamence-Base', 'Scizor-Base', 'Slaking', 'Talonflame', 'Tinkaton', 'Toedscruel', 'Torkoal', 'Weezing-Galar', 'Zoroark-Hisui',
		],
	},
	{
		section: '35 Pokes Babies',
		column: 3
	},
	{
		name: "[Gen 9] ND 35 Pokes Babies [Jan 2026]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes LC'],
		unbanlist: [
			'Bramblin', 'Chinchou', 'Clobbopus', 'Cyndaquil', 'Doduo', 'Dreepy', 'Grimer-Alola', 'Hatenna', 'Helioptile', 'Hoppip', 'Horsea', 'Inkay', 'Jangmo-o', 'Koffing', 'Larvesta', 'Lechonk', 'Magnemite', 'Mantyke', 'Mareep', 'Nidoran-F', 'Nosepass', 'Phanpy', 'Poliwag', 'Poltchageist', 'Shellos', 'Shroomish', 'Smoliv', 'Spritzee', 'Starly', 'Tentacool', 'Tinkatink', 'Tirtouga', 'Tympole', 'Whismur', 'Zorua-Hisui',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Babies [Apr 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes LC'],
		unbanlist: [
			'Deino', 'Lechonk', 'Tentacool', 'Munna', 'Hatenna', 'Drilbur', 'Bagon', 'Arrokuda', 'Wynaut', 'Psyduck', 'Ferroseed', 'Beldum', 'Exeggcute', 'Charmander', 'Archen', 'Capsakid', 'Roggenrola', 'Geodude-Base', 'Petilil', 'Larvesta', 'Swablu', 'Glimmet', 'Kricketot', 'Karrablast', 'Gimmighoul-Roaming', 'Amaura', 'Pawniard', 'Abra', 'Sprigatito', 'Rhyhorn', 'Lillipup', 'Tyrunt', 'Chewtle', 'Slugma', 'Cacnea',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Babies [Feb 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes LC'],
		unbanlist: [
			'Turtwig', 'Clamperl', 'Minccino', 'Binacle', 'Goldeen', 'Tadbulb', 'Ponyta-Galar', 'Shinx', 'Ferroseed', 'Sentret', 'Seedot', 'Machop', 'Tandemaus', 'Shroodle', 'Lickitung', 'Snom', 'Fletchling', 'Onix', 'Bagon', 'Darumaka-Galar', 'Tepig', 'Phanpy', 'Pumpkaboo-Base', 'Bellsprout', 'Taillow', 'Spoink', 'Varoom', 'Magikarp', 'Squirtle', 'Tynamo', 'Lotad', 'Diglett-Base', 'Joltik', 'Wiglett', 'Remoraid',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Babies [Jan 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes LC'],
		unbanlist: [
			'Pidgey', 'Charmander', 'Gothita', 'Burmy', 'Zorua-Base', 'Scorbunny', 'Anorith', 'Stunky', 'Cranidos', 'Inkay', 'Patrat', 'Impidimp', 'Sewaddle', 'Croagunk', 'Sunkern', 'Combee', 'Larvesta', 'Vanillite', 'Shieldon', 'Shinx', 'Oddish', 'Ponyta-Galar', 'Drilbur', 'Rockruff-Base', 'Paras', 'Torchic', 'Ledyba', 'Smoochum', 'Remoraid', 'Snorunt', 'Swablu', 'Grimer-Base', 'Popplio', 'Gulpin', 'Gimmighoul-Roaming',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Babies [Dec 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes LC'],
		unbanlist: [
			'Mareanie', 'Cubchoo', 'Corphish', 'Charmander', 'Cleffa', 'Snover', 'Goomy', 'Growlithe-Hisui', 'Sandygast', 'Fomantis', 'Tandemaus', 'Maschiff', 'Grookey', 'Treecko', 'Voltorb-Base', 'Blitzle', 'Sprigatito', 'Barboach', 'Ducklett', 'Gulpin', 'Munchlax', 'Rhyhorn', 'Totodile', 'Ferroseed', 'Staryu', 'Corsola-Galar', 'Dwebble', 'Archen', 'Bulbasaur', 'Turtwig', 'Sandshrew-Alola', 'Hippopotas', 'Eevee-Base', 'Dewpider', 'Snivy',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Babies [Nov 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes LC'],
		unbanlist: [
			'Noibat', 'Abra', 'Smoochum', 'Rattata-Base', 'Helioptile', 'Turtwig', 'Gulpin', 'Wailmer', 'Skiddo', 'Spritzee', 'Hoothoot', 'Frillish', 'Electrike', 'Tepig', 'Goomy', 'Chewtle', 'Mienfoo', 'Makuhita', 'Lotad', 'Pancham', 'Zorua-Hisui', 'Fidough', 'Frigibax', 'Totodile', 'Slakoth', 'Wooper-Paldea', 'Hoppip', 'Dwebble', 'Bronzor', 'Sobble', 'Cyndaquil', 'Swablu', 'Vullaby', 'Patrat', 'Weedle',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Babies [Oct 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes LC'],
		unbanlist: [
			'Flittle', 'Cottonee', 'Sizzlipede', 'Surskit', 'Varoom', 'Taillow', 'Bunnelby', 'Gimmighoul-Roaming', 'Cubchoo', 'Cranidos', 'Purrloin', 'Lotad', 'Remoraid', 'Spearow', 'Fuecoco', 'Maschiff', 'Growlithe-Base', 'Lileep', 'Doduo', 'Nacli', 'Makuhita', 'Espurr', 'Houndour', 'Slakoth', 'Yamask-Galar', 'Slowpoke-Galar', 'Joltik', 'Omanyte', 'Tirtouga', 'Sprigatito', 'Popplio', 'Meowth-Galar', 'Shroomish', 'Helioptile', 'Applin',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Babies [Sep 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes LC'],
		unbanlist: [
			'Bunnelby', 'Tirtouga', 'Klink', 'Amaura', 'Gible', 'Mankey', 'Tyrogue', 'Trapinch', 'Poliwag', 'Munna', 'Onix', 'Totodile', 'Elekid', 'Spinarak', 'Whismur', 'Rhyhorn', 'Lillipup', 'Bulbasaur', 'Pansear', 'Mudkip', 'Munchlax', 'Panpour', 'Chewtle', 'Eevee-Base', 'Applin', 'Pancham', 'Tepig', 'Taillow', 'Hatenna', 'Wooloo', 'Stunky', 'Chingling', 'Blipbug', 'Tandemaus', 'Zubat',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Babies [Aug 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes LC'],
		unbanlist: [
			'Quaxly', 'Wynaut', 'Swablu', 'Kricketot', 'Wiglett', 'Barboach', 'Spoink', 'Meltan', 'Geodude-Alola', 'Mantyke', 'Cubchoo', 'Tinkatink', 'Ledyba', 'Flittle', 'Dreepy', 'Horsea', 'Trapinch', 'Magby', 'Cottonee', 'Archen', 'Torchic', 'Spinarak', 'Gothita', 'Clauncher', 'Houndour', 'Bramblin', 'Cherubi', 'Scatterbug', 'Spheal', 'Bergmite', 'Toxel', 'Rhyhorn', 'Meowth-Alola', 'Stufful', 'Tyrunt',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Babies [Jul 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes LC'],
		unbanlist: [
			'Glameow', 'Smoochum', 'Hoppip', 'Squirtle', 'Gastly', 'Corphish', 'Dreepy', 'Fuecoco', 'Froakie', 'Tepig', 'Snivy', 'Chespin', 'Pidove', 'Petilil', 'Impidimp', 'Zigzagoon-Galar', 'Porygon', 'Clamperl', 'Machop', 'Chewtle', 'Lillipup', 'Skrelp', 'Bunnelby', 'Mareanie', 'Shieldon', 'Larvitar', 'Goldeen', 'Meowth-Galar', 'Sandygast', 'Sewaddle', 'Meltan', 'Surskit', 'Wiglett', 'Rookidee',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Babies [Jun 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes LC'],
		unbanlist: [
			'Squirtle', 'Kubfu', 'Yamper', 'Foongus', 'Jangmo-o', 'Cleffa', 'Tangela', 'Remoraid', 'Budew', 'Ekans', 'Gulpin', 'Misdreavus', 'Glameow', 'Hippopotas', 'Honedge', 'Larvesta', 'Pansage', 'Drilbur', 'Cetoddle', 'Tyrunt', 'Poipole', 'Chespin', 'Glimmet', 'Skrelp', 'Tyrogue', 'Barboach', 'Skorupi', 'Skwovet', 'Sizzlipede', 'Nacli', 'Zubat', 'Flittle', 'Arrokuda', 'Munchlax', 'Ponyta-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Babies [May 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes LC'],
		unbanlist: [
			'Voltorb-Hisui', 'Snivy', 'Maschiff', 'Horsea', 'Salandit', 'Tarountula', 'Dwebble', 'Rolycoly', 'Litwick', 'Morelull', 'Gossifleur', 'Taillow', 'Sunkern', 'Kabuto', 'Farfetch’d-Galar', 'Pansage', 'Buizel', 'Buneary', 'Treecko', 'Charcadet', 'Aron', 'Wimpod', 'Inkay', 'Roggenrola', 'Goldeen', 'Impidimp', 'Sandygast', 'Vulpix-Base', 'Cufant', 'Budew', 'Burmy', 'Nincada', 'Seedot', 'Tympole', 'Shellos',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Babies [Apr 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes LC'],
		unbanlist: [
			'Magikarp', 'Toxel', 'Noibat', 'Mareanie', 'Wooper-Paldea', 'Cyndaquil', 'Sinistea', 'Fomantis', 'Silicobra', 'Charcadet', 'Meowth-Galar', 'Slowpoke-Base', 'Bagon', 'Lechonk', 'Machop', 'Patrat', 'Meowth-Base', 'Capsakid', 'Pidgey', 'Nosepass', 'Shroodle', 'Baltoy', 'Zigzagoon-Galar', 'Nickit', 'Froakie', 'Drilbur', 'Bounsweet', 'Porygon', 'Magnemite', 'Paras', 'Cubone', 'Vanillite', 'Sandshrew-Alola', 'Gimmighoul-Base', 'Lotad',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Babies [Apr 2024 AFD]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes LC'],
		unbanlist: [
			'Magikarp', 'Toxel', 'Noibat', 'Mareanie', 'Wooper-Paldea', 'Cyndaquil', 'Sinistea', 'Fomantis', 'Silicobra', 'Meowth-Galar', 'Slowpoke-Base', 'Bagon', 'Lechonk', 'Machop', 'Nosepass', 'Shroodle', 'Baltoy', 'Zigzagoon-Galar', 'Nickit', 'Froakie', 'Drilbur', 'Bounsweet', 'Porygon', 'Magnemite', 'Paras', 'Cubone', 'Sandshrew-Alola', 'Lotad',
			'Chi-Yu', 'Duraludon', 'Scyther', 'Swirlix', 'Honedge', 'Sneasel-Base', 'Cosmog', 'Sneasel-Hisui',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Babies [Mar 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes LC'],
		unbanlist: [
			'Voltorb-Hisui', 'Natu', 'Charmander', 'Spearow', 'Sandshrew-Base', 'Exeggcute', 'Koffing', 'Staryu', 'Remoraid', 'Larvitar', 'Gulpin', 'Carvanha', 'Shuppet', 'Bidoof', 'Hippopotas', 'Mantyke', 'Panpour', 'Timburr', 'Karrablast', 'Chespin', 'Honedge', 'Inkay', 'Rowlet', 'Grubbin', 'Fomantis', 'Rolycoly', 'Hatenna', 'Dreepy', 'Wiglett', 'Tympole', 'Tirtouga', 'Helioptile', 'Lechonk', 'Popplio',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Babies [Jan 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes LC'],
		unbanlist: [
			'Slugma', 'Torchic', 'Minccino', 'Spheal', 'Nacli', 'Greavard', 'Trapinch', 'Tympole', 'Mudkip', 'Snover', 'Squirtle', 'Exeggcute', 'Rufflet', 'Paras', 'Ralts', 'Vullaby', 'Goldeen', 'Shinx', 'Venonat', 'Stufful', 'Poochyena', 'Drifloon', 'Riolu', 'Rolycoly', 'Snom', 'Wurmple', 'Slakoth', 'Smoochum', 'Wailmer', 'Gastly', 'Larvesta', 'Larvitar', 'Litwick', 'Charcadet', 'Solosis',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Babies [Dec 2023]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes LC'],
		banlist: ['Deep Sea Tooth'],
		unbanlist: [
			'Corsola-Galar', 'Lotad', 'Inkay', 'Snom', 'Cetoddle', 'Noibat', 'Porygon', 'Lickitung', 'Hippopotas', 'Skwovet', 'Venipede', 'Slowpoke-Base', 'Silicobra', 'Wiglett', 'Diglett-Alola', 'Snorunt', 'Sunkern', 'Tandemaus', 'Wooper-Base', 'Clamperl', 'Flittle', 'Remoraid', 'Beldum', 'Cacnea', 'Magnemite', 'Toedscool', 'Pansage', 'Impidimp', 'Croagunk', 'Ponyta-Base', 'Slakoth', 'Blitzle', 'Charcadet', 'Minccino', 'Spoink',
		],
	},
	{
		section: '35 Pokes Seniors',
		column: 3
	},
	{
		name: "[Gen 9] ND 35 Pokes Seniors [Sep 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes Ubers'],
		unbanlist: [
			'Absol-Mega', 'Aegislash-Base', 'Alakazam-Mega', 'Annihilape', 'Araquanid-Base', 'Arceus-Bug', 'Beedrill-Mega', 'Dialga-Base', 'Dragapult', 'Ferrothorn', 'Fezandipiti', 'Garchomp-Base', 'Genesect-Base', 'Giratina-Base', 'Great Tusk', 'Heatran-Base', 'Hoopa-Unbound', 'Iron Treads', 'Iron Valiant', 'Kartana', 'Landorus-Base', 'Latias-Mega', 'Magearna-Base', 'Mawile-Mega', 'Naganadel', 'Ogerpon-Hearthflame', 'Palkia-Base', 'Pinsir-Mega', 'Quagsire', 'Tapu Fini', 'Tapu Koko', 'Tapu Lele', 'Ting-Lu', 'Tyranitar-Mega', 'Urshifu-Rapid-Strike',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Seniors [Apr 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes Ubers'],
		unbanlist: [
			'Articuno-Base', 'Entei', 'Latias-Base', 'Heatran-Base', 'Thundurus-Base', 'Tapu Bulu', 'Regieleki', 'Venusaur-Base', 'Arctozolt', 'Ting-Lu', 'Ogerpon-Wellspring', 'Dialga-Base', 'Mamoswine', 'Celebi', 'Great Tusk', 'Meloetta-Base', 'Lugia', 'Sneasler', 'Absol-Mega', 'Garchomp-Mega', 'Sharpedo-Mega', 'Giratina-Base', 'Iron Jugulis', 'Quagsire', 'Politoed', 'Arceus-Ice', 'Dracovish', 'Baxcalibur-Base', 'Charizard-Mega-Y', 'Tyranitar-Base', 'Hatterene', 'Stakataka', 'Excadrill-Base', 'Zygarde-Base', 'Ninetales-Alola',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Seniors [Jan 2025]",
		mod: 'gen9',
		ruleset: ['[Gen 9] ND 35 Pokes Seniors [Apr 2024]'],
	},
	{
		name: "[Gen 9] ND 35 Pokes Seniors [Sep 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes Ubers'],
		unbanlist: [
			'Kyogre-Primal', 'Landorus-Base', 'Lugia', 'Metagross-Mega', 'Necrozma-Dusk-Mane', 'Sableye-Mega', 'Sceptile-Mega', 'Palkia-Origin', 'Reshiram', 'Salamence-Mega', 'Sneasler', 'Ogerpon-Hearthflame', 'Muk-Alola', 'Banette-Mega', 'Solgaleo', 'Walking Wake', 'Annihilape', 'Arceus-Rock', 'Deoxys-Base', 'Deoxys-Speed', 'Dialga-Origin', 'Gholdengo', 'Groudon-Primal', 'Zamazenta-Crowned', 'Zekrom', 'Koraidon', 'Corviknight', 'Latias-Mega', 'Steelix-Mega', 'Miraidon', 'Lopunny-Mega', 'Magnezone', 'Chansey', 'Grimmsnarl', 'Ampharos-Mega',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Seniors [Aug 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes Ubers'],
		unbanlist: [
			'Arceus-Electric', 'Heatran-Base', 'Garchomp-Base', 'Iron Treads', 'MissingNo.', 'Sandy Shocks', 'Slither Wing', 'Hatterene', 'Duraludon', 'Landorus-Base', 'Chi-Yu', 'Avalugg-Base', 'Archaludon', 'Tapu Lele', 'Venusaur-Base', 'Houndoom-Base', 'Pinsir-Base', 'Rayquaza-Base', 'Shedinja', 'Ogerpon-Hearthflame', 'Moltres-Base', 'Pelipper', 'Ogerpon-Base', 'Beedrill-Base', 'Iron Moth', 'Rillaboom', 'Banette-Base', 'Tapu Fini', 'Excadrill-Base', 'Weavile', 'Politoed', 'Tapu Bulu', 'Iron Boulder', 'Torkoal', 'Skarmory-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Seniors [Jun 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes Ubers'],
		unbanlist: [
			'Articuno-Base', 'Entei', 'Latias-Base', 'Cresselia', 'Thundurus-Base', 'Tapu Bulu', 'Xurkitree', 'Keldeo-Base', 'Enamorus-Base', 'Ting-Lu', 'Ogerpon-Wellspring-Tera', 'Dialga-Base', 'Basculin-White-Striped', 'Celebi', 'Manaphy', 'Meloetta-Base', 'Pokestar Black Belt', 'Pokestar MT2', 'Absol-Mega', 'Beedrill-Mega', 'Sharpedo-Mega', 'Iron Treads', 'Iron Jugulis', 'Quagsire', 'Pelipper', 'Arceus-Psychic', 'Dracovish', 'Weavile', 'MissingNo.', 'Tyranitar-Base', 'Reuniclus', 'Regirock', 'Stakataka', 'Zygarde-Base', 'Ninetales-Alola',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Seniors [May 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes Ubers'],
		unbanlist: [
			'Lugia', 'Sharpedo-Mega', 'Thundurus-Base', 'Pokestar Black Belt', 'Moltres-Base', 'Corviknight', 'Regidrago', 'Deoxys-Defense', 'Dragapult', 'Latias-Base', 'Palkia-Base', 'Arceus-Rock', 'Darmanitan-Galar', 'Tapu Lele', 'Deoxys-Base', 'Spectrier', 'Ferrothorn', 'Camerupt-Mega', 'Regice', 'Basculin-White-Striped', 'Pokestar F-00', 'Pelipper', 'Iron Jugulis', 'Naganadel', 'Keldeo-Base', 'Cobalion', 'Groudon-Base', 'Solgaleo', 'Okidogi', 'Scovillain-Base', 'Pokestar UFO-Base', 'Landorus-Base', 'Mew', 'Garganacl', 'Great Tusk',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Seniors [Apr 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes Ubers'],
		unbanlist: [
			'Forretress', 'Samurott-Hisui', 'Kyurem-White', 'Glalie-Base', 'Cresselia', 'Thundurus-Base', 'Regidrago', 'Banette-Mega', 'Dialga-Origin', 'Giratina-Origin', 'Palkia-Base', 'Arceus-Rock', 'Lunala', 'Machamp', 'Manectric-Mega', 'Naganadel', 'Pincurchin', 'Meloetta-Pirouette', 'Blissey', 'Alakazam-Mega', 'Aggron-Mega', 'Ogerpon-Hearthflame-Tera', 'Hoopa-Unbound', 'Dragapult', 'Camerupt-Mega', 'Tyranitar-Mega', 'Gothitelle', 'Skarmory-Base', 'Deoxys-Speed', 'Floette-Eternal-Base', 'Gastrodon', 'Dhelmise', 'Sceptile-Mega', 'Iron Treads', 'Victini',
		],
	},
	{
		section: '35 Pokes VGC',
		column: 3,
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Feb 2026]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Articuno-Galar', 'Aurorus', 'Bellossom', 'Bewear', 'Blastoise-Base', 'Dodrio', 'Entei', 'Falinks-Base', 'Flygon', 'Furret', 'Goodra-Hisui', 'Gumshoos-Base', 'Heliolisk', 'Hydrapple', 'Indeedee-F', 'Iron Thorns', 'Leavanny', 'Lickilicky', 'Ludicolo', 'Maractus', 'Meganium-Base', 'Polteageist', 'Probopass', 'Regieleki', 'Rhyperior', 'Seismitoad', 'Shiinotic', 'Slaking', 'Spidops', 'Spiritomb', 'Unfezant', 'Vanilluxe', 'Victreebel-Base', 'Weezing-Galar', 'Wyrdeer',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Jan 2026]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Carracosta', 'Celebi', 'Cinccino', 'Cobalion', 'Cradily', 'Dedenne', 'Fezandipiti', 'Gabite', 'Granbull', 'Greedent', 'Hatterene', 'Heatmor', 'Houndstone', 'Indeedee-M', 'Lilligant-Base', 'Medicham-Base', 'Orbeetle', 'Oricorio-Pom-Pom', 'Overqwil', 'Pincurchin', 'Pinsir-Base', 'Rotom-Wash', 'Samurott-Base', 'Scovillain-Base', 'Sharpedo-Base', 'Shedinja', 'Shiftry', 'Steelix-Base', 'Tropius', 'Type: Null', 'Typhlosion-Hisui', 'Tyrantrum', 'Veluza', 'Vivillon', 'Whimsicott',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Dec 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Mamoswine', 'Oricorio-Baile', 'Galvantula', 'Bombirdier', 'Gothitelle', 'Drampa-Base', 'Perrserker', 'Glastrier', 'Klinklang', 'Walrein', 
			'Uxie', 'Vanilluxe', 'Serperior', 'Revavroom', 'Falinks-Base', 'Braviary-Hisui', 'Wyrdeer', 'Beedrill-Base', 'Blastoise-Base', 'Squawkabilly-Green', 
			'Swoobat', 'Lurantis-Base', 'Hypno', 'Scrafty-Base', 'Sinistcha', 'Cyclizar', 'Mothim', 'Mismagius', 'Goodra-Base', 'Mandibuzz', 'Delcatty', 
			'Skarmory-Base', 'Cherrim-Base', 'Centiskorch', 'Wishiwashi',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Nov 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Altaria-Base', 'Ampharos-Base', 'Arbok', 'Armaldo', 'Calyrex-Base', 'Castform-Base', 'Dewgong', 'Drifblim', 'Emolga', 'Fearow', 'Furret', 'Glalie-Base', 'Gumshoos-Base', 'Heliolisk', 'Jumpluff', 'Kecleon', 'Ludicolo', 'Lunatone', 'Luxray', 'Lycanroc-Midnight', 'Meowstic-M', 'Primeape', 'Pupitar', 'Pyroar-Base', 'Rampardos', 'Scovillain-Base', 'Silvally-Fairy', 'Simisage', 'Sneasel-Hisui', 'Spidops', 'Swalot', 'Thievul', 'Tinkaton', 'Whiscash', 'Zangoose',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Oct 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Ambipom', 'Armarouge', 'Articuno-Base', 'Basculegion-F', 'Bibarel', 'Copperajah', 'Corviknight', 'Crobat', 'Dudunsparce', 'Dugtrio-Alola', 'Farigiraf', 'Floatzel', 'Froslass-Base', 'Golem-Alola', 'Hippowdon', 'Magmortar', 'Meganium-Base', 'Moltres-Base', 'Muk-Alola', 'Munkidori', 'Nidoking', 'Ninjask', 'Orthworm', 'Perrserker', 'Porygon-Z', 'Pyukumuku', 'Sandslash-Base', 'Sigilyph', 'Simisear', 'Sirfetch’d', 'Steelix-Base', 'Tauros-Base', 'Tauros-Paldea-Aqua', 'Weezing-Galar', 'Zoroark-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Sep 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Arbok', 'Avalugg-Base', 'Cacturne', 'Chesnaught-Base', 'Clodsire', 'Cobalion', 'Crawdaunt', 'Eldegoss', 'Empoleon', 'Falinks-Base', 'Feraligatr-Base', 'Ferrothorn', 'Florges', 'Galvantula', 'Grimmsnarl', 'Klawf', 'Lucario-Base', 'Ludicolo', 'Mantine', 'Marowak-Alola', 'Milotic', 'Musharna', 'Overqwil', 'Pincurchin', 'Primeape', 'Regice', 'Sceptile-Base', 'Scolipede-Base', 'Silvally-Dragon', 'Slurpuff', 'Torterra', 'Toxicroak', 'Trapinch', 'Vikavolt-Base', 'Wormadam-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Aug 2025]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Amoonguss', 'Arcanine-Base', 'Basculegion-F', 'Beartic', 'Brambleghast', 'Chandelure-Base', 'Chesnaught-Base', 'Cobalion', 'Copperajah', 'Cramorant-Base', 'Cursola', 'Dugtrio-Base', 'Eldegoss', 'Flygon', 'Froslass-Base', 'Frosmoth', 'Gabite', 'Gardevoir-Base', 'Hatterene', 'Heliolisk', 'Incineroar', 'Jolteon', 'Liepard', 'Maractus', 'Maushold', 'Oricorio-Pom-Pom', 'Overqwil', 'Shedinja', 'Stoutland', 'Sylveon', 'Toxapex', 'Toxicroak', 'Uxie', 'Weavile', 'Yanmega',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Jul 2025]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Arctovish', 'Azumarill', 'Blastoise-Base', 'Boltund', 'Bouffalant', 'Brambleghast', 'Braviary-Base', 'Chimecho-Base', 'Cofagrigus', 'Dachsbun', 'Darmanitan-Base', 'Delibird', 'Drakloak', 'Floatzel', 'Flygon', 'Gliscor', 'Grapploct', 'Incineroar', 'Kleavor', 'Lunatone', 'Mabosstiff', 'Marowak-Alola', 'Meowstic-F', 'Minun', 'Obstagoon', 'Persian-Alola', 'Primeape', 'Rapidash-Base', 'Raticate-Base', 'Reuniclus', 'Rillaboom', 'Rotom-Mow', 'Silvally-Ground', 'Simisage', 'Slowbro-Galar', 'Slowking-Base', 'Slowking-Galar', 'Starmie-Base', 'Tentacruel', 'Toedscruel',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Jun 2025]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Arbok', 'Archeops', 'Arctozolt', 'Bruxish', 'Calyrex-Base', 'Ditto', 'Drakloak', 'Dugtrio-Alola', 'Electrode-Base',
			'Escavalier', 'Espeon', 'Furfrou', 'Glimmora-Base', 'Grapploct', 'Honchkrow', 'Klawf', 'Lunatone', 'Luvdisc',
			'Masquerain', 'Mienshao', 'Mimikyu-Base', 'Orbeetle', 'Primeape', 'Purugly', 'Quaquaval', 'Rabsca', 'Simipour',
			'Simisage', 'Slowking-Base', 'Slowking-Galar', 'Smeargle', 'Tangrowth', 'Toedscruel', 'Tyranitar-Base', 'Uxie',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [May 2025]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Inteleon', 'Dragonair', 'Vivillon', 'Heatmor', 'Cinccino', 'Lopunny-Base', 'Politoed', 'Skarmory-Base', 'Maushold',
			'Nidoking', 'Jumpluff', 'Ribombee-Base', 'Mudsdale', 'Drednaw', 'Meganium-Base', 'Kecleon', 'Barraskewda', 'Goodra-Base',
			'Carbink', 'Raichu-Base', 'Honchkrow', 'Venusaur-Base', 'Cofagrigus', 'Lokix', 'Frosmoth', 'Pinsir-Base', 'Empoleon',
			'Shiinotic', 'Hitmontop', 'Claydol', 'Tangrowth', 'Swoobat', 'Swellow', 'Mienshao', 'Ninetales-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Apr 2025]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Kingdra', 'Crustle', 'Corsola-Base', 'Dipplin', 'Dusknoir', 'Drampa-Base', 'Pincurchin', 'Type: Null', 'Camerupt-Base',
			'Rotom-Base', 'Raticate-Base', 'Bombirdier', 'Cradily', 'Beedrill-Base', 'Gastrodon', 'Donphan', 'Chimecho-Base', 'Coalossal',
			'Dustox', 'Dedenne', 'Kecleon', 'Flareon', 'Cyclizar', 'Grumpig', 'Tentacruel', 'Miltank', 'Arcanine-Base',
			'Shelgon', 'Spinda', 'Wormadam-Sandy', 'Exploud', 'Marowak-Base', 'Hypno', 'Furret', 'Bastiodon',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Mar 2025]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Gourgeist-Small', 'Kingler', 'Rapidash-Base', 'Accelgor', 'Ariados', 'Magcargo', 'Sudowoodo', 'Qwilfish-Base', 'Eldegoss',
			'Stunfisk-Base', 'Raichu-Base', 'Klawf', 'Scolipede-Base', 'Gabite', 'Jynx', 'Linoone-Base', 'Unfezant', 'Revavroom',
			'Appletun', 'Kabutops', 'Wyrdeer', 'Charizard-Base', 'Grafaiai', 'Golem-Base', 'Medicham-Base', 'Thievul', 'Lucario-Base',
			'Mantine', 'Wormadam-Trash', 'Morpeko-Base', 'Drifblim', 'Granbull', 'Swalot', 'Aggron-Base', 'Luxray',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Feb 2025]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Rapidash-Galar', 'Whiscash', 'Scrafty-Base', 'Uxie', 'Arbok', 'Zangoose', 'Carnivine', 'Persian-Alola', 'Emolga',
			'Araquanid-Base', 'Pincurchin', 'Hitmonchan', 'Maractus', 'Dewgong', 'Spinda', 'Breloom', 'Parasect', 'Sigilyph',
			'Ambipom', 'Zygarde-10%', 'Tauros-Base', 'Glalie-Base', 'Golduck', 'Pangoro', 'Weezing-Base', 'Zweilous', 'Pinsir-Base',
			'Musharna', 'Cacturne', 'Regigigas', 'Arctozolt', 'Bewear', 'Kecleon', 'Alcremie', 'Togedemaru-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Jan 2025]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Clodsire', 'Comfey', 'Probopass', 'Bellibolt', 'Wugtrio', 'Unown', 'Shiftry', 'Swanna', 'Houndoom-Base',
			'Oricorio-Pom-Pom', 'Cursola', 'Slowbro-Base', 'Goodra-Base', 'Torkoal', 'Shaymin-Base', 'Infernape', 'Mesprit', 'Alcremie',
			'Golurk-Base', 'Dachsbun', 'Vileplume', 'Scyther', 'Donphan', 'Toedscruel', 'Sawsbuck', 'Reuniclus', 'Spiritomb',
			'Type: Null', 'Virizion', 'Absol-Base', 'Flapple', 'Crawdaunt', 'Kecleon', 'Jynx', 'Kingdra',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Dec 2024 AG]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC', '!35 Pokes Mega Clause'],
		unbanlist: [
			'Golem-Alola', 'Zoroark-Base', 'Pyukumuku', 'Guzzlord', 'Wugtrio', 'Garbodor', 'Aurorus', 'Morpeko-Base', 'Walrein',
			'Roserade', 'Ribombee-Base', 'Carracosta', 'Perrserker', 'Cryogonal', 'Appletun', 'Primarina', 'Pachirisu', 'Banette-Base',
			'Celebi', 'Avalugg-Base', 'Wo-Chien', 'Pupitar', 'Cetitan', 'Milotic', 'Scovillain-Base', 'Dipplin', 'Chandelure-Base',
			'Toxicroak', 'Magmortar', 'Yanmega', 'Cacturne', 'Luvdisc', 'Mawile-Base', 'Jumpluff', 'Rotom-Frost',
			'Jolteon', 'Lokix', 'Okidogi', 'Banette-Mega', 'Mawile-Mega',
			'Bug Gem', 'Dark Gem', 'Dragon Gem', 'Electric Gem', 'Fairy Gem', 'Fighting Gem', 'Fire Gem', 'Flying Gem', 'Ghost Gem',
			'Grass Gem', 'Ground Gem', 'Ice Gem', 'Poison Gem', 'Psychic Gem', 'Rock Gem', 'Steel Gem', 'Water Gem',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Dec 2024]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Golem-Alola', 'Zoroark-Base', 'Pyukumuku', 'Guzzlord', 'Wugtrio', 'Garbodor', 'Aurorus', 'Morpeko-Base', 'Walrein',
			'Roserade', 'Ribombee-Base', 'Carracosta', 'Perrserker', 'Cryogonal', 'Appletun', 'Primarina', 'Pachirisu', 'Banette-Base',
			'Celebi', 'Avalugg-Base', 'Wo-Chien', 'Pupitar', 'Cetitan', 'Milotic', 'Scovillain-Base', 'Dipplin', 'Chandelure-Base',
			'Toxicroak', 'Magmortar', 'Yanmega', 'Cacturne', 'Luvdisc', 'Mawile-Base', 'Jumpluff', 'Rotom-Frost',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Nov 2024]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Wishiwashi-Base', 'Ampharos-Base', 'Tsareena', 'Glaceon', 'Centiskorch', 'Frosmoth', 'Exeggutor-Base', 'Shelgon', 'Granbull',
			'Guzzlord', 'Reuniclus', 'Spiritomb', 'Unown', 'Shedinja', 'Lurantis-Base', 'Gabite', 'Gourgeist-Base', 'Ledian',
			'Golduck', 'Qwilfish-Base', 'Pinsir-Base', 'Gumshoos-Base', 'Wigglytuff', 'Arbok', 'Dusknoir', 'Araquanid-Base', 'Kecleon',
			'Exeggutor-Alola', 'Trapinch', 'Appletun', 'Turtonator', 'Drampa-Base', 'Gorebyss', 'Gourgeist-Super', 'Galvantula',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Oct 2024]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Ninjask', 'Perrserker', 'Klinklang', 'Snorlax', 'Houndstone', 'Amoonguss', 'Seviper', 'Rhydon', 'Vigoroth',
			'Bellossom', 'Sandaconda', 'Samurott-Base', 'Honchkrow', 'Scyther', 'Clawitzer', 'Bisharp', 'Sinistcha-Base', 'Guzzlord',
			'Porygon-Z', 'Sylveon', 'Sudowoodo', 'Vikavolt-Base', 'Noivern', 'Blastoise-Base', 'Dudunsparce', 'Dugtrio-Alola', 'Gengar-Base',
			'Emboar-Base', 'Munkidori', 'Zoroark-Hisui', 'Stoutland', 'Accelgor', 'Stunfisk-Base', 'Magmortar', 'Doublade',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Sep 2024]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Starmie-Base', 'Muk-Alola', 'Krookodile', 'Slowking-Galar', 'Gabite', 'Florges', 'Bellibolt', 'Rotom-Fan', 'Beartic',
			'Hatterene', 'Fearow', 'Simisage', 'Pyroar-Base', 'Politoed', 'Mudsdale', 'Manectric-Base', 'Rhydon', 'Simisear',
			'Basculin-White-Striped', 'Swalot', 'Wyrdeer', 'Klawf', 'Flareon', 'Wugtrio', 'Glimmora-Base', 'Clodsire', 'Armaldo',
			'Togedemaru-Base', 'Toxicroak', 'Arctibax', 'Komala', 'Spidops', 'Sandslash-Alola', 'Dustox', 'Accelgor',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Aug 2024]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Mandibuzz', 'Braviary-Base', 'Dusclops', 'Sawk', 'Corsola-Base', 'Maushold-Base', 'Vivillon', 'Runerigus', 'Chesnaught-Base',
			'Rotom-Heat', 'Dhelmise', 'Illumise', 'Seviper', 'Boltund', 'Braviary-Hisui', 'Mamoswine', 'Charizard-Base', 'Smeargle',
			'Donphan', 'Musharna', 'Muk-Alola', 'Frosmoth', 'Sableye-Base', 'Blissey', 'Heracross-Base', 'Eelektross-Base', 'Trapinch',
			'Fezandipiti', 'Golem-Alola', 'Lanturn', 'Quagsire', 'Squawkabilly-Yellow', 'Cradily', 'Scizor-Base', 'Vanilluxe',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Jul 2024]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Venusaur-Base', 'Shiftry', 'Mabosstiff', 'Donphan', 'Rotom-Heat', 'Garbodor', 'Blastoise-Base', 'Oricorio-Pom-Pom', 'Tinkaton',
			'Lilligant-Base', 'Claydol', 'Brambleghast', 'Noctowl', 'Aggron-Base', 'Rapidash-Galar', 'Muk-Base', 'Rampardos', 'Houndoom-Base',
			'Masquerain', 'Dachsbun', 'Cloyster', 'Rotom-Mow', 'Flareon', 'Eiscue-Base', 'Hitmontop', 'Charizard-Base', 'Primeape',
			'Shedinja', 'Pawmot', 'Goodra-Base', 'Mantine', 'Furret', 'Slurpuff', 'Torterra', 'Scrafty-Base', 'Yanmega',
			'Mamoswine', 'Dondozo', 'Porygon2', 'Kingdra', 'Chesnaught-Base', 'Ferrothorn', 'Zebstrika', 'Regice',
			'Slowking-Base', 'Klawf', 'Trapinch',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Jun 2024]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Mimikyu-Base', 'Cacturne', 'Mabosstiff', 'Cyclizar', 'Raticate-Alola', 'Wyrdeer', 'Pincurchin', 'Slowbro-Galar', 'Arboliva',
			'Heliolisk', 'Trapinch', 'Runerigus', 'Gabite', 'Illumise', 'Probopass', 'Banette-Base', 'Exeggutor-Base', 'Registeel',
			'Squawkabilly-Base', 'Delphox-Base', 'Spidops', 'Indeedee-M', 'Scyther', 'Fearow', 'Magcargo', 'Walrein', 'Crabominable-Base',
			'Toxicroak', 'Bellibolt', 'Rotom-Wash', 'Avalugg-Base', 'Raichu-Alola', 'Sirfetch’d', 'Talonflame', 'Kricketune',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [May 2024]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Carbink', 'Mantine', 'Dusknoir', 'Cryogonal', 'Milotic', 'Mr. Mime-Base', 'Hitmonchan', 'Shiinotic', 'Beheeyem',
			'Drampa-Base', 'Oinkologne-F', 'Dustox', 'Sunflora', 'Raichu-Alola', 'Meowstic-Base', 'Dachsbun', 'Calyrex-Base', 'Arbok',
			'Octillery', 'Maushold-Base', 'Grafaiai', 'Torkoal', 'Miltank', 'Froslass-Base', 'Ariados', 'Sableye-Base', 'Cherrim-Base',
			'Simisear', 'Salazzle-Base', 'Zoroark-Base', 'Emolga', 'Wobbuffet', 'Klawf', 'Delcatty', 'Drakloak',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Apr 2024]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Lokix', 'Sandslash-Alola', 'Altaria-Base', 'Gengar-Base', 'Drampa-Base', 'Dugtrio-Alola', 'Stoutland', 'Golisopod-Base', 'Abomasnow-Base',
			'Frosmoth', 'Fezandipiti', 'Golduck', 'Vespiquen', 'Decidueye-Base', 'Charizard-Base', 'Hippowdon', 'Rabsca', 'Coalossal',
			'Houndstone', 'Leafeon', 'Glaceon', 'Slowking-Base', 'Manectric-Base', 'Alomomola', 'Accelgor', 'Mismagius', 'Dachsbun',
			'Tentacruel', 'Sandslash-Base', 'Tinkaton', 'Roserade', 'Sableye-Base', 'Palossand', 'Cobalion', 'Garbodor',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Mar 2024]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Oricorio-Base', 'Wigglytuff', 'Phione', 'Politoed', 'Ninjask', 'Samurott-Base', 'Galvantula', 'Mesprit', 'Scrafty-Base',
			'Rotom-Fan', 'Greedent', 'Seaking', 'Swampert-Base', 'Weezing-Galar', 'Shelgon', 'Leafeon', 'Cacturne', 'Turtonator',
			'Magmortar', 'Lilligant-Base', 'Sirfetch’d', 'Oricorio-Sensu', 'Persian-Alola', 'Farigiraf', 'Pinsir-Base', 'Primeape', 'Tatsugiri-Base',
			'Dugtrio-Alola', 'Flygon', 'Regice', 'Ditto', 'Grafaiai', 'Pidgeot-Base', 'Palossand', 'Ribombee-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Feb 2024]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Tauros-Paldea-Blaze', 'Ceruledge', 'Klinklang', 'Houndstone', 'Gothitelle', 'Snorlax', 'Sandslash-Base', 'Morpeko-Base', 'Sawk',
			'Nidoqueen', 'Lickilicky', 'Shiftry', 'Vanilluxe', 'Jynx', 'Wormadam-Trash', 'Vigoroth', 'Mr. Rime', 'Skarmory-Base',
			'Tyrantrum', 'Aromatisse', 'Primarina', 'Golem-Alola', 'Maushold-Base', 'Pangoro', 'Malamar-Base', 'Clodsire', 'Klawf',
			'Meganium-Base', 'Quagsire', 'Toxicroak', 'Wugtrio', 'Walrein', 'Raichu-Base', 'Serperior', 'Zebstrika',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Jan 2024]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Hatterene', 'Drakloak', 'Luvdisc', 'Tangrowth', 'Snorlax', 'Starmie-Base', 'Ursaring', 'Appletun', 'Stoutland',
			'Musharna', 'Chatot', 'Masquerain', 'Gorebyss', 'Kecleon', 'Avalugg-Hisui', 'Rhyperior', 'Beedrill-Base', 'Meowstic-F',
			'Probopass', 'Dewgong', 'Braviary-Base', 'Houndoom-Base', 'Gothitelle', 'Crobat', 'Tentacruel', 'Eldegoss', 'Seaking',
			'Lapras', 'Ferrothorn', 'Dubwool', 'Araquanid-Base', 'Yanmega', 'Dudunsparce', 'Slowking-Base', 'Lucario-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Dec 2023]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Mabosstiff', 'Eelektross-Base', 'Camerupt-Base', 'Grapploct', 'Drifblim', 'Ampharos-Base', 'Lurantis-Base', 'Gyarados-Base', 'Hypno',
			'Druddigon', 'Durant', 'Chesnaught-Base', 'Gastrodon', 'Eldegoss', 'Pelipper', 'Dodrio', 'Wailord', 'Emolga',
			'Dachsbun', 'Drampa-Base', 'Trevenant', 'Passimian', 'Beautifly', 'Tyranitar-Base', 'Regirock', 'Stunfisk-Galar', 'Morpeko-Base',
			'Jumpluff', 'Heatmor', 'Froslass-Base', 'Audino-Base', 'Cetitan', 'Pincurchin', 'Cradily', 'Ninetales-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Nov 2023]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Copperajah', 'Dhelmise', 'Mudsdale', 'Veluza', 'Bellossom', 'Tropius', 'Cramorant-Base', 'Jellicent', 'Boltund',
			'Scolipede-Base', 'Typhlosion-Base', 'Klefki', 'Metagross-Base', 'Swoobat', 'Honchkrow', 'Cursola', 'Revavroom', 'Swampert-Base',
			'Garbodor', 'Electivire', 'Slurpuff', 'Jynx', 'Bombirdier', 'Mismagius', 'Wyrdeer', 'Lanturn', 'Carnivine',
			'Kangaskhan-Base', 'Bellibolt', 'Kingdra', 'Perrserker', 'Steelix-Base', 'Alcremie', 'Heliolisk', 'Beartic',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Oct 2023 B]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Liepard', 'Dragalge-Base', 'Clefable-Base', 'Clodsire', 'Gigalith', 'Cacturne', 'Porygon2', 'Shuckle', 'Emboar-Base',
			'Doublade', 'Phione', 'Lumineon', 'Toucannon', 'Mandibuzz', 'Cinccino', 'Avalugg-Hisui', 'Sceptile-Base', 'Toedscruel',
			'Hitmontop', 'Golem-Alola', 'Dugtrio-Base', 'Mr. Rime', 'Ariados', 'Pachirisu', 'Ambipom', 'Volbeat', 'Centiskorch',
			'Shiinotic', 'Poliwrath', 'Stoutland', 'Banette-Base', 'Aurorus', 'Mawile-Base', 'Sableye-Base', 'Orthworm',
			'Rotom-Mow', 'Sandslash-Alola', 'Toxicroak', 'Roserade', 'Lopunny-Base', 'Luxray', 'Solrock', 'Cryogonal', 'Noctowl',
			// 'Xatu', banned
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Oct 2023]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Liepard', 'Dragalge-Base', 'Clefable-Base', 'Clodsire', 'Gigalith', 'Cacturne', 'Porygon2', 'Mimikyu-Base', 'Scovillain-Base',
			'Lycanroc-Base', 'Jolteon', 'Bisharp', 'Togekiss', 'Starmie-Base', 'Shuckle', 'Emboar-Base', 'Doublade', 'Phione',
			'Lumineon', 'Toucannon', 'Mandibuzz', 'Rotom-Base', 'Falinks-Base', 'Magnezone', 'Dondozo', 'Brambleghast', 'Goodra-Base',
			'Articuno-Base', 'Cinccino', 'Avalugg-Hisui', 'Sceptile-Base', 'Toedscruel', 'Hitmontop', 'Golem-Alola', 'Dugtrio-Base',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Sep 2023]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Zoroark-Hisui', 'Yanmega', 'Mothim', 'Rapidash-Galar', 'Drapion', 'Chimecho-Base', 'Espeon', 'Vaporeon', 'Mamoswine',
			'Vespiquen', 'Barbaracle-Base', 'Shedinja', 'Alakazam-Base', 'Glaceon', 'Staraptor-Base', 'Electrode-Hisui', 'Lickilicky', 'Whiscash',
			'Cherrim-Base', 'Armaldo', 'Slowking-Base', 'Kingler', 'Dudunsparce', 'Watchog', 'Flygon', 'Granbull', 'Decidueye-Base',
			'Flareon', 'Bronzong', 'Rampardos', 'Fearow', 'Relicanth', 'Hitmonlee', 'Altaria-Base', 'Tinkaton',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Aug 2023]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Vileplume', 'Swanna', 'Yanmega', 'Heracross-Base', 'Nidoking', 'Leafeon', 'Kricketune', 'Swellow', 'Comfey',
			'Bibarel', 'Empoleon', 'Ludicolo', 'Tangrowth', 'Simisear', 'Parasect', 'Krookodile', 'Eelektross-Base', 'Abomasnow-Base',
			'Avalugg-Base', 'Bastiodon', 'Dusclops', 'Minior-Base', 'Masquerain', 'Victreebel-Base', 'Rabsca', 'Linoone-Base', 'Omastar',
			'Politoed', 'Ledian', 'Donphan', 'Magcargo', 'Bombirdier', 'Dedenne', 'Butterfree', 'Jynx',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes VGC [Jul 2023]",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: ['Standard 35 Pokes VGC'],
		unbanlist: [
			'Leavanny', 'Masquerain', 'Eiscue-Base', 'Torterra', 'Dragonair', 'Runerigus', 'Swalot', 'Muk-Alola', 'Musharna',
			'Hippowdon', 'Alomomola', 'Aggron-Base', 'Umbreon', 'Galvantula', 'Pawmot', 'Quagsire', 'Slurpuff', 'Sigilyph',
			'Vaporeon', 'Blastoise-Base', 'Aegislash-Base', 'Scizor-Base', 'Spiritomb', 'Golisopod-Base', 'Clawitzer', 'Ninetales-Base', 'Delphox-Base',
			'Typhlosion-Base', 'Marowak-Base', 'Porygon-Z', 'Jumpluff', 'Absol-Base', 'Porygon2', 'Rotom-Frost', 'Rotom-Mow',
		],
	},

	// endregion

	// region 35 Pokes Extended

	{
		section: '35 Pokes Collabs',
		column: 4,
	},
	{
		name: "[Gen 9] Benjamin Button",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes', 'Scalemons Mod'],
		unbanlist: [
			'Articuno-Base', 'Entei', 'Latias-Base', 'Heatran-Base', 'Thundurus-Base', 'Tapu Bulu', 'Regieleki', 'Venusaur-Base', 'Arctozolt', 'Ting-Lu', 'Ogerpon-Wellspring', 'Dialga-Base', 'Mamoswine', 'Celebi', 'Great Tusk', 'Meloetta-Base', 'Lugia', 'Deino', 'Lechonk', 'Arrokuda', 'Psyduck', 'Ferroseed', 'Beldum', 'Exeggcute', 'Charmander', 'Archen', 'Fomantis', 'Roggenrola', 'Tentacool', 'Munna', 'Hatenna', 'Drilbur', 'Bagon', 'Minccino', 'Whimsicott',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes NFE [Nov 2024]",
		desc: '35 Pokes x NFE collab.',
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		unbanlist: [
			'Steenee', 'Cutiefly', 'Duosion', 'Charmeleon', 'Quilladin', 'Meditite', 'Dewott', 'Aipom', 'Fletchinder', 'Poipole', 'Shelgon', 'Ivysaur', 'Pawmo', 'Growlithe-Hisui', 'Trumbeak', 'Marshtomp', 'Mudbray', 'Vanillish', 'Prinplup', 'Sliggoo-Base', 'Vibrava', 'Dartrix', 'Nidorino', 'Loudred', 'Dolliv', 'Flittle', 'Drakloak', 'Brionne', 'Whirlipede', 'Braixen', 'Murkrow', 'Crocalor', 'Krokorok', 'Flaaffy', 'Wartortle',
		],
	},
	// TODO: generic forcemonocolor
	{
		name: "[Gen 9] ND 35 Pokes Monocolor [May 2024]",
		desc: '35 Pokes x Monocolor collab.',
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes', /* 'Force Monocolor' */],
		unbanlist: [
			'Kingler', 'Scizor-Base', 'Braviary-Base', 'Crustle', 'Klawf', 'Druddigon', 'Wugtrio', 'Krookodile', 'Armarouge', 'Magmortar', 'Wailord', 'Jumpluff', 'Blastoise-Base', 'Sandslash-Alola', 'Empoleon', 'Nidoqueen', 'Eelektross-Base', 'Aurorus', 'Gastrodon-East', 'Tangrowth', 'Ribombee-Base', 'Vespiquen', 'Sunflora', 'Ampharos-Base', 'Cofagrigus', 'Hypno', 'Falinks-Base', 'Ninetales-Base', 'Typhlosion-Base', 'Exeggutor-Base', 'Carnivine', 'Kecleon', 'Yanmega', 'Araquanid-Base', 'Garbodor', 'Sceptile-Base', 'Politoed', 'Appletun', 'Tyranitar-Base', 'Golurk-Base', 'Claydol', 'Toucannon', 'Houndoom-Base', 'Toedscruel', 'Umbreon', 'Banette-Base', 'Mawile-Base', 'Snorlax', 'Seviper', 'Raticate-Alola', 'Minior-Base', 'Shiftry', 'Brambleghast', 'Perrserker', 'Dachsbun', 'Torkoal', 'Barbaracle-Base', 'Dragalge-Base', 'Clodsire', 'Dugtrio-Base', 'Drifblim', 'Aerodactyl-Base', 'Ambipom', 'Noivern', 'Weezing-Base', 'Starmie-Base', 'Goodra-Base', 'Drapion', 'Pincurchin', 'Gastrodon', 'Unfezant', 'Grafaiai', 'Hakamo-o', 'Golem-Alola', 'Probopass', 'Donphan', 'Golisopod-Base', 'Veluza', 'Steelix-Base', 'Machamp', 'Mesprit', 'Lurantis-Base', 'Bewear', 'Flamigo', 'Tinkaton', 'Clefable-Base', 'Milotic', 'Orthworm', 'Hatterene', 'Slowbro-Base', 'Togekiss', 'Frosmoth', 'Cursola', 'Amoonguss', 'Absol-Base', 'Gardevoir-Base', 'Dubwool', 'Alcremie', 'Maushold', 'Pachirisu',
		],
	},
	{
		section: '35 Moves',
		column: 4,
	},
	{
		name: "[Gen 9] ND 35 Moves [May 2025]",
		mod: 'gen9',
		ruleset: ['Standard NatDex', '!Evasion Clause', 'Evasion Moves Clause', 'Evasion Items Clause', 'Mega Rayquaza Clause'],
		banlist: ['ND AG', 'pokemontag:allmoves'],
		unbanlist: [
			'Absorb', 'Bubble', 'Cotton Guard', 'Smack Down', 'Skill Swap', 'Guillotine', 'Vacuum Wave', 'Retaliate', 'Miracle Eye', 'Low Sweep', 'Fire Punch', 'Aura Sphere', 'Flatter', 'Scorching Sands', 'Iron Defense', 'Psybeam', 'Solar Beam', 'Frenzy Plant', 'Night Shade', 'Sky Attack', 'Air Slash', 'Psychic Fangs', 'Payback', 'Lovely Kiss', 'Hydro Cannon', 'Bone Rush', 'Dragon Dance', 'Frost Breath', 'Heavy Slam', 'Temper Flare', 'Magical Leaf', 'Aqua Ring', 'Rock Polish', 'Rock Slide', 'Bullet Punch',
		],
	},
	{
		name: "[Gen 9] ND 35 Moves [Sep 2024]",
		mod: 'gen9',
		ruleset: [
			'Standard NatDex', '!Evasion Clause', 'Evasion Moves Clause', 'Evasion Items Clause', 'Mega Rayquaza Clause', 'Z-Move Clause', 'Terastal Clause',
		],
		banlist: ['ND AG', 'pokemontag:allmoves'],
		unbanlist: [
			'Giga Impact', 'Rage', 'Metal Burst', 'Me First', 'Stealth Rock', 'Acid', 'Psychic Noise', 'Clear Smog', 'Curse', 'Fake Out', 'Soak', 'Dig', 'Fling', 'Wonder Room', 'Sludge', 'Acid Armor', 'Hurricane', 'Gastro Acid', 'Power Split', 'Sweet Scent', 'Disable', 'Body Press', 'Spite', 'Shock Wave', 'Sludge Bomb', 'Flail', 'Bubble', 'Inferno', 'Knock Off', 'Autotomize', 'Withdraw', 'Spark', 'Mimic', 'Vine Whip', 'Focus Blast',
		],
	},
	{
		section: '35 Pokes Pockets',
		column: 4,
	},
	{
		name: "[Gen 9] ND 35 Pokes Pockets Space-Time Smackdown",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		unbanlist: [
			'Mightyena', 'Dusknoir', 'Uxie', 'Purugly', 'Electrode', 'Gabite', 'Hitmontop', 'Lickilicky', 'Lumineon', 'Togekiss', 'Kricketune', 'Glaceon', 'Lopunny', 'Toxicroak', 'Vespiquen', 'Drapion', 'Weavile', 'Bellossom', 'Cresselia', 'Skuntank', 'Empoleon', 'Bastiodon', 'Abomasnow', 'Rotom-Mow', 'Skarmory-Base', 'Staraptor-Base', 'Carnivine', 'Wormadam-Trash', 'Dusclops', 'Regigigas', 'Infernape', 'Rotom-Wash', 'Gliscor', 'Wormadam-Sandy', 'Rampardos',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Pockets Genetic Apex",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		unbanlist: [
			'Tauros-Base', 'Charizard-Base', 'Raticate-Base', 'Aerodactyl-Base', 'Magneton', 'Machamp', 'Pikachu-Base', 'Vaporeon', 'Gengar-Base', 'Gardevoir-Base', 'Pidgeot-Base', 'Primeape', 'Swoobat', 'Rapidash-Base', 'Kabutops', 'Heatmor', 'Pincurchin', 'Nidoking', 'Tentacruel', 'Cloyster', 'Mawile-Base', 'Dubwool', 'Golduck', 'Chansey', 'Electrode-Base', 'Weezing-Base', 'Golem-Base', 'Cinccino', 'Jynx', 'Golurk-Base', 'Dugtrio-Base', 'Mienshao', 'Starmie-Base', 'Centiskorch', 'Electabuzz',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Pockets Mythical Island",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		unbanlist: [
			'Exeggutor-Base', 'Celebi', 'Serperior', 'Dhelmise', 'Rapidash', 'Magmar', 'Volcarona', 'Salazzle', 'Gyarados', 'Vaporeon', 'Lumineon', 'Drednaw', 'Cramorant', 'Pikachu', 'Raichu-Base', 'Electabuzz', 'Galvantula', 'Dedenne', 'Mew', 'Sigilyph', 'Beheeyem', 'Florges', 'Slurpuff', 'Golem-Base', 'Aerodactyl', 'Primeape', 'Stonjourner', 'Weezing', 'Liepard', 'Scolipede-Base', 'Druddigon', 'Pidgeot', 'Tauros', 'Chatot', 'Shiinotic',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Pockets Shining Revelry",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes'],
		unbanlist: [
			'Pachirisu', 'Pawmot', 'Raticate-Base', 'Flamigo', 'Electrode-Base', 'Wugtrio', 'Tauros-Paldea-Blaze', 'Mr. Mime-Base', 'Drifblim', 'Magmortar', 'Dondozo', 'Arbok', 'Hitmonlee', 'Charizard-Base', 'Alakazam-Base', 'Spiritomb', 'Gimmighoul-Base', 'Lucario-Base', 'Cyclizar', 'Revavroom', 'Tatsugiri-Base', 'Machamp', 'Tinkaton', 'Clodsire', 'Floragato', 'Wigglytuff', 'Lopunny-Base', 'Pinsir-Base', 'Lickilicky', 'Floatzel', 'Hitmonchan', 'Bibarel', 'Tentacruel', 'Beedrill-Base', 'Pikachu-Base',
		],
	},
	{
		section: '35 Pokes ADV',
		column: 4,
	},
	{
		name: "[Gen 3] 35 Pokes [Sep 2024]",
		mod: 'gen3',
		ruleset: ['Standard', 'One Boost Passer Clause', 'Freeze Clause Mod'],
		banlist: ['All Pokemon'],
		unbanlist: [
			'Tropius', 'Wailord', 'Sunflora', 'Plusle', 'Camerupt-Base', 'Raichu-Base', 'Hitmonlee', 'Beedrill-Base', 'Lapras', 'Solrock', 'Volbeat', 'Lunatone', 'Arcanine-Base', 'Hitmontop', 'Slowbro-Base', 'Umbreon', 'Jumpluff', 'Marowak-Base', 'Magcargo', 'Dewgong', 'Corsola-Base', 'Delibird', 'Masquerain', 'Pidgeot-Base', 'Relicanth', 'Gardevoir-Base', 'Parasect', 'Shiftry', 'Weezing-Base', 'Armaldo', 'Seaking', 'Beautifly', 'Clamperl', 'Qwilfish-Base', 'Grumpig',
		],
	},
	{
		name: "[Gen 3] 35 Pokes [Aug 2024]",
		mod: 'gen3',
		ruleset: ['Standard', 'One Boost Passer Clause', 'Freeze Clause Mod'],
		banlist: ['All Pokemon'],
		unbanlist: [
			'Seaking', 'Raticate-Base', 'Sableye-Base', 'Corsola-Base', 'Walrein', 'Magneton', 'Mawile-Base', 'Aggron-Base', 'Magcargo', 'Cacturne', 'Glalie-Base', 'Steelix-Base', 'Sandslash-Base', 'Gligar', 'Xatu', 'Flareon', 'Chimecho-Base', 'Delibird', 'Sneasel-Base', 'Linoone-Base', 'Farfetch’d-Base', 'Whiscash', 'Trapinch', 'Ditto', 'Pikachu-Base', 'Roselia', 'Muk-Base', 'Shedinja', 'Meganium-Base', 'Dunsparce', 'Crobat', 'Raichu-Base', 'Castform-Base', 'Spinda', 'Absol-Base',
		],
	},
	{
		section: '35 Pokes Flipped',
		column: 4,
	},
	{
		name: "[Gen 9] ND 35 Pokes Flipped [Jan 2025]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes', 'Flipped Mod'],
		unbanlist: [
			'Flamigo', 'Golduck', 'Braviary-Base', 'Pyroar-Base', 'Carbink', 'Persian-Alola', 'Avalugg-Base', 'Rotom-Base', 'Scyther', 'Archeops', 'Shedinja', 'Roserade', 'Dipplin', 'Oinkologne-Base', 'Toedscruel', 'Bisharp', 'Ludicolo', 'Sirfetch’d', 'Heliolisk', 'Drampa-Base', 'Watchog', 'Gourgeist-Small', 'Aegislash-Blade', 'Vikavolt-Base', 'Qwilfish-Base', 'Scrafty-Base', 'Mudsdale', 'Excadrill-Base', 'Magcargo', 'Gourgeist-Base', 'Claydol', 'Farigiraf', 'Corsola-Base', 'Mabosstiff', 'Raichu-Alola', 'Dudunsparce', 'Beartic', 'Honchkrow', 'Cobalion', 'Ninetales-Base', 'Slaking', 'Alcremie', 'Pawmot', 'Golem-Alola', 'Gothitelle', 'Cyclizar', 'Spinda', 'Hawlucha-Base', 'Diggersby', 'Venusaur-Base', 'Lurantis-Base', 'Sudowoodo', 'Braviary-Hisui',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Flipped [Dec 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes', 'Flipped Mod'],
		unbanlist: [
			'Drapion', 'Seaking', 'Jumpluff', 'Oricorio-Pa\'u', 'Duraludon', 'Spinda', 'Carracosta', 'Relicanth', 'Miltank', 'Scolipede-Base', 'Abomasnow-Base', 'Wailord', 'Centiskorch', 'Silvally-Base', 'Machamp', 'Swampert-Base', 'Cinccino', 'Maushold-Base', 'Magmortar', 'Clodsire', 'Darmanitan-Base', 'Turtonator', 'Orbeetle', 'Druddigon', 'Excadrill-Base', 'Raticate-Base', 'Houndoom-Base', 'Regice', 'Butterfree', 'Mandibuzz', 'Granbull', 'Zangoose', 'Gigalith', 'Samurott-Base', 'Wobbuffet', 'Ambipom', 'Camerupt-Base', 'Hypno', 'Purugly', 'Politoed', 'Weavile', 'Pachirisu', 'Qwilfish-Base', 'Roserade', 'Hitmonchan', 'Veluza', 'Kecleon', 'Huntail', 'Altaria-Base', 'Raichu-Alola', 'Metagross-Base', 'Articuno-Base', 'Conkeldurr',
		],
	},
	{
		name: "[Gen 9] ND 35 Pokes Flipped [Nov 2024]",
		mod: 'gen9',
		ruleset: ['Standard 35 Pokes', 'Flipped Mod'],
		unbanlist: [
			'Nihilego', 'Samurott-Hisui', 'Milotic', 'Rillaboom', 'Snorlax', 'Entei', 'Umbreon', 'Iron Thorns', 'Hydreigon', 'Necrozma-Base', 'Musharna', 'Roserade', 'Virizion', 'Krookodile', 'Magmortar', 'Indeedee-M', 'Glastrier', 'Dondozo', 'Heracross-Base', 'Rapidash-Base', 'Terrakion', 'Vanilluxe', 'Smeargle', 'Carbink', 'Probopass', 'Iron Hands', 'Arbok', 'Meganium-Base', 'Iron Jugulis', 'Sharpedo-Base', 'Simipour', 'Hypno', 'Appletun', 'Ampharos-Base', 'Pidgeot-Base', 'Swanna', 'Gengar-Base', 'Leafeon', 'Dugtrio-Base', 'Seaking', 'Victreebel-Base', 'Emboar-Base', 'Crawdaunt', 'Exeggutor-Alola', 'Tropius', 'Glaceon', 'Vivillon-Base', 'Vespiquen', 'Pinsir-Base', 'Plusle', 'Raticate-Alola',
		],
	},

	// endregion

	// region Miscellaneous

	{
		section: 'Misc',
		column: 5,
	},
	{
		name: "[Gen 9] Broken Cup",
		desc: '[Gen 9] Hackmons Cup but with only the most powerful Pok&eacute;mon, moves, abilities, and items.',
		team: 'randomHC',
		ruleset: ['HP Percentage Mod', 'Cancel Mod'],
		banlist: ['All Pokemon', 'All Abilities', 'All Items', 'All Moves'],
		unbanlist: [
			'10,000,000 Volt Thunderbolt', 'Abomasnow-Mega', 'Absol-Mega', 'Accelerock', 'Acid Spray', 'Adaptability', 'Aeroblast',
			'Aerodactyl-Mega', 'Aftermath', 'Aggron', 'Aggron-Mega', 'Aguav Berry', 'Air Balloon', 'Air Slash', 'Alakazam-Mega',
			'Alluring Voice', 'Altaria-Mega', 'Ampharos-Mega', 'Analytic', 'Anchor Shot', 'Anger Shell', 'Annihilape', 'Anticipation',
			'Apple Acid', 'Aqua Step', 'Arcanine', 'Arcanine-Hisui', 'Archaludon', 'Archeops', 'Arena Trap', 'Armarouge', 'Armor Cannon',
			'Aromatherapy', 'Articuno', 'Articuno-Galar', 'As One (Glastrier)', 'As One (Spectrier)', 'Assault Vest', 'Astral Barrage',
			'Attack Order', 'Audino-Mega', 'Aura Sphere', 'Axe Kick', 'Azelf', 'Baddy Bad', 'Baneful Bunker', 'Banette-Mega',
			'Barb Barrage', 'Basculegion', 'Basculegion-F', 'Baton Pass', 'Baxcalibur', 'Beads of Ruin', 'Beak Blast', 'Beast Boost',
			'Behemoth Bash', 'Behemoth Blade', 'Belly Drum', 'Berserk', 'Bitter Blade', 'Bitter Malice', 'Blacephalon', 'Blastoise',
			'Blastoise-Mega', 'Blaziken', 'Blaziken-Mega', 'Blazing Torque', 'Bleakwind Storm', 'Blissey', 'Blizzard', 'Blood Moon',
			'Blue Flare', 'Blunder Policy', 'Body Press', 'Body Slam', 'Bolt Beak', 'Bolt Strike', 'Boomburst', 'Bouncy Bubble',
			'Brave Bird', 'Bright Powder', 'Brute Bonnet', 'Bug Buzz', 'Bullet Punch', 'Burning Bulwark', 'Buzzwole', 'Buzzy Buzz',
			'Calm Mind', 'Calyrex-Ice', 'Calyrex-Shadow', 'Camerupt-Mega', 'Catastropika', 'Ceaseless Edge', 'Celebi', 'Celesteela',
			'Centiskorch', 'Ceruledge', 'Charizard', 'Charizard-Mega-X', 'Charizard-Mega-Y', 'Chatter', 'Chesnaught', 'Chesto Berry',
			'Chi-Yu', 'Chien-Pao', 'Chilan Berry', 'Chilling Neigh', 'Chilly Reception', 'Choice Band', 'Choice Scarf', 'Choice Specs',
			'Cinderace', 'Circle Throw', 'Clanging Scales', 'Clangorous Soul', 'Clangorous Soulblaze', 'Clear Amulet', 'Clear Body',
			'Clear Smog', 'Close Combat', 'Cloyster', 'Cobalion', 'Coil', 'Collision Course', 'Comatose', 'Combat Torque', 'Competitive',
			'Compound Eyes', 'Contrary', 'Core Enforcer', 'Cosmic Power', 'Cotton Guard', 'Court Change', 'Covert Cloak', 'Crabhammer',
			'Cresselia', 'Crobat', 'Cross Chop', 'Curse', 'Custap Berry', 'Dark Pulse', 'Darkest Lariat', 'Darkrai',
			'Darmanitan-Galar-Zen', 'Darmanitan-Zen', 'Decidueye', 'Decidueye-Hisui', 'Defend Order', 'Defiant', 'Defog', 'Delphox',
			'Deoxys', 'Deoxys-Attack', 'Deoxys-Defense', 'Deoxys-Speed', 'Desolate Land', 'Dialga', 'Dialga-Origin', 'Diamond Storm',
			'Diancie', 'Diancie-Mega', 'Dire Claw', 'Disable', 'Discharge', 'Dondozo', 'Doom Desire', 'Double Iron Bash', 'Download',
			'Draco Meteor', 'Draco Plate', 'Dragapult', 'Dragon Ascent', 'Dragon Dance', 'Dragon Darts', 'Dragon Energy', 'Dragon Hammer',
			'Dragon Pulse', 'Dragon Tail', 'Dragonite', 'Drain Punch', 'Dread Plate', 'Drill Peck', 'Drizzle', 'Drought', 'Drum Beating',
			'Dry Skin', 'Duraludon', 'Dusknoir', 'Dynamax Cannon', 'Earth Eater', 'Earth Plate', 'Earth Power', 'Earthquake',
			'Eerie Spell', 'Effect Spore', 'Eject Pack', 'Electivire', 'Electric Surge', 'Electro Drift', 'Emboar', 'Empoleon',
			'Enamorus', 'Enamorus-Therian', 'Encore', 'Energy Ball', 'Entei', 'Eruption', 'Espeon', 'Esper Wing', 'Eternatus',
			'Eternatus-Eternamax', 'Exeggutor', 'Exeggutor-Alola', 'Expanding Force', 'Expert Belt', 'Explosion', 'Extreme Evoboost',
			'Extreme Speed', 'Fake Out', 'Feraligatr', 'Fezandipiti', 'Fickle Beam', 'Fiery Wrath', 'Figy Berry', 'Filter',
			'Fire Blast', 'Fire Lash', 'First Impression', 'Fishious Rend', 'Fist Plate', 'Flame Body', 'Flame Charge', 'Flame Plate',
			'Flamethrower', 'Flare Blitz', 'Flareon', 'Flash Cannon', 'Fleur Cannon', 'Flip Turn', 'Floaty Fall', 'Florges',
			'Flower Trick', 'Fluffy', 'Flutter Mane', 'Focus Blast', 'Focus Sash', 'Forewarn', 'Foul Play', 'Freeze-Dry', 'Freezing Glare',
			'Freezy Frost', 'Frost Breath', 'Full Metal Body', 'Fur Coat', 'Fusion Bolt', 'Fusion Flare', 'Future Sight', 'G-Max Befuddle',
			'G-Max Cannonade', 'G-Max Centiferno', 'G-Max Resonance', 'G-Max Steelsurge', 'G-Max Stonesurge', 'G-Max Sweetness',
			'G-Max Vine Lash', 'G-Max Volcalith', 'G-Max Wildfire', 'G-Max Wind Rage', 'Gallade-Mega', 'Garchomp', 'Garchomp-Mega',
			'Gardevoir-Mega', 'Gear Grind', 'Genesect', 'Genesis Supernova', 'Gengar-Mega', 'Gholdengo', 'Giga Drain', 'Gigaton Hammer',
			'Giratina', 'Giratina-Origin', 'Glaceon', 'Glacial Lance', 'Glaive Rush', 'Glalie-Mega', 'Glare', 'Glastrier', 'Glimmora',
			'Glitzy Glow', 'Gogoat', 'Golisopod', 'Good as Gold', 'Goodra', 'Goodra-Hisui', 'Gooey', 'Gorilla Tactics', 'Gouging Fire',
			'Grassy Surge', 'Grav Apple', 'Great Tusk', 'Greninja', 'Greninja-Ash', 'Grim Neigh', 'Groudon', 'Groudon-Primal',
			'Guardian of Alola', 'Gunk Shot', 'Guzzlord', 'Gyarados', 'Gyarados-Mega', 'Hadron Engine', 'Hammer Arm', 'Haxorus',
			'Haze', 'Head Charge', 'Head Smash', 'Headlong Rush', 'Heal Bell', 'Heal Order', 'Healing Wish', 'Heart Swap', 'Heat Crash',
			'Heat Wave', 'Heatran', 'Heavy-Duty Boots', 'Heracross-Mega', 'High Horsepower', 'High Jump Kick', 'Hippowdon', 'Ho-Oh',
			'Hone Claws', 'Hoopa', 'Hoopa-Unbound', 'Horn Leech', 'Houndoom-Mega', 'Huge Power', 'Hurricane', 'Hustle', 'Hydreigon',
			'Hydrapple', 'Hydro Pump', 'Hydro Steam', 'Hyper Drill', 'Iapapa Berry', 'Ice Beam', 'Ice Hammer', 'Ice Scales', 'Ice Shard',
			'Ice Spinner', 'Icicle Plate', 'Illusion', 'Imposter', 'Incineroar', 'Infernape', 'Innards Out', 'Insect Plate', 'Inteleon',
			'Intimidate', 'Intrepid Sword', 'Iron Barbs', 'Iron Boulder', 'Iron Bundle', 'Iron Crown', 'Iron Hands', 'Iron Head',
			'Iron Jugulis', 'Iron Leaves', 'Iron Moth', 'Iron Plate', 'Iron Tail', 'Iron Thorns', 'Iron Treads', 'Iron Valiant',
			'Ivy Cudgel', 'Jet Punch', 'Jirachi', 'Jolteon', 'Judgment', 'Jungle Healing', 'Kangaskhan-Mega', 'Kartana', 'Keldeo',
			'Keldeo-Resolute', 'King\'s Rock', 'King\'s Shield', 'Kingambit', 'Kingdra', 'Knock Off', 'Kommo-o', 'Koraidon', 'Kyogre',
			'Kyogre-Primal', 'Kyurem', 'Kyurem-Black', 'Kyurem-White', 'Landorus', 'Landorus-Therian', 'Lapras', 'Last Respects', 'Latias',
			'Latias-Mega', 'Latios', 'Latios-Mega', 'Lava Plume', 'Leaf Blade', 'Leaf Storm', 'Leafeon', 'Leech Life', 'Leech Seed',
			'Leftovers', 'Leppa Berry', 'Let\'s Snuggle Forever', 'Levitate', 'Libero', 'Liechi Berry', 'Life Orb', 'Light Screen',
			'Light That Burns the Sky', 'Light of Ruin', 'Lightning Rod', 'Liquidation', 'Lopunny-Mega', 'Lovely Kiss', 'Low Kick',
			'Lucario', 'Lucario-Mega', 'Lugia', 'Lum Berry', 'Lumina Crash', 'Lunala', 'Lunar Blessing', 'Lunar Dance', 'Lunge',
			'Luster Purge', 'Mach Punch', 'Magearna', 'Magic Bounce', 'Magic Guard', 'Magical Torque', 'Magma Storm', 'Magmortar',
			'Magnezone', 'Mago Berry', 'Make It Rain', 'Malicious Moonsault', 'Malignant Chain', 'Mamoswine', 'Manaphy', 'Manectric-Mega',
			'Marshadow', 'Marvel Scale', 'Matcha Gotcha', 'Max Guard', 'Meadow Plate', 'Megahorn', 'Meganium', 'Melmetal', 'Meloetta',
			'Meloetta-Pirouette', 'Memento', 'Menacing Moonraze Maelstrom', 'Mental Herb', 'Meowscarada', 'Mesprit', 'Metagross',
			'Metagross-Mega', 'Meteor Mash', 'item: Metronome', 'Mew', 'Mewtwo', 'Mewtwo-Mega-X', 'Mewtwo-Mega-Y', 'Mighty Cleave',
			'Milk Drink', 'Milotic', 'Mind Plate', 'Mind\'s Eye', 'Minimize', 'Miraidon', 'Mirror Herb', 'Mist Ball', 'Misty Surge',
			'Mold Breaker', 'Moltres', 'Moltres-Galar', 'Moody', 'Moonblast', 'Moongeist Beam', 'Moonlight', 'Morning Sun', 'Mortal Spin',
			'Mountain Gale', 'Moxie', 'Multiscale', 'Munkidori', 'Muscle Band', 'Mystical Fire', 'Mystical Power', 'Naganadel',
			'Nasty Plot', 'Natural Cure', 'Nature\'s Madness', 'Necrozma', 'Necrozma-Dawn-Wings', 'Necrozma-Dusk-Mane', 'Necrozma-Ultra',
			'Neuroforce', 'Neutralizing Gas', 'Night Daze', 'Night Shade', 'Nihilego', 'No Retreat', 'Noivern', 'Noxious Torque',
			'Nuzzle', 'Oblivion Wing', 'Obstruct', 'Oceanic Operetta', 'Octolock', 'Ogerpon', 'Ogerpon-Cornerstone', 'Ogerpon-Hearthflame',
			'Ogerpon-Wellspring', 'Okidogi', 'Opportunist', 'Orichalcum Pulse', 'Origin Pulse', 'Outrage', 'Overdrive', 'Overheat',
			'Pain Split', 'Palafin-Hero', 'Palkia', 'Palkia-Origin', 'Parental Bond', 'Parting Shot', 'Pecharunt', 'Perish Body',
			'Perish Song', 'Petaya Berry', 'Pheromosa', 'Photon Geyser', 'Pidgeot-Mega', 'Pinsir-Mega', 'Pixie Plate', 'Plasma Fists',
			'Play Rough', 'Poison Heal', 'Poison Point', 'Poison Touch', 'Pollen Puff', 'Poltergeist', 'Population Bomb', 'Porygon-Z',
			'Power Gem', 'Power Trip', 'Power Whip', 'Prankster', 'Precipice Blades', 'Primarina', 'Primordial Sea', 'Prism Armor',
			'Probopass', 'Protean', 'Protect', 'Psyblade', 'Psychic Fangs', 'Psychic Surge', 'Psychic', 'Psycho Boost', 'Psyshield Bash',
			'Psystrike', 'Pulverizing Pancake', 'Pure Power', 'Purifying Salt', 'Pursuit', 'Pyro Ball', 'Quaquaval', 'Quick Claw',
			'Quiver Dance', 'Rage Fist', 'Raging Bolt', 'Raging Bull', 'Raging Fury', 'Raikou', 'Rapid Spin', 'Rayquaza', 'Rayquaza-Mega',
			'Razor Claw', 'Recover', 'Red Card', 'Reflect', 'Regenerator', 'Regice', 'Regidrago', 'Regieleki', 'Regigigas', 'Regirock',
			'Registeel', 'Reshiram', 'Rest', 'Revelation Dance', 'Revival Blessing', 'Rhyperior', 'Rillaboom', 'Roar', 'Roaring Moon',
			'Rocky Helmet', 'Roost', 'Rough Skin', 'Ruination', 'Sacred Fire', 'Sacred Sword', 'Salac Berry', 'Salamence', 'Salamence-Mega',
			'Salt Cure', 'Samurott', 'Samurott-Hisui', 'Sandsear Storm', 'Sandy Shocks', 'Sap Sipper', 'Sappy Seed', 'Scald', 'Sceptile',
			'Sceptile-Mega', 'Scizor-Mega', 'Scope Lens', 'Scream Tail', 'Searing Shot', 'Searing Sunraze Smash', 'Secret Sword',
			'Seed Flare', 'Seismic Toss', 'Serene Grace', 'Serperior', 'Shadow Ball', 'Shadow Bone', 'Shadow Shield', 'Shadow Sneak',
			'Shadow Tag', 'Sharpedo-Mega', 'Shaymin', 'Shaymin-Sky', 'Shed Skin', 'Shed Tail', 'Sheer Force', 'Shell Side Arm',
			'Shell Smash', 'Shield Dust', 'Shift Gear', 'Silk Scarf', 'Silk Trap', 'Silvally', 'Simple', 'Sinister Arrow Raid',
			'Sitrus Berry', 'Sizzly Slide', 'Skeledirge', 'Sky Plate', 'Slack Off', 'Slaking', 'Sleep Powder', 'Slither Wing',
			'Slowbro-Mega', 'Sludge Bomb', 'Sludge Wave', 'Snarl', 'Snipe Shot', 'Snorlax', 'Soft-Boiled', 'Solgaleo', 'Solid Rock',
			'Soul-Heart', 'Soul-Stealing 7-Star Strike', 'Spacial Rend', 'Sparkly Swirl', 'Spectral Thief', 'Spectrier', 'Speed Boost',
			'Spikes', 'Spiky Shield', 'Spin Out', 'Spirit Break', 'Spirit Shackle', 'Splash Plate', 'Splintered Stormshards',
			'Splishy Splash', 'Spooky Plate', 'Spore', 'Springtide Storm', 'Stakataka', 'Stakeout', 'Stamina', 'Static', 'Stealth Rock',
			'Steam Eruption', 'Steelix-Mega', 'Sticky Web', 'Stoked Sparksurfer', 'Stone Axe', 'Stone Edge', 'Stone Plate', 'Stored Power',
			'Storm Drain', 'Storm Throw', 'Strange Steam', 'Strength Sap', 'Sturdy', 'Sucker Punch', 'Suicune', 'Sunsteel Strike',
			'Super Fang', 'Supercell Slam', 'Superpower', 'Supreme Overlord', 'Surf', 'Surging Strikes', 'Swampert', 'Swampert-Mega',
			'Sword of Ruin', 'Swords Dance', 'Sylveon', 'Synthesis', 'Tablets of Ruin', 'Tachyon Cutter', 'Tail Glow', 'Tangling Hair',
			'Tangrowth', 'Tapu Bulu', 'Tapu Fini', 'Tapu Koko', 'Tapu Lele', 'Taunt', 'Techno Blast', 'Teleport', 'Tera Blast',
			'Tera Starstorm', 'Terapagos-Stellar', 'Terapagos-Terastal', 'Teravolt', 'Terrakion', 'Thermal Exchange', 'Thick Fat',
			'Thousand Arrows', 'Thousand Waves', 'Throat Spray', 'Thunder Cage', 'Thunder Wave', 'Thunder', 'Thunderbolt', 'Thunderclap',
			'Thunderous Kick', 'Thundurus', 'Thundurus-Therian', 'Tidy Up', 'Ting-Lu', 'Tinted Lens', 'Togekiss', 'Topsy-Turvy',
			'Torch Song', 'Tornadus', 'Tornadus-Therian', 'Torterra', 'Tough Claws', 'Toxic Chain', 'Toxic Debris', 'Toxic Plate',
			'Toxic Spikes', 'Toxic', 'Tri Attack', 'Triage', 'Triple Arrows', 'Triple Axel', 'Turboblaze', 'Type: Null', 'Typhlosion',
			'Typhlosion-Hisui', 'Tyranitar', 'Tyranitar-Mega', 'U-turn', 'Umbreon', 'Unaware', 'Unburden', 'Ursaluna', 'Ursaluna-Bloodmoon',
			'Urshifu', 'Urshifu-Rapid-Strike', 'Uxie', 'V-create', 'Vanilluxe', 'Vaporeon', 'Venusaur', 'Venusaur-Mega', 'Vessel of Ruin',
			'Victini', 'Victory Dance', 'Virizion', 'Volcanion', 'Volcarona', 'Volt Absorb', 'Volt Switch', 'Volt Tackle', 'Walking Wake',
			'Walrein', 'Water Absorb', 'Water Bubble', 'Water Shuriken', 'Water Spout', 'Waterfall', 'Wave Crash', 'Weakness Policy',
			'Well-Baked Body', 'Whirlwind', 'White Herb', 'Wicked Blow', 'Wicked Torque', 'Wide Lens', 'Wiki Berry', 'Wild Charge',
			'Wildbolt Storm', 'Will-O-Wisp', 'Wise Glasses', 'Wish', 'Wishiwashi-School', 'Wo-Chien', 'Wonder Guard', 'Wood Hammer',
			'Wyrdeer', 'Xerneas', 'Xurkitree', 'Yawn', 'Yveltal', 'Zacian', 'Zacian-Crowned', 'Zamazenta', 'Zamazenta-Crowned', 'Zap Plate',
			'Zapdos', 'Zapdos-Galar', 'Zarude', 'Zekrom', 'Zeraora', 'Zing Zap', 'Zippy Zap', 'Zygarde', 'Zygarde-Complete',
		],
	},
	{
		name: "[Gen 9] Broken Cup FFA",
		desc: '[Gen 9] Hackmons Cup but with only the most powerful Pok&eacute;mon, moves, abilities, and items.',
		gameType: 'freeforall',
		team: 'randomHC',
		ruleset: ['[Gen 9] Broken Cup'],
	},
	{
		name: "[Gen 9] Chaos Cup",
		mod: 'spmnm',
		team: 'randomHC',
		ruleset: [
			'Team Preview', 'HP Percentage Mod', 'Cancel Mod', 'Scalemons Mod', 'Adjust Level = 100', 'Max Move Count = 6', 'Max Team Size = 12', 'Picked Team Size = 6',
			'Sleep Clause Mod', 'NatDex Mod', 'No Move-Species Restrictions',
		],
		banlist: [
			'CAP', 'LGPE', 'MissingNo.', 'Pikachu-Cosplay', 'Pichu-Spiky-eared', 'Pokestar Smeargle', 'Pokestar UFO', 'Pokestar UFO-2', 'Pokestar Brycen-Man', 'Pokestar MT', 'Pokestar MT2', 'Pokestar Transport', 'Pokestar Giant', 'Pokestar Humanoid', 'Pokestar Monster', 'Pokestar F-00', 'Pokestar F-002', 'Pokestar Spirit', 'Pokestar Black Door', 'Pokestar White Door', 'Pokestar Black Belt', 'Pokestar UFO-PropU2', 'Xerneas-Neutral',

			'Wonder Guard', 'Moody',

			'Max Strike', 'Max Knuckle', 'Max Airstream', 'Max Rockfall', 'Max Ooze', 'Max Quake', 'Max Flutterby', 'Max Phantasm', 'Max Steelspike', 'Max Flare', 'Max Geyser', 'Max Overgrowth', 'Max Lightning', 'Max Mindstorm', 'Max Hailstorm', 'Max Wyrmwind', 'Max Darkness', 'Max Starfall', 'G-max Drum Solo', 'G-max Fireball', 'G-max Hydrosnipe', 'Max Guard',

			'Breakneck Blitz', 'All-Out Pummeling', 'Supersonic Skystrike', 'Acid Downpour', 'Tectonic Rage', 'Continental Crush', 'Savage Spin-Out', 'Never-Ending Nightmare', 'Corkscrew Crash', 'Inferno Overdrive', 'Hydro Vortex', 'Bloom Doom', 'Gigavolt Havoc', 'Shattered Psyche', 'Subzero Slammer', 'Devastating Drake', 'Black Hole Eclipse', 'Twinkle Tackle',
		],
		unbanlist: [
			'G-Max Vine Lash', 'G-Max Wildfire', 'G-Max Cannonade', 'G-Max Befuddle', 'G-Max Volt Crash', 'G-Max Gold Rush', 'G-Max Chi Strike', 'G-Max Terror', 'G-Max Foam Burst', 'G-Max Resonance', 'G-Max Malodor', 'G-Max Meltdown', 'G-Max Wind Rage', 'G-Max Gravitas', 'G-Max Stonesurge', 'G-Max Volcalith', 'G-Max Tartness', 'G-Max Sandblast', 'G-Max Stun Shock', 'G-Max Centiferno', 'G-Max Smite', 'G-Max Snooze', 'G-Max Finale', 'G-Max Steelsurge',
		],
		onBegin: spmnm.onBegin,
		onSwitchIn: spmnm.onSwitchIn,
		onSwitchOut: spmnm.onSwitchOut,
		getSharedPower: spmnm.getSharedPower,
		onBeforeSwitchIn: spmnm.onBeforeSwitchIn,
	},
	{
		name: "[Gen 9] Chaos Cup FFA",
		mod: 'spmnm',
		gameType: 'freeforall',
		team: 'randomHC',
		ruleset: ['[Gen 9] Chaos Cup'],
		onBegin: spmnm.onBegin,
		onSwitchIn: spmnm.onSwitchIn,
		onSwitchOut: spmnm.onSwitchOut,
		getSharedPower: spmnm.getSharedPower,
		onBeforeSwitchIn: spmnm.onBeforeSwitchIn,
	},
	{
		name: "[Gen 9] Hackmons Cup",
		desc: 'Randomized teams of level-balanced Pok&eacute;mon with absolutely any ability, moves, and item.',
		mod: 'gen9',
		team: 'randomHC',
		ruleset: ['HP Percentage Mod', 'Cancel Mod'],
		banlist: ['CAP', 'LGPE', 'MissingNo.', 'Pikachu-Cosplay', 'Pichu-Spiky-eared', 'Pokestar Smeargle', 'Pokestar UFO', 'Pokestar UFO-2', 'Pokestar Brycen-Man', 'Pokestar MT', 'Pokestar MT2', 'Pokestar Transport', 'Pokestar Giant', 'Pokestar Humanoid', 'Pokestar Monster', 'Pokestar F-00', 'Pokestar F-002', 'Pokestar Spirit', 'Pokestar Black Door', 'Pokestar White Door', 'Pokestar Black Belt', 'Pokestar UFO-PropU2', 'Xerneas-Neutral'],
	},
	{
		name: "[Gen 9] Hackmons Cup FFA",
		desc: 'Randomized teams of level-balanced Pok&eacute;mon with absolutely any ability, moves, and item.',
		mod: 'gen9',
		gameType: 'freeforall',
		team: 'randomHC',
		ruleset: ['[Gen 9] Hackmons Cup'],
	},
	{
		name: "[Gen 9] Anything Goes",
		mod: 'gen9',
		ruleset: ['Standard AG'],
	},
	{
		name: "[Gen 9] National Dex AG",
		mod: 'gen9',
		ruleset: ['Standard AG', 'NatDex Mod'],
	},
	{
		name: "[Gen 9] Test",
		debug: true,
		mod: 'gen9',
		ruleset: ['Standard AG'],
	},

	// endregion

];
