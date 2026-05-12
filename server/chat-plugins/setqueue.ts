/**
 /setqueue [player1],[player2],[message],[format?]
 adds [player1, player2, message, optional format] to an in-memory queue
 when those two players start a battle with each other, if the optional
 format matches (or no format was provided), the plugin will send the
 banner into the battle room (same behavior as /setmode)
 requires driver+
 */

export interface QueueEntry {
	p1: ID;
	p2: ID;
	message: string;
	format?: string;
	addedBy: string;
	addedAt: number;
	addedRoom: RoomID;
}

const queue: QueueEntry[] = [];

export const commands: Chat.ChatCommands = {
	setqueue(target, room, user) {
		room = this.requireRoom();

		const directRank = room.auth.getDirect(user.id);
		const globalRank = Users.globalAuth.get(user.id);
		if (!(Users.Auth.atLeast(directRank || '', '%') || Users.Auth.atLeast(globalRank || '', '%'))) {
			throw new Chat.ErrorMessage(
				`Access denied - you must be a driver (%) or higher in this room (or globally) to use this command.`
			);
		}

		if (!target) return this.parse('/help setqueue');

		const parts = target.split(',').map(s => s.trim()).filter(Boolean);
		if (parts.length < 3) {
			throw new Chat.ErrorMessage(`Usage: /setqueue player1,player2,message[,format]`);
		}

		const p1 = toID(parts[0]);
		const p2 = toID(parts[1]);
		if (!p1 || !p2) {
			throw new Chat.ErrorMessage(`You must provide two player names/ids.`);
		}

		const message = parts[2];
		const format = parts[3] ? parts[3].trim() : undefined;

		queue.push({
			p1,
			p2,
			message,
			format,
			addedBy: user.id,
			addedAt: Date.now(),
			addedRoom: room.roomid,
		});

		this.globalModlog(`SETQUEUE`, null, target);
		this.sendReply(`Queue added for ${p1} and ${p2} with banner ${message}`);
		
	},
	setqueuehelp: [
		`/setqueue player1,player2,message[,format] - Adds a queue entry so that when player1 and player2 start a battle together the server will add the banner message to the battle room. If format is provided, the banner is added only if the battle format matches. Requires: driver (%) in the room.`,
	],

	/**
	 /setmode [text] - send a `|rated|...` banner into the current battle room
	 requires driver+
	*/
	setmode(target, room, user) {
		room = this.requireRoom();
		if (!room.battle) {
			throw new Chat.ErrorMessage(`/setmode must be used in a battle room.`);
		}

		const directRank = room.auth.getDirect(user.id);
		const globalRank = Users.globalAuth.get(user.id);
		if (!(Users.Auth.atLeast(directRank || '', '%') || Users.Auth.atLeast(globalRank || '', '%'))) {
			throw new Chat.ErrorMessage(`Access denied - you must be a driver (%) or higher in this room (or globally) to use this command.`);
		}

		if (!target) return this.parse('/help setmode');

		let message = target.trim();
		if (!message.startsWith('|')) {
			message = `|rated|${message}`;
		}

		room.add(message).update();

		this.privateModAction(`${user.name} used /setmode ${target}`);
		this.globalModlog(`SETMODE`, null, target);
	},
	setmodehelp: [
		`/setmode [text] - Adds the given text as a banner in the current battle room. Provide plain text and, it will be sent as \`|rated|<text>\`. Requires: driver (%) or higher in the room or globally.`,
	],
	setqueuelist(target, room, user) {
		const globalRank = Users.globalAuth.get(user.id);
		if (!Users.Auth.atLeast(globalRank || '', '%')) {
			throw new Chat.ErrorMessage(
				`Access denied - you must be a global driver (%) or higher to use this command.`
			);
		}

		if (queue.length === 0) {
			return this.sendReply(`The queue is empty.`);
		}

		const filtered = target ? queue.filter(entry => {
			const targetId = toID(target);
			return entry.p1 === targetId || entry.p2 === targetId;
		}) : queue;

		if (filtered.length === 0) {
			return this.sendReply(`No queue entries found for ${target}.`);
		}

		let output = `|c|&|${filtered.length} queue ${filtered.length === 1 ? 'entry' : 'entries'}:\n`;
		for (const entry of filtered) {
			const formatStr = entry.format ? ` [${entry.format}]` : '';
			const addedTime = new Date(entry.addedAt).toLocaleString();
			output += `${entry.p1} vs ${entry.p2}${formatStr} - "${entry.message}" (added by ${entry.addedBy} at ${addedTime})\n`;
		}

		return this.sendReply(output);
	},
	setqueuelisthelp: [
		`/setqueuelist [player] - Shows all queued entries, optionally filtered by a specific player. Requires: global driver (%) or higher.`,
	],
};

export const handlers: Chat.Handlers = {
	onBattleStart(user, room) {
		if (!room.battle) return;
		const battle = room.battle;
		if (!battle.p1 || !battle.p2) return;

		const p1id = toID(battle.p1.id);
		const p2id = toID(battle.p2.id);

		for (let i = 0; i < queue.length; i++) {
			const entry = queue[i];
			const playersMatch =
				(entry.p1 === p1id && entry.p2 === p2id) || (entry.p1 === p2id && entry.p2 === p1id);
			if (!playersMatch) continue;

			if (entry.format) {
				const entryFormatId = toID(entry.format);
				const battleFormatId = toID(battle.format);
				const battleFormatNameId = toID(Dex.formats.get(battle.format).name);

				if (entryFormatId !== battleFormatId && entryFormatId !== battleFormatNameId) {
					continue;
				}
			}

			let message = entry.message.trim();
			if (!message.startsWith('|')) {
				message = `|rated|${message}`;
			}
			try {
				room.add(message).update();
			} catch (e) {
			}

			queue.splice(i, 1);
			break;
		}
	},
};
