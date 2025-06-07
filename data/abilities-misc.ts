export const Abilities: import('../sim/dex-abilities').AbilityMiscDataTable = {
	angerpoint: {
		clauseData: {
			canStatBoost: {
				atk: true,
			},
		},
	},
	angershell: {
		clauseData: {
			canStatBoost: {
				atk: true,
				spa: true,
				spe: true,
			},
		},
	},
	asoneglastrier: {
		clauseData: {
			canStatBoost: {
				atk: true,
			},
		},
	},
	asonespectrier: {
		clauseData: {
			canStatBoost: {
				spa: true,
			},
		},
	},
	battlebond: {
		clauseData: {
			canStatBoost(set) {
				if (set.species === 'Greninja-Bond') return {
					atk: true,
					spa: true,
					spe: true,
				};
			},
		},
	},
	beastboost: {
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
	berserk: {
		clauseData: {
			canStatBoost: {
				spa: true,
			},
		},
	},
	chillingneigh: {
		clauseData: {
			canStatBoost: {
				atk: true,
			},
		},
	},
	competitive: {
		clauseData: {
			canStatBoost: {
				spa: true,
			},
		},
	},
	contrary: {
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
	dancer: {
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
	dauntlessshield: {
		clauseData: {
			canStatBoost: {
				def: true,
			},
		},
	},
	defiant: {
		clauseData: {
			canStatBoost: {
				atk: true,
			},
		},
	},
	download: {
		clauseData: {
			canStatBoost: {
				atk: true,
				spa: true,
			},
		},
	},
	embodyaspectcornerstone: {
		clauseData: {
			canStatBoost: {
				def: true,
			},
		},
	},
	embodyaspecthearthflame: {
		clauseData: {
			canStatBoost: {
				atk: true,
			},
		},
	},
	embodyaspectteal: {
		clauseData: {
			canStatBoost: {
				spe: true,
			},
		},
	},
	embodyaspectwellspring: {
		clauseData: {
			canStatBoost: {
				spd: true,
			},
		},
	},
	grimneigh: {
		clauseData: {
			canStatBoost: {
				spa: true,
			},
		},
	},
	guarddog: {
		clauseData: {
			canStatBoost: {
				atk: true,
			},
		},
	},
	intrepidsword: {
		clauseData: {
			canStatBoost: {
				atk: true,
			},
		},
	},
	justified: {
		clauseData: {
			canStatBoost: {
				atk: true,
			},
		},
	},
	lightningrod: {
		clauseData: {
			canStatBoost: {
				spa: true,
			},
		},
	},
	magician: {
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
	moody: {
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
	motordrive: {
		clauseData: {
			canStatBoost: {
				spe: true,
			},
		},
	},
	moxie: {
		clauseData: {
			canStatBoost: {
				atk: true,
			},
		},
	},
	opportunist: {
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
	pickpocket: {
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
	pickup: {
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
	rattled: {
		clauseData: {
			canStatBoost: {
				spe: true,
			},
		},
	},
	sapsipper: {
		clauseData: {
			canStatBoost: {
				atk: true,
			},
		},
	},
	soulheart: {
		clauseData: {
			canStatBoost: {
				spa: true,
			},
		},
	},
	speedboost: {
		clauseData: {
			canStatBoost: {
				spe: true,
			},
		},
	},
	stamina: {
		clauseData: {
			canStatBoost: {
				def: true,
			},
		},
	},
	steadfast: {
		clauseData: {
			canStatBoost: {
				spe: true,
			},
		},
	},
	steamengine: {
		clauseData: {
			canStatBoost: {
				spe: true,
			},
		},
	},
	stormdrain: {
		clauseData: {
			canStatBoost: {
				spa: true,
			},
		},
	},
	thermalexchange: {
		clauseData: {
			canStatBoost: {
				atk: true,
			},
		},
	},
	trace: {
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
	wanderingspirit: {
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
	watercompaction: {
		clauseData: {
			canStatBoost: {
				def: true,
			},
		},
	},
	weakarmor: {
		clauseData: {
			canStatBoost: {
				spe: true,
			},
		},
	},
	wellbakedbody: {
		clauseData: {
			canStatBoost: {
				def: true,
			},
		},
	},
	windrider: {
		clauseData: {
			canStatBoost: {
				atk: true,
			},
		},
	},
};
