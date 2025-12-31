export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {

	// Edits

	ceaselessedge: {
		inherit: true,
		basePower: 60,
	},
	dualchop: {
		inherit: true,
		isNonstandard: null,
	},
	ragefist: {
		inherit: true,
		basePowerCallback(pokemon) {
			return Math.min(350, 50 + 25 * pokemon.timesAttacked);
		},
		shortDesc: '+50 power for each time user was hit. Max 6 hits.',
		desc: 'Power is equal to 50+(X*25), where X is the total number of times the user has been hit by a damaging attack during the battle, even if the user did not lose HP from the attack. X cannot be greater than 6 and does not reset upon switching out or fainting. Each hit of a multi-hit attack is counted, but confusion damage is not counted.',
	},
	snaptrap: {
		inherit: true,
		isNonstandard: null,
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
		isNonstandard: null,
		accuracy: 90,
		basePower: 40,
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
		isNonstandard: null,
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
		desc: 'Frostbites the target.',
	},

};
