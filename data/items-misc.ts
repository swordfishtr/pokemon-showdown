export const Items: import('../sim/dex-items').ItemMiscDataTable = {
	absorbbulb: {
		clauseData: {
			canStatBoost: {
				spa: true,
			},
		},
	},
	adrenalineorb: {
		clauseData: {
			canStatBoost: {
				spe: true,
			},
		},
	},
	apicotberry: {
		clauseData: {
			canStatBoost: {
				spd: true,
			},
		},
	},
	blunderpolicy: {
		clauseData: {
			canStatBoost: {
				spe: true,
			},
		},
	},
	cellbattery: {
		clauseData: {
			canStatBoost: {
				atk: true,
			},
		},
	},
	electricseed: {
		clauseData: {
			canStatBoost: {
				def: true,
			},
		},
	},
	ganlonberry: {
		clauseData: {
			canStatBoost: {
				def: true,
			},
		},
	},
	grassyseed: {
		clauseData: {
			canStatBoost: {
				def: true,
			},
		},
	},
	keeberry: {
		clauseData: {
			canStatBoost: {
				def: true,
			},
		},
	},
	lansatberry: {
		clauseData: {
			canStatBoost: {
				crit: true,
			},
		},
	},
	liechiberry: {
		clauseData: {
			canStatBoost: {
				atk: true,
			},
		},
	},
	luminousmoss: {
		clauseData: {
			canStatBoost: {
				spd: true,
			},
		},
	},
	marangaberry: {
		clauseData: {
			canStatBoost: {
				spd: true,
			},
		},
	},
	mirrorherb: {
		clauseData: {
			canStatBoost: {
				accuracy: true,
				atk: true,
				def: true,
				evasion: true,
				spa: true,
				spd: true,
				spe: true,
			},
		},
	},
	mistyseed: {
		clauseData: {
			canStatBoost: {
				spd: true,
			},
		},
	},
	petayaberry: {
		clauseData: {
			canStatBoost: {
				spa: true,
			},
		},
	},
	psychicseed: {
		clauseData: {
			canStatBoost: {
				spd: true,
			},
		},
	},
	salacberry: {
		clauseData: {
			canStatBoost: {
				spe: true,
			},
		},
	},
	snowball: {
		clauseData: {
			canStatBoost: {
				atk: true,
			},
		},
	},
	starfberry: {
		clauseData: {
			canStatBoost: {
				atk: true,
				def: true,
				spa: true,
				spd: true,
				spe: true,
			},
		},
	},
	throatspray: {
		clauseData: {
			canStatBoost(set) {
				const canUse = set.moves.some(x => this.dex.moves.get(this.toID(x)).flags.sound);
				if (canUse) return { spa: true };
			},
		},
	},
	weaknesspolicy: {
		clauseData: {
			canStatBoost: {
				atk: true,
				spa: true,
			},
		},
	},
	berserkgene: {
		clauseData: {
			canStatBoost: {
				atk: true,
			},
		},
	},
};
