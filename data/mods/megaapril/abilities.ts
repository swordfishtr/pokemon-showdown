export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
	johning: {
		name: 'Johning?',
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

		// Truant + Auto Swagger (like Intimidate) + 67 rule
		onStart(pokemon) {
			pokemon.removeVolatile('truant');

			let activated = false;
			for (const target of pokemon.adjacentFoes()) {
				if (!activated) {
					this.add('-ability', pokemon, 'Johning?', 'boost');
					activated = true;
				}
				if (target.volatiles['substitute']) {
					this.add('-immune', target);
				} else {
					this.boost({ atk: 2 }, target, pokemon, null, true);
					target.addVolatile('confusion', pokemon);
				}
			}

			if (Object.values(pokemon.baseStoredStats).some(x => x.toString(10).endsWith('67'))) {
				this.add('-message', `67 rule activated for ${pokemon.name}.`);
				const newSpecies = this.dex.deepClone(pokemon.species);
				newSpecies.baseStats.hp = 35;
				newSpecies.baseStats.spe = 235;
				// so all HP-related properties get re-initialized in setSpecies
				// (thx chimera1v1)
				pokemon.maxhp = 0;
				pokemon.setSpecies(newSpecies, null);
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

		// Unseen Fist + Mold Breaker
		onModifyMove(move) {
			if (move.flags['contact']) delete move.flags['protect'];
			move.ignoreAbility = true;
		},

		// Technician
		onBasePowerPriority: 30,
		onBasePower(basePower, attacker, defender, move) {
			const basePowerAfterMultiplier = this.modify(basePower, this.event.modifier);
			this.debug(`Base Power: ${basePowerAfterMultiplier}`);
			if (basePowerAfterMultiplier <= 60) {
				this.debug('Technician boost');
				return this.chainModify(1.5);
			}
		},

		// Prevent skipping Mega turn because of Truant
		onAfterMega(pokemon) {
			pokemon.removeVolatile('truant');
		},
		
		condition: {},
		shortDesc: 'Traunt + Unseen Fist + Mold Breaker + Huge Power x2 + Technician + Regenerator + Swagger opponent on switch in.',
		desc: 'Traunt + Unseen Fist + Mold Breaker + Huge Power x2 + Technician + Regenerator + Swagger opponent on switch in.',
	},
};
