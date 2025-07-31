/**
 * Generations Event Scheduler
 * 
 * Plugins load once at the first user visit.
 * 
 * @license GPL-3.0-or-later
 */

import timersPromises from 'node:timers/promises';
import { FS, Utils } from "../../lib";
import { ChatCommands, ChatHandler } from "../chat";
import { Auth } from '../user-groups';

const MAX_INT32 = 2 ** 31 - 1;

/** config/event-scheduler.json */
interface ESConfig {
	[roomid: string]: ESEvent[],
}

interface ESEvent {
	readonly timestamp: number, // Showdown style (Unix epoch in seconds)
	readonly actionname: Lowercase<string>,
	readonly params: string,
	abort: AbortController, // JSON.stringify turns this into `{}`
}

type ESAction = (this: Room, params: string) => void;
interface ESActionTable {
	readonly [name: Lowercase<string>]: ESAction,
}

// TODO: actionname() -> actionname: { execute(), validate(), help: string[] }
/** Actions that can be scheduled. Add as needed. */
const ESActions: ESActionTable = {
	send_chat_message(params) {
		this.add(`[EventScheduler] ${params}`);
		this.update();
	},
	demote_prize_winner(params) {
		const [user, nextRank] = Utils.splitFirst(params, ',');
		if(!user) return;
		if(nextRank && Auth.isValidSymbol(nextRank)) {
			this.auth.set(toID(user), nextRank);
		}
		else {
			this.auth.delete(toID(user));
		}
	},
	log_ladder(params) {
		const [format, prefix] = Utils.splitFirst(params, ',');
		Ladders(toID(format)).getTop(prefix).then((result) => {
			if(!result) {
				this.add(`[EventScheduler] Format ${format} doesn't exist or doesn't have a ladder.`);
				this.send('');
				return;
			}
			this.addRaw(result[1]);
			this.update();
		});
	},
};

/** Abstraction layer handling the config file and timers. */
const ES = new class EventScheduler {

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

		// TODO: are these getting destroyed on /hotpatch chat ? maybe a memory leak here.
		let timer: Promise<any> = Promise.resolve();

		// setTimeout() will fire immediately if delay is more than MAX_INT32 (about 24 days)
		// so we'll form a promise chain that waits for acceptable chunks of time.
		while(timeout > MAX_INT32) {
			timer = timer.then(() => timersPromises.setTimeout(MAX_INT32, null, { signal: event.abort.signal }));
			timeout -= MAX_INT32;
		}

		timer.then(() => timersPromises.setTimeout(timeout, null, { signal: event.abort.signal })).then(() => {
			const room = Rooms.get(roomid);
			if(!room) return;
			ESActions[event.actionname].call(room, event.params);
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
			.map((event, index) => `${index}: ${event.actionname} ${event.timestamp} ${event.params}`)
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
				// TODO: move this to individual auth checks in ESActions.
				this.checkCan('roomprizewinner', null, room);

				// Input validation - the command at this point looks like so:
				// `/es add action target`
				// action is always valid
				// target should start with a valid datetime-local value or a showdown-style unix time.

				let [date, params] = Utils.splitFirst(target, ' ');

				const timestamp = (new Date(/^\d+$/.test(date) ? Number(date) * 1000 : `${date}Z`)).getTime() / 1000;
				if(Number.isNaN(timestamp)) {
					this.errorReply(`[EventScheduler] Input date ${date} is invalid. Must be a valid HTML datetime-local value or a Showdown style Unix time.`);
					return;
				}

				const event = { timestamp, actionname, params } as ESEvent;

				const result = ES.add(room.roomid, event);

				if(result) {
					this.errorReply(`[EventScheduler] Failure: ${result}`);
					return;
				}

				this.sendReply('[EventScheduler] Success!');
			} as ChatHandler),
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
			// TODO: apply changes retroactively
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
		'Event Scheduler runs preset scripts at specified dates. /eventscheduler = /es',
		'/es - Explains how to use eventscheduler.',
		'---',
		'/es list - Lists scheduled events in this room and their indexes.',
		'---',
		'/es add - Brings up a convenient form to schedule an event. You should use this unless you have a reason not to.',
		'/es add [action] [date] [params] - Schedules an event in this room. Action supports autocompletion. Date must be a valid HTML datetime-local value or a Showdown-style Unix time. Parameters are action-specific:',
		'/es add send_chat_message [date] [full message]',
		'/es add demote_prize_winner [date] [username], [next rank?]',
		'/es add log_ladder [date] [format], [username prefix?]',
		'---',
		'/es remove [index] - Cancels the specified event.',
	],
};

// Prevent duplicate events and memory leaks.
export const destroy = () => ES.destroy();

//
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
