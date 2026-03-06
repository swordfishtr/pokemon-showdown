// https://github.com/smogon/pokemon-showdown/issues/8491#issuecomment-939298131
// Last updated: June 9th, 2025. Reason: update script to conform to linter changes..
'use strict';

const { PRNG } = require('../../dist/sim');
const assert = require('./../assert');
const common = require('./../common');

let battle;

describe('Stone Edge', () => {
	afterEach(() => {
		battle.destroy();
	});

	it('should hit 80% of the time', () => {
		battle = common.createBattle({
			formatid: 'gen9ndgenerationsdraftgen4',
			// Override the default seed used for tests
			// Normally using the same seed for tests is fine, as we want tests to always
			// give the same result for a given seed. However, for this we want to test the hit %
			// so we need to give a different seed each time like an actual battle
			seed: PRNG.generateSeed(),
		});
		// Weak stone edge user to not KO the target
		battle.setPlayer('p1', { team: [{ species: "Gible", level: 5, ability: 'sandveil', item: '', moves: ['stoneedge'] }] });
		// Strong target that wont do anything but soak hits
		battle.setPlayer('p2', { team: [{ species: "Chansey", ability: 'naturalcure', item: 'eviolite', moves: ['splash'] }] });

		// Number of times stone edge has hit
		let hits = 0;
		// Number of turns to play, 1000 goes over the 1000 turn limit hence 999
		const rolls = 999;

		// Repeat the following block of code (the area indented more than this line) 999 times
		for (let i = 1; i <= rolls; i++) {
			// Auto will choose the only options available: stone edge for gible and splash for chansey
			battle.makeChoices('auto', 'auto');
			// After the turn completes, check if stone edge hit (chansey lost HP)
			if (battle.p2.active[0].hp < battle.p2.active[0].maxhp) {
				// If so increase the hit counter
				hits++;
				// And restore chansey's HP so its not eventually KOed
				battle.p2.active[0].hp = battle.p2.active[0].maxhp;
			} // If the move missed, we do NOT increment the hit counter.

			// Regardless of if the move hit or missed, restore PP for both mon's moves so neither end up struggling
			battle.p2.active[0].moveSlots[0].pp = battle.p2.active[0].moveSlots[0].maxpp;
			battle.p1.active[0].moveSlots[0].pp = battle.p1.active[0].moveSlots[0].maxpp;
		}

		// Number of hits as a percentage
		const hitRatio = hits / rolls;
		// multiply by 100 for proper display
		console.log("Stone Edge hit " + (hitRatio * 100) + "% of the time.");
		// Actual test assertion, test fails if stone edge hits less than 75% of the time or more than 85% of the time
		// The reason for the buffer is simple: 100 uses wont always mean 80 hits and 20 misses, thats not how probability
		// works when the odds do not change each time you perform the check.
		assert.equal(hitRatio >= 0.75 && hitRatio <= 0.85, true);
	});
});
