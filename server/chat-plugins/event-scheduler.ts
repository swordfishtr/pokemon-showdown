/**
 * Generations Event Scheduler
 * 
 * Plugins load once at the first user visit.
 * 
 * @license GPL-3.0-or-later
 */

import { FS } from "../../lib";
import { ChatCommands } from "../chat";

/** config/event-scheduler.json */
interface ESConfig {
	[roomid: string]: ESEvent[],
}

interface ESEvent {
	readonly date: number, // Showdown style (Unix epoch in seconds)
	readonly action: string,
	readonly params: any[],
	timer: NodeJS.Timeout, // For convenience - this should not be written to FS.
}

type ESAction = (this: Room, ...params: any[]) => void;
interface ESActionTable {
	readonly [name: string]: ESAction,
}

/** Actions that can be scheduled. Add as needed. */
const ESActions: ESActionTable = {
	sendChatMessage(text: string) {
		this.add(`[EventScheduler] ${text}`);
	},
	demotePrizeWinner(userid: string) {
		this.add(`[EventScheduler] User ${userid} would lose Prize Winner now`);
	},
	logLadder(formatid: string) {
		this.add(`[EventScheduler] Format ${formatid} would have its current ladder state logged now`);
	},
};

/** Abstraction layer handling the config file and timers. */
const ES = new class EventScheduler {
	static readonly path = FS('../../config/event-scheduler.json');
	static calculateTimeout(date: number) {
		return (date * 1000) - Date.now();
	}
	private createTimer(roomid: string, event: ESEvent) {
		const timeout = EventScheduler.calculateTimeout(event.date);
		if(timeout < 100) return 'Timeout is too short.';
		return setTimeout(() => {
			this.remove(roomid, event);
			const room = Rooms.get(roomid);
			if(!room) return;
			ESActions[event.action].apply(room, event.params);
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
const commands: Chat.ChatCommands = {
	es: 'eventscheduler',
	eventscheduler: {
		''(target, room, user, connection, cmd, message) {
			return this.parse('/help eventscheduler');
		},
		// TODO: remove this
		ping(target, room, user, connection, cmd, message) {
			this.sendReply(`Pong! ${target}`);
			this.sendReplyBox('<div><button class="button" name="send" value="/rfaq" onclick="console.log(this)"></button></div>')
		},
		list(target, room, user, connection, cmd, message) {
			room = this.requireRoom();
			this.sendReply(ES.list(room.roomid)
			.map((event, index) => `${index}: ${event.action} ${event.date}`)
			.join('\n') || 'No events scheduled for this room.');
		},
		add: {
			''(target, room, user, connection, cmd, message) {
				this.sendReply(`This would send a form now`);
			},
			// Actions are added later to avoid code duplication.
		},
		remove(target, room, user, connection, cmd, message) {
			room = this.requireRoom();
			this.checkCan('roomprizewinner', null, room);

			if(target === '') {
				this.sendReply(`Usage: /eventscheduler remove [index]`);
				return this.parse('/eventscheduler list');
			}

			this.sendReply(`This would remove now`);
		},
	},

	eventschedulerhelp: [
		'event scheduler help goes here',
	],
};

for(const action in ESActions) {
	((commands as any).eventscheduler.add as ChatCommands)[action] = function(target, room, user, connection, cmd, message) {
		room = this.requireRoom();
		this.checkCan('roomprizewinner', null, room);

		// Input validation - the command at this point looks like so:
		// ^/es add action target$
		// target should be a valid datetime-local value or a showdown-style unix epoch timestamp.

		this.sendReply(`This would add ${action} now`);
	};
}

export { commands };
