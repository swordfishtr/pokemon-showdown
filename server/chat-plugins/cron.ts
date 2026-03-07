/**
 * Cron-like timer for Generations
 */

import { FS, Utils } from "../../lib";
import { Auth } from "../user-groups";

const INTERVAL = 60 * 1000;

/** A scheduled event */
interface CronEvent {
	timestamp: number, // Showdown style (Unix epoch in seconds)
	actionname: keyof typeof actions;
	userid: ID, // Issuer of the command
	roomid: RoomID, // Room of the issuer
	input: string,
	fulfilled?: true,
}

/** An action to take at the scheduled time */
interface CronAction {
	help: string[],
	/** Sanitize input and check user authority. throw if invalid. */
	validate: (this: Chat.CommandContext, input: string) => (string | void),
	execute: (this: Room, input: string) => any,
}

const actions = {

	// First stop for debugging cron.
	send_chat_message: {
		help: [
			'/cron add send_chat_message, [date], [full message] - Logs message as plain text in current room.',
		],
		validate(input) {
			this.checkChat();
			input = input.trim();
			if (!input) {
				throw new Error('Input must be a non-empty message.');
			}
			return `${this.user.name},${input}`;
		},
		execute(input) {
			const [user, text] = Utils.splitFirst(input, ',');
			this.add(`[cron] ${(new Date()).toUTCString()} ${user}: ${text}`).update();
		},
	},

	// Generations has new prize winners frequently, so we automate their demotion.
	demote_prize_winner: {
		help: [
			'/cron add demote_prize_winner, [date], [username], [next rank?] - Sets username room auth to next rank or none.',
		],
		validate(input) {
			this.checkCan('roomprizewinner', null, this.room!);
			const [user, nextRank] = Utils.splitFirst(input, ',').map((x) => x.trim());
			const userid = toID(user);
			if (!userid) {
				throw new Error('Invalid user.');
			}
			if (nextRank && !Auth.isValidSymbol(nextRank)) {
				throw new Error('Invalid rank.');
			}
			return `${userid},${nextRank}`;
		},
		execute(input) {
			const [user, nextRank] = input.split(',');
			if (nextRank) {
				this.auth.set(user as ID, nextRank as GroupSymbol);
			}
			else {
				this.auth.delete(user as ID);
			}
		},
	},

	// Added for 35PL - tryout tours
	roomtour: {
		help: [
			'/cron add roomtour, [date], [format], [generator], [mod], [name] - Starts a tournament in the current room.',
			'Generator is one of: elimination, roundrobin. Mod is one of: 1 (for single elim), 2 (for double elim).'
		],
		validate(input) {
			const room = this.requireRoom();
			this.checkCan('tournaments', null, room);
			const [format, generator, mod, name] = Utils.splitFirst(input, ',', 4).map((x) => x.trim());
			if (!Dex.formats.get(format).exists) {
				throw new Error('Invalid format.');
			}
			if (!['elimination', 'elim', 'roundrobin', 'rr'].includes(generator)) {
				throw new Error('Generator must be one of: elimination, roundrobin.');
			}
			if (!['1', '2'].includes(mod)) {
				throw new Error('Generator mod must be one of: 1 (for single elim), 2 (for double elim).');
			}
			const validated = `${format},${generator},${mod},${name}`;
			this.globalModlog('CRON ROOMTOUR', null, validated);
			return validated;
		},
		execute(input) {
			const [format, generator, mod, name] = input.split(',');
			this.add(`[cron] Attempting to start a ${format} tournament.`).update();
			Tournaments.createTournament(this, format, generator, undefined, false, mod, name);
		},
	},

} as const satisfies Record<Lowercase<string>, CronAction>;

const cron = new class {
	
	readonly path = FS('config/cron.json');

	events: CronEvent[] = (() => {
		const cfg = this.path.readIfExistsSync();
		return cfg ? JSON.parse(cfg) : [];
	})();

	readonly timer = setInterval(() => {
		const now = Math.floor(Date.now() / 1000);
		let save = false;
		for (const event of this.events) {
			if (now > event.timestamp) {
				event.fulfilled = true;
				save = true;
				try {
					const room = Rooms.get(event.roomid);
					if(!room) throw new Error(`[cron] ${now}: Invalid room ${event.roomid}`);
					actions[event.actionname].execute.call(room, event.input);
				}
				catch (error: any) {
					// TODO: let it crash
					console.log(`[cron] ${error?.message}`);
				}
			}
		}
		if (save) {
			this.events = this.events.filter((event) => !event.fulfilled);
			this.save();
		}
	}, INTERVAL);

	save() {
		this.path.writeUpdate(() => JSON.stringify(this.events));
	}

}

export const destroy = () => clearInterval(cron.timer);

