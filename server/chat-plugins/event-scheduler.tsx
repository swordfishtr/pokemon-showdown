/**
 * Generations Event Scheduler
 * 
 * @license GPL-3.0-or-later
 */

import timersPromises from 'node:timers/promises';
import { FS, Utils } from "../../lib";
import { ChatCommands, ChatHandler, CommandContext } from "../chat";
import { Auth } from '../user-groups';

const MAX_INT32 = 2 ** 31 - 1;
const DAY_MS = 24 * 60 * 60 * 1000;

// region Actions

/** config/event-scheduler.json */
interface ESConfig {
	[roomid: string]: ESEvent[],
}

interface ESEvent {
	readonly userid: ID, // Issuer of the command
	readonly timestamp: number, // Showdown style (Unix epoch in seconds)
	readonly actionname: Lowercase<string>,
	readonly input: string,
	abort: AbortController, // JSON.stringify turns this into `{}`
}

interface ESAction {
	help: string[],
	/** Sanitize input and check user authority. throw if invalid. */
	validate: (this: CommandContext, input: string) => (string | void),
	execute: (this: { room: Room, user: User }, input: string) => void,
}
interface ESActionTable {
	readonly [name: Lowercase<string>]: ESAction,
}

/** Actions that can be scheduled. Add as needed. */
const ESActions: ESActionTable = {

	// First stop for debugging Event Scheduler.
	send_chat_message: {
		help: [
			'/es add send_chat_message [date] [full message] - Logs message as plain text in current room.',
		],
		validate(input) {
			this.checkChat();
		},
		execute(input) {
			this.room.add(`[EventScheduler] ${(new Date()).toUTCString()} ${this.user.id}: ${input}`);
			this.room.update();
		},
	},

	// Generations has new prize winners frequently, so we automate their demotion.
	demote_prize_winner: {
		help: [
			'/es add demote_prize_winner [date] [username], [next rank?] - Sets username room auth to next rank or none.',
		],
		validate(input) {
			this.checkCan('roomprizewinner', null, this.room!);
		},
		execute(input) {
			const [user, nextRank] = Utils.splitFirst(input, ',');
			if(!user) return;
			if(nextRank && Auth.isValidSymbol(nextRank)) {
				this.room.auth.set(toID(user), nextRank);
			}
			else {
				this.room.auth.delete(toID(user));
			}
		},
	},

	// For ladder challenges.
	log_ladder: {
		help: [
			'/es add log_ladder [date] [format], [username prefix?] - Logs format ladder as HTML in current room.',
		],
		validate(input) {
			this.checkCan('disableladder');
		},
		async execute(input) {
			const [format, prefix] = Utils.splitFirst(input, ',');
			const result = await Ladders(toID(format)).getTop(prefix);
			this.room.add(`[EventScheduler] Ladder rankings of ${format} at ${(new Date()).toUTCString()} requested by ${this.user.id}:`);
			this.room.addRaw(result[1]);
			this.room.update();
		},
	},

	// Generations ladder decay is per-format, opt-in.
	ladder_decay_cycle: {
		help: [
			'/es add ladder_decay_cycle [date] [format], [decay threshold] - Begins daily ladder rating decay for format.',
		],
		validate(input) {
			this.checkCan('disableladder');
		},
		execute(input) {
			const params = Utils.splitFirst(input, ',');
			const formatid = toID(params[0]);
			const decayThreshold = Number(params[1]);

			const format = Dex.formats.get(formatid);
			if(!format.exists || !format.rated || !format.searchShow) {
				// log error?
				return;
			}

			Ladders(formatid).decayRatings(decayThreshold);

			const next = (Date.now() + DAY_MS) / 1000;

			const event = {
				userid: this.user.id,
				timestamp: next,
				actionname: 'ladder_decay_cycle',
				input,
			} as ESEvent;

			ES.add(this.room.roomid, event);
		},
	},

};

// endregion

// region Scheduler

/** Abstraction layer handling the config file and timers. */
export class EventScheduler {

	static readonly path = FS('config/event-scheduler.json');

	private destroying = false;

	/** Takes Showdown-style Unix time, returns proper Unix time for use in timers. */
	static calculateTimeout(timestamp: number) {
		return (timestamp * 1000) - Date.now();
	}

