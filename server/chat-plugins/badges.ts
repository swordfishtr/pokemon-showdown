/**
 * Generations Badges
 * 
 * This is a replacement of `chat-plugins/seasons.ts` that better suits our need for prizes.
 * Badges are in terms of prestige somewhere between a custom avatar and prize winner status.
 * The limit of 3 badges is removed, and our client is tweaked accordingly.
 * 
 * @license GPL-3.0-or-later
 */

import { FS, Utils } from "../../lib";

/** config/badges.json */
interface BHConfig {
	[userid: IDEntry]: Badge[],
}

interface Badge {
	sprite: string,
	timestamp: number,
	description: string, // Display on mouse over.
}

const BH = new class BadgeHandler {

	static readonly path = FS('config/badges.json');

	private readonly badges = (() => {
		const cfg = BadgeHandler.path.readIfExistsSync();
		return (cfg ? JSON.parse(cfg) : {}) as BHConfig;
	})();

	private write() {
		BadgeHandler.path.writeUpdate(() => JSON.stringify(this.badges));
	}

	listAll() {
		return structuredClone(this.badges);
	}

	listUser(userid: ID) {
		if(!(userid in this.badges)) return [];
		return structuredClone(this.badges[userid]);
	}

	add(userid: ID, badge: Badge) {
		this.badges[userid] ??= [];
		this.badges[userid].push(badge);
		this.write();
		return null;
	}

	remove(userid: ID, index: number) {
		if(!(userid in this.badges)) return `User ${userid} doesn't have any badges.`;
		if(!this.badges[userid][index]) return `User ${userid} doesn't have a badge at index ${index}.`;
		this.badges[userid].splice(index, 1);
		if(!this.badges[userid].length) delete this.badges[userid];
		this.write();
		return null;
	}

};

export const commands: Chat.ChatCommands = {
	badges: {
		list(target, room, user, connection, cmd, message) {
			const userid = toID(target);
			if(userid) {
				let buf = `[Badges] Badge details of ${userid}:\n`;
				buf += BH.listUser(userid)
				.map((badge, index) => `${index}: ${badge.sprite} ${badge.timestamp} ${badge.description}`)
				.join('\n') || 'None';
				return this.sendReply(buf);
			}
			let buf = '[Badges] Badgeholders: (for details use /badges list [username])\n';
			buf += Object.entries(BH.listAll())
			.map(([userid, badges]) => `${userid}: ${(badges as Badge[]).map((badge) => badge.sprite).join(', ')}`)
			.join('\n') || 'None';
			return this.sendReply(buf);
		},
		add(target, room, user, connection, cmd, message) {
			this.checkCan('disableladder');

			const [username, sprite, description] = Utils.splitFirst(target, ',', 2);
			const userid = toID(username);

			if(!userid) {
				this.errorReply(`[Badges] Failure: ${username} is not a username.`);
				return;
			}

			const result = BH.add(userid, {
				sprite: toID(sprite),
				timestamp: Math.floor(Date.now() / 1000),
				description: description.trim(),
			});

			if(result) {
				this.errorReply(`[Badges] Failure: ${result}`);
				return;
			}

			this.sendReply('[Badges] Success!');
		},
		remove(target, room, user, connection, cmd, message) {
			this.checkCan('disableladder');

			const [username, indexstr] = Utils.splitFirst(target, ',');
			const userid = toID(username);
			const index = Number(indexstr);

			if(!userid) {
				this.errorReply(`[Badges] Failure: ${username} is not a username.`);
				return;
			}
			if(Number.isNaN(index)) {
				this.errorReply(`[Badges] Failure: ${indexstr} is not a number.`);
				return;
			}

			const result = BH.remove(userid, index);

			if(result) {
				this.errorReply(`[Badges] Failure: ${result}`);
				return;
			}

			this.sendReply('[Badges] Success!');
		},
	},
	badgeshelp: [
		'Badges help goes here',
		'/badges list [username?] - Lists all badgeholders or details of the specified one.',
	],
};

export const handlers: Chat.Handlers = {
	onBattleStart(user, room) {
		if (!room.battle) return;

		// approach: we should avoid crashing vanilla clients, so keep it in original shape:
		// room.add(`|badge|${slot}|${badge.type}|${badge.format}|${BADGE_THRESHOLDS[badge.type]}-${data.current.season}`);
		// the last 3 entries must exist, and can hold any info we want. it's also safe to add more entries.

		// current protocol: |badge|slot|sprite|timestamp|description

		const badges = BH.listUser(user.id);
		if (!badges.length) return;
		const slot = room.battle.playerTable[user.id]?.slot;
		if (!slot) return;

		for (const badge of badges) {
			room.add(`|badge|${slot}|${badge.sprite}|${badge.timestamp}|${badge.description}`);
		}

		room.update();
	},
};
