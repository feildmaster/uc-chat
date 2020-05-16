const { EventEmitter } = require('events');
const WebSocket = require("ws");
const login = require('./login');
const parse = require('./parseMessage');
const throttle = require('../util/throttle');

const UNHANDLED_MESSAGE = 'message/unhandled';

class Connection extends EventEmitter {
  constructor(login) {
    super();
    this._login = login;
    this._connected = false;
    this._ws;
    this._pingTimer;
    this._throttle = new throttle({
      throttle: 3250, // One message every 3 seconds
    });

    this.self = {};
    this.friends = [];

    let interval;
    this.on('connect', () => {
      interval = setInterval(() => this.ping(), 9000);
    }).on('disconnect', () => {
      interval && clearInterval(interval);
      this._ws = undefined;
      this.self = {};
      this.friends = [];
    }).on('message/getSelfInfos', (data) => {
      this.self = data.me;
      this.friends = data.friends;
    });
  }

  get connected() {
    return this._connected;
  }

  connect() {
    if (this.connected) return;
    this._connected = true;
    login(this._login).then(({ headers }) => {
      const auth = headers['set-cookie'].map(cookie => cookie.split(";")[0]).join("; ") + ";";

      const ws = this._ws = new WebSocket("wss://undercards.net/chat", { headers: { Cookie: auth } });

      // Wait a bit before timing out
      const timeout = setTimeout(() => {
        this.emit('error/timeout');
        ws.close();
      }, 1000);

      // Getting a message means we've actually connected
      ws.once('message', () => {
        clearTimeout(timeout);
      }).on('open', () => {
        this.emit('connect', this);
      }).on('close', () => {
        this._connected = false;
        this.emit('disconnect', this);
      }).on('error', (e) => {
        this.emit('error'. e, this);
      }).on('message', (data) => {
        this.emit('message/received');

        const parsedData = parse(data);
        const { action } = parsedData;

        const baseEvent = `message/${action}`;
        let emitted = this.emit(baseEvent, parsedData, this);

        if (action === 'getMessageAuto') {
          const { message } = parsedData;
          emitted |= this.emit(`${baseEvent}/${message[0]}`, message, this);
        } else if (action === 'getMessage' || action === 'getPrivateMessage') {
          emitted |= this.emit(`${baseEvent}/${parsedData.room}`, parsedData, this);
        }
        
        if (!emitted) {
          this.emit(UNHANDLED_MESSAGE, parsedData, this);
        }
      });
    }).catch((res) => {
      this._connected = false;
      this.emit('error/login', res);
    });
  }

  disconnect() {
    if (this.connected) this._ws.close();
  }
  
  ping() {
    this._send({
      ping: 'pong',
    });
  }

  join(room) {
    this._send({
      room,
      action: 'openRoom',
    });
  }

  joinPrivate(user) {
    const idUser = user.idUser || user.userid;
    if (!idUser || !user.username) return;
    this._send({
      action: 'openPrivateRoom',
      idUser,
      friendName: user.usernameSafe || user.username
    });
  }

  message(message, room) {
    this._throttledMessage({
      action: 'message',
      message,
      room,
    });
  }

  privateMessage(message, user) {
    this._throttledMessage({
      action: 'privateMessage',
      message,
      // idUser (UC internal), userid (bot internal), raw (just to support it)
      idUser: user.idUser || user.id ||user.userid || user,
    });
  }

  _throttledMessage(data) {
    this._throttle.queue(() => {
      console.log('Sending:', new Date());
      this._send(data)
    });
  }

  _send(data) {
    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }

    this._ws.send(data);
  }
}

module.exports = Connection;
module.exports.UNHANDLED_MESSAGE = UNHANDLED_MESSAGE;