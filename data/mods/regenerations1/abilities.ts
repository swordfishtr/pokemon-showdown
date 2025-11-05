export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {

	// Edits

	tanglinghair: {
		inherit: true,
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target, true)) {
				this.add('-ability', target, 'Tangling Hair');
				this.hint(`${source.name} is caught in ${target.name}'s Tangling Hair!`);
				const isTrapped = source.addVolatile('trapped', target, move, 'trapper');
				this.hint(`${source.name} should be ${isTrapped ? '' : 'not '}trapped.`);
			}
		},
		onSourceDamagingHit(damage, target, source, move) {
			// Despite not being a secondary, Shield Dust / Covert Cloak block Poison Touch's effect
			if (target.hasAbility('shielddust') || target.hasItem('covertcloak')) return;
			if (this.checkMoveMakesContact(move, source, target)) {
				this.add('-ability', source, 'Tangling Hair');
				this.hint(`${target.name} is caught in ${source.name}'s Tangling Hair!`);
				const isTrapped = target.addVolatile('trapped', source, move, 'trapper');
				this.hint(`${target.name} should be ${isTrapped ? '' : 'not '}trapped.`);
			}
		},
	},

	// Drowsy implementation

	effectspore: {
		inherit: true,
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target) && !source.status && source.runStatusImmunity('powder')) {
				const r = this.random(100);
				if (r < 11) {
					source.addVolatile('yawn', source);
				} else if (r < 21) {
					source.setStatus('par', target);
				} else if (r < 30) {
					source.setStatus('psn', target);
				}
			}
		},
	},

	// Additions

	cryoresonance: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			if (move.flags['sound'] && !pokemon.volatiles['dynamax']) { // hardcode
				move.type = 'Ice';
			}
		},
		flags: {},
		name: "Cryoresonance",
		num: -6000,
		shortDesc: 'This Pokemons sound-based moves become Ice type.',
		desc: 'blank',
	},

};
