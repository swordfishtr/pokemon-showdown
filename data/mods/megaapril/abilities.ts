export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
	alcoholic: {
		name: 'Alcoholic',
		num: -6000,
		flags: {},

		// Regenerator
		onSwitchOut(pokemon) {
			pokemon.heal(pokemon.baseMaxhp / 3);
		},

		// Double Huge Power
		onModifyAtkPriority: 5,
		onModifyAtk(atk) {
			return this.chainModify(4);
		},

		// Truant, Auto Swagger (like Intimidate)
		onStart(pokemon) {
			pokemon.removeVolatile('truant');
			if (pokemon.activeTurns && (pokemon.moveThisTurnResult !== undefined || !this.queue.willMove(pokemon))) {
				pokemon.addVolatile('truant');
			}

			let activated = false;
			for (const target of pokemon.adjacentFoes()) {
				if (!activated) {
					this.add('-ability', pokemon, 'Alcoholic', 'boost');
					activated = true;
				}
				if (target.volatiles['substitute']) {
					this.add('-immune', target);
				} else {
					this.boost({ atk: 2 }, target, pokemon, null, true);
					target.addVolatile('confusion');
				}
			}
		},
		onBeforeMovePriority: 9,
		onBeforeMove(pokemon) {
			if (pokemon.removeVolatile('truant')) {
				this.add('cant', pokemon, 'ability: Truant');
				return false;
			}
			pokemon.addVolatile('truant');
		},
		condition: {},
		shortDesc: 'Traunt + Regenerator + Huge Power + Huge Power + Swagger opponent on switch in.',
		desc: 'Traunt + Regenerator + Huge Power + Huge Power + Swagger opponent on switch in.',
	},
};
