/**
 * Generations Event Scheduler
 * 
 * Plugins load once at the first user visit.
 * 
 * @license GPL-3.0-or-later
 */

import { FS, Utils } from "../../lib";
import { ChatCommands, ChatHandler } from "../chat";

/** config/event-scheduler.json */
interface ESConfig {
	[roomid: string]: ESEvent[],
}

interface ESEvent {
	readonly timestamp: number, // Showdown style (Unix epoch in seconds)
	readonly actionname: Lowercase<string>,
	readonly params: string,
	timer: NodeJS.Timeout, // For convenience - this should not be written to FS.
}

type ESAction = (this: Room, params: string) => void;
interface ESActionTable {
	readonly [name: Lowercase<string>]: ESAction,
}

/** Actions that can be scheduled. Add as needed. */
const ESActions: ESActionTable = {
	send_chat_message(params) {
		this.add(`[EventScheduler] ${params}`);
	},
	demote_prize_winner(params) {
		this.add(`[EventScheduler] User ${params} would lose Prize Winner now`);
	},
	log_ladder(params) {
		this.add(`[EventScheduler] Format ${params} would have its current ladder state logged now`);
	},
};

/** Abstraction layer handling the config file and timers. */
const ES = new class EventScheduler {
	static readonly path = FS('../../config/event-scheduler.json');
	static calculateTimeout(timestamp: number) {
		return (timestamp * 1000) - Date.now();
	}
	private createTimer(roomid: string, event: ESEvent) {
		const timeout = EventScheduler.calculateTimeout(event.timestamp);
		if(timeout < 100) return 'Timeout is too short.';
		return setTimeout(() => {
			this.remove(roomid, event);
			const room = Rooms.get(roomid);
			if(!room) return;
			ESActions[event.actionname].call(room, event.params);
		}, timeout);
	}
	private readonly events = (() => {
		const cfg = EventScheduler.path.readIfExistsSync();
		const obj = (cfg ? JSON.parse(cfg) : {}) as ESConfig;
		for(const room in obj) {
			for(const event of obj[room]) {
				const timer = this.createTimer(room, event);
				// Expired event. Too bad.
				// It's safe not to write this to FS right now.
				if(typeof timer !== 'object') {
					obj[room].splice(obj[room].indexOf(event), 1);
					continue;
				}
				event.timer = timer;
			}
		}
		return obj;
	})();
	private get eventsNoTimers() {
		const buf: ESConfig = {};
		for(const room in this.events) {
			buf[room] = [];
			for(const event of this.events[room]) {
				const eventNoTimer = { ...event } as any;
				delete eventNoTimer.timer;
				buf[room].push(eventNoTimer);
			}
		}
		return buf;
	}
	private write() {
		EventScheduler.path.writeUpdate(() => JSON.stringify(this.eventsNoTimers));
	}
	list(roomid: string) {
		return this.events[roomid] ?? [];
	}
	add(roomid: string, event: ESEvent) {
		const timer = this.createTimer(roomid, event);
		if(typeof timer !== 'object') return timer;
		event.timer = timer;
		const events = (this.events[roomid] ??= []);
		events.push(event);
		this.write();
		return null;
	}
	remove(roomid: string, index: number | ESEvent) {
		const events = this.events[roomid];
		if(!events) return 'No events or invalid room.';
		if(typeof index !== 'number') index = events.indexOf(index);
		if(!events[index]) return 'Event not found.';
		clearTimeout(events[index].timer);
		events.splice(index, 1);
		if(events.length === 0) delete this.events[roomid];
		this.write();
		return null;
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
			.join('\n') || 'No events scheduled for this room.');
		},
		add: Object.assign(
			{
				''(target, room, user, connection, cmd, message) {
					this.sendReplyBox(<div>
						<form data-submitsend="/eventscheduler add {action} {date} {parameters}">
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
				this.checkCan('roomprizewinner', null, room);

				// Input validation - the command at this point looks like so:
				// `/es add action target`
				// action is always valid
				// target should start with a valid datetime-local value or a showdown-style unix time.

				let [date, params] = Utils.splitFirst(target, ' ');

				const timestamp = (new Date(/^\d+$/.test(date) ? Number(date) * 1000 : `${date}Z`)).getTime();
				if(Number.isNaN(timestamp)) {
					this.errorReply(`Input date ${date} is invalid. Must be a valid HTML datetime-local value or a Showdown style Unix time.`);
					return;
				}

				const event = { timestamp, actionname, params } as ESEvent;

				const result = ES.add(room.roomid, event);

				if(result) {
					this.errorReply(`Failure: ${result}`);
					return;
				}

				this.sendReply('Success!');
			} as ChatHandler),
		),
		remove(target, room, user, connection, cmd, message) {
			room = this.requireRoom();
			this.checkCan('roomprizewinner', null, room);

			if(target === '') {
				this.errorReply('Usage: /eventscheduler remove [index]');
				return this.parse('/eventscheduler list');
			}

			const index = Number(target);
			if(Number.isNaN(index)) {
				this.errorReply('Index must be a number.');
				return this.parse('/eventscheduler list');
			}

			const result = ES.remove(room.roomid, index);

			if(result) {
				this.errorReply(`Failure: ${result}`);
				return;
			}

			this.sendReply(`Success!`);
		},
	},

	eventschedulerhelp: [
		'event scheduler help goes here',
	],
};
