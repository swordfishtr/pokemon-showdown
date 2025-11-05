export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {

	// Edits

	ceaselessedge: {
		inherit: true,
		basePower: 60,
	},
	ragefist: {
		inherit: true,
		basePowerCallback(pokemon) {
			return Math.min(350, 50 + 25 * pokemon.timesAttacked);
		},
	},
	stoneaxe: {
		inherit: true,
		basePower: 60,
	},
	triplekick: {
		inherit: true,
		basePower: 20,
		basePowerCallback(pokemon, target, move) {
			return 20 * move.hit;
		},
	},
	twineedle: {
		inherit: true,
		accuracy: 90,
		basePower: 40,
		isNonstandard: null,
	},
	xscissor: {
		inherit: true,
		critRatio: 2,
	},

	// Drowsy implementation. Everything except Rest inflicts yawn instead.

	darkvoid: {
		inherit: true,
		accuracy: true,
		status: undefined,
		volatileStatus: 'yawn',
	},
	direclaw: {
		inherit: true,
		secondary: {
			chance: 50,
			onHit(target, source) {
				const result = this.random(3);
				if (result === 0) {
					target.trySetStatus('psn', source);
				} else if (result === 1) {
					target.trySetStatus('par', source);
				} else {
					target.addVolatile('yawn', source);
				}
			},
		},
	},
	gmaxbefuddle: {
		inherit: true,
		self: {
			onHit(source) {
				for (const pokemon of source.foes()) {
					const result = this.random(3);
					if (result === 0) {
						pokemon.addVolatile('yawn', source);
					} else if (result === 1) {
						pokemon.trySetStatus('par', source);
					} else {
						pokemon.trySetStatus('psn', source);
					}
				}
			},
		},
	},
	grasswhistle: {
		inherit: true,
		accuracy: true,
		status: undefined,
		volatileStatus: 'yawn',
	},
	hypnosis: {
		inherit: true,
		accuracy: true,
		status: undefined,
		volatileStatus: 'yawn',
	},
	lovelykiss: {
		inherit: true,
		accuracy: true,
		status: undefined,
		volatileStatus: 'yawn',
	},
	relicsong: {
		inherit: true,
		secondary: {
			chance: 10,
			volatileStatus: 'yawn',
		},
	},
	secretpower: {
		inherit: true,
		onModifyMove(move, pokemon) {
			if (this.field.isTerrain('')) return;
			move.secondaries = [];
			if (this.field.isTerrain('electricterrain')) {
				move.secondaries.push({
					chance: 30,
					status: 'par',
				});
			} else if (this.field.isTerrain('grassyterrain')) {
				move.secondaries.push({
					chance: 30,
					volatileStatus: 'yawn',
				});
			} else if (this.field.isTerrain('mistyterrain')) {
				move.secondaries.push({
					chance: 30,
					boosts: {
						spa: -1,
					},
				});
			} else if (this.field.isTerrain('psychicterrain')) {
				move.secondaries.push({
					chance: 30,
					boosts: {
						spe: -1,
					},
				});
			}
		},
	},
	sing: {
		inherit: true,
		accuracy: true,
		status: undefined,
		volatileStatus: 'yawn',
	},
	sleeppowder: {
		accuracy: true,
		inherit: true,
		status: undefined,
		volatileStatus: 'yawn',
	},
	spore: {
		inherit: true,
		accuracy: true,
		status: undefined,
		volatileStatus: 'yawn',
	},
	wickedtorque: {
		inherit: true,
		secondary: {
			chance: 10,
			volatileStatus: 'yawn',
		},
	},
	yawn: {
		inherit: true,
		volatileStatus: 'yawn',
		onTryHit: undefined,
		condition: undefined,
	},

	// Additions

	conversionz: {
		num: -6001,
		accuracy: 100,
		basePower: 80,
		category: "Special",
		name: "Conversion-Z",
		pp: 5,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1 },
		beforeTurnCallback(pokemon, target) {
			pokemon.addVolatile('conversionz');

			// Type is chosen:
			// - on turn start, before switches
			// - not accounting for effects (can't use battle events)
			// - randomly from the most effective types according to the type chart
			// - normal type if target is typeless

			const targetTypes = [ ...target.types, target.addedType ]
			.map((x) => this.dex.types.get(x))
			.filter((x) => x.exists);

			if(!targetTypes.length) {
				pokemon.volatiles['conversionz'].conversionztype = 'Normal';
				this.debug('Conversion-Z Type set to Normal (typeless target)');
				return;
			}

			const getEffectiveness = (x: number) => ([1, 2, 1/2, 0][x] ?? 0);

			let topEffectiveness = -1;
			let moveTypes = ['Normal'];

			for(const offensiveType of this.dex.types.names()) {
				let effectiveness = 1;
				for(const defensiveType of targetTypes) {
					effectiveness *= getEffectiveness(defensiveType.damageTaken[offensiveType]);
				}

				if(effectiveness > topEffectiveness) {
					topEffectiveness = effectiveness;
					moveTypes = [offensiveType];
				}
				else if(effectiveness === topEffectiveness) {
					moveTypes.push(offensiveType);
				}
			}

			const type = this.sample(moveTypes);
			pokemon.volatiles['conversionz'].conversionztype = type;
			this.debug(`Conversion-Z Type set to ${type} (${topEffectiveness}x)`);
		},
		condition: {
			duration: 1,
			onModifyType(move, pokemon, target) {
				if(move.id !== 'conversionz') return;
				const type = this.effectState.conversionztype ?? 'Normal';
				if(move.type === type) return;
				move.type = type;
				this.add('-singlemove', pokemon, 'Conversion-Z', type);
				this.hint(`Conversion-Z changed to ${type} type!`, false);
			},
		},
		secondary: null,
		target: "normal",
		type: "Normal",
		shortDesc: "Changes move's type to deal super effective damage to the target.",
		desc: 'blank',
	},
	coldsnap: {
		num: -6002,
		accuracy: 85,
		basePower: 0,
		category: "Status",
		name: "Cold Snap",
		pp: 15,
		priority: 0,
		flags: { protect: 1, reflectable: 1, mirror: 1, metronome: 1 },
		status: 'frz',
		secondary: null,
		target: "normal",
		type: "Ice",
		shortDesc: 'Frostbites the target.',
		desc: 'blank',
	},

};
