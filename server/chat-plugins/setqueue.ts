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
