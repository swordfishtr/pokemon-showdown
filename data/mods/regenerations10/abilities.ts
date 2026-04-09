export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {

	// Edits

	pickpocket: {
		inherit: true,
		onAfterMoveSecondarySelf(source, target, move) {
			if (!move || source.switchFlag === true || !move.hitTargets || source.item || source.volatiles['gem'] ||
				move.category === 'Status' || !move.flags['contact']) return;
			const hitTargets = move.hitTargets;
			this.speedSort(hitTargets);
			for (const pokemon of hitTargets) {
				if (pokemon !== source) {
					const yourItem = pokemon.takeItem(source);
					if (!yourItem) continue;
					if (!source.setItem(yourItem)) {
						pokemon.item = yourItem.id; // bypass setItem so we don't break choicelock or anything
						continue;
					}
					this.add('-item', source, yourItem, '[from] ability: Pickpocket', `[of] ${pokemon}`);
					return;
				}
			}
		},
	},
	tanglinghair: {
		inherit: true,
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target, true)) {
				this.add('-ability', target, 'Tangling Hair');
				source.addVolatile('trapped', target, move, 'trapper');
			}
		},
		onSourceDamagingHit(damage, target, source, move) {
			// Despite not being a secondary, Shield Dust / Covert Cloak block Poison Touch's effect
			if (target.hasAbility('shielddust') || target.hasItem('covertcloak')) return;
			if (this.checkMoveMakesContact(move, source, target)) {
				this.add('-ability', source, 'Tangling Hair');
				target.addVolatile('trapped', source, move, 'trapper');
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
		desc: 'This Pokemons sound-based moves become Ice type.',
	},

};
