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
	paldex: [
		"Sprigatito", "Floragato", "Meowscarada", "Fuecoco", "Crocalor", "Skeledirge", "Quaxly", "Quaxwell", "Quaquaval", "Lechonk", "Oinkologne", "Tarountula", "Spidops", "Nymble", "Lokix", "Hoppip", "Skiploom", "Jumpluff", "Fletchling", "Fletchinder", "Talonflame", "Pawmi", "Pawmo", "Pawmot", "Houndour", "Houndoom", "Yungoos", "Gumshoos", "Skwovet", "Greedent", "Sunkern", "Sunflora", "Kricketot", "Kricketune", "Scatterbug", "Spewpa", "Vivillon", "Combee", "Vespiquen", "Rookidee", "Corvisquire", "Corviknight", "Happiny", "Chansey", "Blissey", "Azurill", "Marill", "Azumarill", "Surskit", "Masquerain", "Buizel", "Floatzel", "Wooper", "Clodsire", "Psyduck", "Golduck", "Chewtle", "Drednaw", "Igglybuff", "Jigglypuff", "Wigglytuff", "Ralts", "Kirlia", "Gardevoir", "Gallade", "Drowzee", "Hypno", "Gastly", "Haunter", "Gengar", "Tandemaus", "Maushold", "Pichu", "Pikachu", "Raichu", "Fidough", "Dachsbun", "Slakoth", "Vigoroth", "Slaking", "Bounsweet", "Steenee", "Tsareena", "Smoliv", "Dolliv", "Arboliva", "Bonsly", "Sudowoodo", "Rockruff", "Lycanroc", "Rolycoly", "Carkol", "Coalossal", "Shinx", "Luxio", "Luxray", "Starly", "Staravia", "Staraptor", "Oricorio", "Mareep", "Flaaffy", "Ampharos", "Petilil", "Lilligant", "Shroomish", "Breloom", "Applin", "Flapple", "Appletun", "Spoink", "Grumpig", "Squawkabilly", "Misdreavus", "Mismagius", "Makuhita", "Hariyama", "Crabrawler", "Crabominable", "Salandit", "Salazzle", "Phanpy", "Donphan", "Cufant", "Copperajah", "Gible", "Gabite", "Garchomp", "Nacli", "Naclstack", "Garganacl", "Wingull", "Pelipper", "Magikarp", "Gyarados", "Arrokuda", "Barraskewda", "Basculin", "Gulpin", "Swalot", "Meowth", "Persian", "Drifloon", "Drifblim", "Flabe\u0301be\u0301", "Floette", "Florges", "Diglett", "Dugtrio", "Torkoal", "Numel", "Camerupt", "Bronzor", "Bronzong", "Axew", "Fraxure", "Haxorus", "Mankey", "Primeape", "Annihilape", "Meditite", "Medicham", "Riolu", "Lucario", "Charcadet", "Armarouge", "Ceruledge", "Barboach", "Whiscash", "Tadbulb", "Bellibolt", "Goomy", "Sliggoo", "Goodra", "Croagunk", "Toxicroak", "Wattrel", "Kilowattrel", "Eevee", "Vaporeon", "Jolteon", "Flareon", "Espeon", "Umbreon", "Leafeon", "Glaceon", "Sylveon", "Dunsparce", "Dudunsparce", "Deerling", "Sawsbuck", "Girafarig", "Farigiraf", "Grimer", "Muk", "Maschiff", "Mabosstiff", "Toxel", "Toxtricity", "Dedenne", "Pachirisu", "Shroodle", "Grafaiai", "Stantler", "Foongus", "Amoonguss", "Voltorb", "Electrode", "Magnemite", "Magneton", "Magnezone", "Ditto", "Growlithe", "Arcanine", "Teddiursa", "Ursaring", "Zangoose", "Seviper", "Swablu", "Altaria", "Skiddo", "Gogoat", "Tauros", "Litleo", "Pyroar", "Stunky", "Skuntank", "Zorua", "Zoroark", "Sneasel", "Weavile", "Murkrow", "Honchkrow", "Gothita", "Gothorita", "Gothitelle", "Sinistea", "Polteageist", "Mimikyu", "Klefki", "Indeedee", "Bramblin", "Brambleghast", "Toedscool", "Toedscruel", "Tropius", "Fomantis", "Lurantis", "Klawf", "Capsakid", "Scovillain", "Cacnea", "Cacturne", "Rellor", "Rabsca", "Venonat", "Venomoth", "Pineco", "Forretress", "Scyther", "Scizor", "Heracross", "Flittle", "Espathra", "Hippopotas", "Hippowdon", "Sandile", "Krokorok", "Krookodile", "Silicobra", "Sandaconda", "Mudbray", "Mudsdale", "Larvesta", "Volcarona", "Bagon", "Shelgon", "Salamence", "Tinkatink", "Tinkatuff", "Tinkaton", "Hatenna", "Hattrem", "Hatterene", "Impidimp", "Morgrem", "Grimmsnarl", "Wiglett", "Wugtrio", "Bombirdier", "Finizen", "Palafin", "Varoom", "Revavroom", "Cyclizar", "Orthworm", "Sableye", "Shuppet", "Banette", "Falinks", "Hawlucha", "Spiritomb", "Noibat", "Noivern", "Dreepy", "Drakloak", "Dragapult", "Glimmet", "Glimmora", "Rotom", "Greavard", "Houndstone", "Oranguru", "Passimian", "Komala", "Larvitar", "Pupitar", "Tyranitar", "Stonjourner", "Eiscue", "Pincurchin", "Sandygast", "Palossand", "Slowpoke", "Slowbro", "Slowking", "Shellos", "Gastrodon", "Shellder", "Cloyster", "Qwilfish", "Luvdisc", "Finneon", "Lumineon", "Bruxish", "Alomomola", "Skrelp", "Dragalge", "Clauncher", "Clawitzer", "Tynamo", "Eelektrik", "Eelektross", "Mareanie", "Toxapex", "Flamigo", "Dratini", "Dragonair", "Dragonite", "Snom", "Frosmoth", "Snover", "Abomasnow", "Delibird", "Cubchoo", "Beartic", "Snorunt", "Glalie", "Froslass", "Cryogonal", "Cetoddle", "Cetitan", "Bergmite", "Avalugg", "Rufflet", "Braviary", "Pawniard", "Bisharp", "Kingambit", "Deino", "Zweilous", "Hydreigon", "Veluza", "Dondozo", "Tatsugiri", "Great Tusk", "Scream Tail", "Brute Bonnet", "Flutter Mane", "Slither Wing", "Sandy Shocks", "Iron Treads", "Iron Bundle", "Iron Hands", "Iron Jugulis", "Iron Moth", "Iron Thorns", "Frigibax", "Arctibax", "Baxcalibur", "Gimmighoul", "Gholdengo", "Wo-Chien", "Chien-Pao", "Ting-Lu", "Chi-Yu", "Roaring Moon", "Iron Valiant", "Koraidon", "Miraidon",
	].map(toID),
};

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
	format: 'natdex' | keyof typeof formats | null = null;

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

	getFullSet() {
		return new Set((function*() {
			for (let i = 0; i < 75; i++) {
				yield i as BingoNum;
			}
		})());
	}

	// we're generating a fresh board and assigning it.
	// each cell holds a number between 0 - 75 and a species.
	generateBoard(index: number) {
		if (!this.isOn()) {
			throw new Error('Can not generate a board because the plugin is off.');
		}
		this.boards[index] = [];
		const board = this.boards[index];
		const speciesPool = new Set(this.format === 'natdex'
			? Dex.species.all().map(({ id }) => id)
			: formats[this.format]);
		const numPool = this.getFullSet();
		for (let i = 0; i < 25; i++) {
			// this is not quite the same logic that PDL uses
			// -- theirs is not properly random -- but this should work fine.
			const num = this.rng.sample([...numPool]);
			numPool.delete(num);
			const species = this.rng.sample([...speciesPool]);
			speciesPool.delete(species);
			board[i] = [num, species];
		}
	}

	// we're drawing a number from the available pool.
	roll() {
		if (!this.isOn()) {
			throw new Error('Can not roll a number because the plugin is off.');
		}
		const unrolled = [...this.getFullSet()].filter((x) => !this.rolls.has(x));
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

};

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
			this.sendReplyBox(
				<div class="ladder">
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
											{board.slice(row * 5, (row + 1) * 5)
												.map(([num, id]) => [num, Dex.species.get(id)] as const)
												.map(([num, species]) => (
												<td>
													<img
														src={`https://www.smogon.com/forums/media/minisprites/${species.spriteid}.png`}
														alt={species.id}
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