export const commands: Chat.ChatCommands = {

	cron: {

		''(target, room, user, connection, cmd, message) {
			return this.parse('/help cron');
		},

		list(target, room, user, connection, cmd, message) {
			this.sendReply(cron.events.map((event, i) => [
				`=== ${i + 1}. ===`,
				`date: ${(new Date(event.timestamp * 1000)).toUTCString()}`,
				`action: ${event.actionname}`,
				`user: ${event.userid}`,
				`room: ${event.roomid}`,
				`input: ${event.input}`,
			].join('\n')).join('\n') || '[cron] No events.');
		},

		add(target, room, user, connection, cmd, message) {
			room = this.requireRoom();

			const [action, date, input] = Utils.splitFirst(target, ',', 2).map((x) => x.trim());

			const isValidAction = (action: string): action is keyof typeof actions => (action in actions);

			if (!isValidAction(action)) {
				this.errorReply('[cron] Usage: /cron add [action], [date], [input]');
				this.sendReply(`Actions: ${Object.keys(actions).join(', ')}`);
				return;
			}

			let timestamp: number;
			if (date.startsWith('+')) {
				const minutes = parseInt(date);
				timestamp = minutes * 60 + Date.now() / 1000;
			}
			else if (/^\d+$/.test(date)) {
				timestamp = parseInt(date);
			}
			else {
				timestamp = (new Date(`${date}Z`)).getTime() / 1000;
			}
			if (Number.isNaN(timestamp)) {
				this.errorReply(`[cron] Input date ${date} is invalid. Must be a valid HTML datetime-local value or a Showdown style Unix time.`);
			}

			let validatedInput = '';

			try {
				validatedInput = actions[action].validate.call(this, input) ?? input;
			}
			catch (error: any) {
				this.errorReply(`[cron] ${error?.message}`);
				this.sendReply(actions[action].help.join('\n'));
				return;
			}

			const event: CronEvent = {
				timestamp,
				actionname: action,
				userid: user.id,
				roomid: room.roomid,
				input: validatedInput,
			};

			cron.events.push(event);
			cron.save();
			this.sendReply(`[cron] Success!`);
		},

		remove(target, room, user, connection, cmd, message) {
			this.checkCan('bypassall', null);

			if (target.endsWith('.')) target = target.slice(0, -1);

			if (target === '') {
				this.errorReply('[cron] Usage: /cron remove [index]');
				return this.parse('/cron list');
			}

			const index = parseInt(target) - 1;
			if (!(index >= 0) || !cron.events[index]) {
				this.errorReply('[cron] Index must be a valid index number.');
				return this.parse('/cron list');
			}

			cron.events.splice(index, 1);
			cron.save();
			this.sendReply(`[cron] Success!`);
		},

		roomsettings: {

			autodemoteprizewinner(target, room, user, connection, cmd, message) {
				room = this.requireRoom();
				this.checkCan('declare', null, room);
				let num = parseInt(target);
				if (this.meansNo(target)) num = 0;
				if (isNaN(num) || num > 12 || num < 0) {
					return this.parse('/help cron');
				}

				if (num >= 1) {
					if (room.settings.autoDemotePrizeWinner === num) {
						throw new Chat.ErrorMessage(`Automatic demotion of Prize Winners is already set to ${num} ${num === 1 ? 'month' : 'months'} later.`);
					}
					room.settings.autoDemotePrizeWinner = num;
					room.saveSettings();
					this.privateModAction(`Automatic demotion of Prize Winners was set to ${num} months later by ${user.name}.`);
					this.modlog('ROOM SETTINGS', null, `auto-demote prize winner: ${num} ${num === 1 ? 'month' : 'months'} later`);
				} else {
					if (!room.settings.autoDemotePrizeWinner) {
						throw new Chat.ErrorMessage(`Automatic demotion of Prize Winners is already disabled.`);
					}
					delete room.settings.autoDemotePrizeWinner;
					room.saveSettings();
					this.privateModAction(`Automatic demotion of Prize Winners was turned off by ${user.name}.`);
					this.modlog('ROOM SETTINGS', null, `auto-demote prize winner: off`);
				}
			},

		},

	},

	cronhelp: [
		'/cron list - Shows an ordered list of scheduled events.',
		'/cron add - Pulls up a form to schedule an event.', // client-side feature
		'/cron remove [index] - Cancel a scheduled event (see list).',
	],

};

// These are exposed to room authority in /roomsettings
export const roomSettings: Chat.SettingsHandler[] = [
	room => ({
		label: "Cron auto-demote Room Prize Winners (in months)",
		permission: "editroom",
		options: ['off', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
			setting => (
				[
					`${setting}`,
					setting === (room.settings.autoDemotePrizeWinner || 'off') || `cron roomsettings autodemoteprizewinner ${setting}`,
				]
			)
		),
	}),
];