	/**
	 * Starts a timer and assigns the corresponding AbortController to the given event.
	 * 
	 * The timer is responsible for calling the event's action, and removing the event from memory.
	 */
	private assignTimer(roomid: string, event: ESEvent): string | null {
		if(event.abort?.signal) throw new Error('Tried to assign a timer to an event that already has one.');

		let timeout = EventScheduler.calculateTimeout(event.timestamp);
		// Date constructor validates the max value (which is less than Number.MAX_SAFE_INTEGER).
		// No valid timeout is too long.
		if(timeout < 100) return 'Timeout is too short.';

		event.abort = new AbortController();
		const options = { signal: event.abort.signal };

		// setTimeout() will fire immediately if delay is more than MAX_INT32 (about 24 days)
		// so we'll form a promise chain that waits for acceptable chunks of time.
		let timer: Promise<any> = Promise.resolve();
		while(timeout > MAX_INT32) {
			timer = timer.then(() => timersPromises.setTimeout(MAX_INT32, null, options));
			timeout -= MAX_INT32;
		}

		timer.then(() => timersPromises.setTimeout(timeout, null, options)).then(() => {
			const room = Rooms.get(roomid);
			if(!room) return;
			const user = Users.getExact(event.userid);
			if(!user) return;
			ESActions[event.actionname].execute.call({ room, user }, event.input);
		}).catch((error) => {
			if(!(error && error.name === 'AbortError')) throw error;
		}).finally(() => {
			if(this.destroying) return;
			const index = this.events[roomid].indexOf(event);
			if(index < 0) return;
			this.events[roomid].splice(index, 1);
			if(this.events[roomid].length === 0) delete this.events[roomid];
			this.write();
		});

		return null;
	}

	/** Working state of the plugin. */
	private readonly events = (() => {
		const cfg = EventScheduler.path.readIfExistsSync();
		// `event.abort`s at this point are `{}`. We have to initialize them.
		const obj = (cfg ? JSON.parse(cfg) : {}) as ESConfig;
		for(const room in obj) {
			for(const event of obj[room]) {
				const timer = this.assignTimer(room, event);
				// Expired event. Too bad.
				// It's safe not to write this to FS right now.
				if(timer) {
					obj[room].splice(obj[room].indexOf(event), 1);
					continue;
				}
			}
		}
		return obj;
	})();

	private write() {
		EventScheduler.path.writeUpdate(() => JSON.stringify(this.events));
	}

	list(roomid: string) {
		return this.events[roomid] ?? [];
	}

	/** Input ESEvent without `abort` */
	add(roomid: string, event: ESEvent): string | null {
		const timer = this.assignTimer(roomid, event);
		if(timer) return timer;
		this.events[roomid] ??= [];
		this.events[roomid].push(event);
		this.write();
		return null;
	}

	remove(roomid: string, index: number): string | null {
		const events = this.events[roomid];
		if(!events) return 'No events or invalid room.';
		if(!events[index]) return 'Event not found.';
		events[index].abort.abort();
		return null;
	}

	destroy() {
		this.destroying = true;
		for(const roomid in this.events) {
			for(const event of this.events[roomid]) {
				event.abort.abort();
			}
		}
	}

};

export const ES = new EventScheduler();

// endregion

// region Commands

