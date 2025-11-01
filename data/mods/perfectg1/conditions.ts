export const Conditions: import('../../../sim/dex-conditions').ModdedConditionDataTable = {

	// Frostbite
	frz: {
		name: 'frz',
		effectType: 'Status',
		onStart(target, source, sourceEffect) {
			if (sourceEffect && sourceEffect.effectType === 'Ability') {
				this.add('-status', target, 'frb', '[from] ability: ' + sourceEffect.name, `[of] ${source}`);
			} else {
				this.add('-status', target, 'frb');
			}
			if (target.species.name === 'Shaymin-Sky' && target.baseSpecies.baseSpecies === 'Shaymin') {
				target.formeChange('Shaymin', this.effect, true);
			}
		},
		// Damage reduction is handled directly in the sim/battle.js damage function
		onResidualOrder: 10,
		onResidual(pokemon) {
			this.damage(pokemon.baseMaxhp / 16);
		},
		onModifyMove(move, pokemon) {
			if (move.flags['defrost']) {
				this.add('-curestatus', pokemon, 'frb', `[from] move: ${move}`);
				pokemon.clearStatus();
			}
		},
		onAfterMoveSecondary(target, source, move) {
			if (move.thawsTarget) {
				target.cureStatus();
			}
		},
		onDamagingHit(damage, target, source, move) {
			if (move.type === 'Fire' && move.category !== 'Status' && move.id !== 'polarflare') {
				target.cureStatus();
			}
		},
	},

	// No full para; +20% super effective damage taken.
	par: {
		name: 'par',
		effectType: 'Status',
		onStart(target, source, sourceEffect) {
			if (sourceEffect && sourceEffect.effectType === 'Ability') {
				this.add('-status', target, 'par', '[from] ability: ' + sourceEffect.name, `[of] ${source}`);
			} else {
				this.add('-status', target, 'par');
			}
		},
		onModifySpePriority: -101,
		onModifySpe(spe, pokemon) {
			// Paralysis occurs after all other Speed modifiers, so evaluate all modifiers up to this point first
			spe = this.finalModify(spe);
			if (!pokemon.hasAbility('quickfeet')) {
				spe = Math.floor(spe * 50 / 100);
			}
			return spe;
		},
		onSourceModifyDamage(relayVar, source, target, move) {
			if (move && source.getMoveHitData(move).typeMod > 0) {
				return this.chainModify([4915, 4096]);
			}
		},
	},

	// Drowsy (mostly implemented in moves.ts)
	yawn: {
		noCopy: true, // doesn't get copied by Baton Pass
		duration: 2,
		onStart(target, source) {
			if (target.status || !target.runStatusImmunity('slp')) {
				return false;
			}
			this.add('-start', target, 'move: Yawn', `[of] ${source}`);
		},
		onResidualOrder: 23,
		onEnd(target) {
			this.add('-end', target, 'move: Yawn', '[silent]');
			target.trySetStatus('slp', this.effectState.source);
		},
	},

};