/** Commands exposed to the end user. */
export const commands: Chat.ChatCommands = {

	es: 'eventscheduler',

	eventscheduler: {

		''(target, room, user, connection, cmd, message) {
			return this.parse('/help eventscheduler');
		},

		list(target, room, user, connection, cmd, message) {
			room = this.requireRoom();
			this.sendReply(ES.list(room.roomid)
			.map((event, index) => `${index}: ${event.userid} ${event.actionname} ${event.timestamp} ${event.input}`)
			.join('\n') || '[EventScheduler] No events scheduled for this room.');
		},

		add: Object.assign(

			{
				''(target, room, user, connection, cmd, message) {
					this.sendReplyBox(<div>
						<form data-stayinroom="true" data-submitsend="/eventscheduler add {action} {date} {parameters}">
							Schedule an action. Timezone is UTC. Parameters are specific to action; check /help eventscheduler<br></br>
							<select name="action">
								{Object.keys(ESActions).map((name) => (<option value={name}>{name}</option>))}
							</select>
							<input type="datetime-local" name="date"></input>
							<input class="textbox" name="parameters"></input>
							<button class="button" type="submit">Submit</button>
						</form>
					</div>);
				},
			} as ChatCommands,

			Utils.mapObjectValues(ESActions, (action, actionname) => function(target, room, user, connection, cmd, message) {
				room = this.requireRoom();

				// Input validation - the command at this point looks like so:
				// `/es add action target`
				// action is always valid
				// target should start with a valid datetime-local value or a showdown-style unix time.

				const params = Utils.splitFirst(target, ' ');
				const date = params[0];
				let input = params[1];

				const timestamp =/^\d+$/.test(date) ? Number(date) : (new Date(`${date}Z`)).getTime() / 1000;
				if(Number.isNaN(timestamp)) throw new Chat.ErrorMessage(
					`[EventScheduler] Input date ${date} is invalid. Must be a valid HTML datetime-local value or a Showdown style Unix time.`
				);

				input = action.validate.call(this, input) ?? input;

				const event = { userid: user.id, timestamp, actionname, input } as ESEvent;

				const result = ES.add(room.roomid, event);

				if(result) throw new Chat.ErrorMessage(`[EventScheduler] Failure: ${result}`);

				this.sendReply('[EventScheduler] Success!');
			} as ChatHandler),

			Object.fromEntries(Object.entries(ESActions).map(([actionname, action]) => [`${actionname}help`, action.help])),

		),

		remove(target, room, user, connection, cmd, message) {
			room = this.requireRoom();
			this.checkCan('roomprizewinner', null, room);

			if(target === '') {
				this.errorReply('[EventScheduler] Usage: /eventscheduler remove [index]');
				return this.parse('/eventscheduler list');
			}

			const index = Number(target);
			if(Number.isNaN(index)) {
				this.errorReply('[EventScheduler] Index must be a number.');
				return this.parse('/eventscheduler list');
			}

			const result = ES.remove(room.roomid, index);

			if(result) {
				this.errorReply(`[EventScheduler] Failure: ${result}`);
				return;
			}

			this.sendReply(`[EventScheduler] Success!`);
		},

		roomsettings: {

			autodemoteprizewinner(target, room, user, connection, cmd, message) {
				room = this.requireRoom();
				this.checkCan('declare', null, room);
				let num = parseInt(target);
				if (this.meansNo(target)) num = 0;
				if (isNaN(num) || num > 12 || num < 0) {
					return this.parse('/help eventscheduler');
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
						throw new Chat.ErrorMessage(`Number of recent tournaments to record is already disabled.`);
					}
					delete room.settings.autoDemotePrizeWinner;
					room.saveSettings();
					this.privateModAction(`Automatic demotion of Prize Winners was turned off by ${user.name}.`);
					this.modlog('ROOM SETTINGS', null, `auto-demote prize winner: off`);
				}
			},

		},

	},

	eventschedulerhelp: [
		'::',
		'Event Scheduler runs preset scripts at user specified dates.',
		'Max date is unlimited, and precision is down to a few milliseconds.',
		'Feel free to rely on it and automate in userscripts and other server-side systems.',
		'::',
		'/eventscheduler = /es - Shows this help message.',
		'::',
		'/es list - Lists scheduled events in this room and their indexes.',
		'::',
		'/es add - Brings up a convenient form to schedule an event in this room.',
		'/es add [action] [date] [params] - Schedules an event in this room (advanced).',
		'Date must be a valid HTML datetime-local value (in GMT+0) or a Showdown-style Unix time.',
		'For action-specific help, send /help es add [action]',
		'::',
		'/es remove [index] - Cancels the specified event.',
		'::',
		'/es roomsettings ... - Do not use directly. Instead, use /roomsettings',
		'::',
	],

};

// Prevent duplicate events and memory leaks.
export const destroy = () => ES.destroy();

// These are exposed to room authority in /roomsettings
export const roomSettings: Chat.SettingsHandler[] = [
	room => ({
		label: "Event Scheduler auto-demote Room Prize Winners (in months)",
		permission: "editroom",
		options: ['off', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
			setting => (
				[
					`${setting}`,
					setting === (room.settings.autoDemotePrizeWinner || 'off') || `eventscheduler roomsettings autodemoteprizewinner ${setting}`,
				]
			)
		),
	}),
];

// endregion
