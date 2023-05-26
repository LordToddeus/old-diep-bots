// ==UserScript==
// @name         Node Client v3.5
// @description  test
// @version      3.5
// @author       Reaper#7888
// @namespace    *://diep.io/
// @match        *://diep.io/
// @grant        GM_info
// @grant        GM_addStyle
// ==/UserScript==

//Tutorial:
//Press h to join bots
//Press h again to temporarily disable spawning bots
//Press h again to temporarily reenable spawning bots
//If you die, press Enter (to get to the screen where u type in the name) to spawn the Revengebots
//The Server automatically notices if you leave diep and 'unjoins' the bots for you.

document.addEventListener("keydown", function(event) {
    if (event.key === "i" && document.getElementById("textInput").disabled) {
        var name = prompt('Enter name', '');
        var encoder = new TextEncoder();
        var bytes = new Uint8Array(encoder.encode(name));
        var header = new Uint8Array([2]);
        var packet = new Uint8Array(header.length + bytes.length);
        packet.set(header);
        packet.set(bytes, header.length);
        nodeWS.send(packet);
    }
});
let nodeWS = new WebSocket('ws://localhost:8080');
var gameWS;
var running = false;
const URLRegex = /^wss?:\/\/[a-z0-9]{4}\.s\.m28n\.net\/$/g;
const wsi = new Set();
window.WebSocket.prototype._send = window.WebSocket.prototype.send;
window.WebSocket.prototype.send = function(data) {
    this._send(data);
    if (data instanceof Int8Array && this.url.match(URLRegex)) {
        if(data[0] === 1) nodeWS.send(data);
        if(data[0] === 2) nodeWS.send(new Uint8Array([7]));
        if(data[0] === 8) nodeWS.send(data);
        if (data[0] === 9)
            if (running === false) {
                running = true;
                nodeWS.send(gameWS.url);
                nodeWS.send(data);
            }
            else nodeWS.send(data);
        if (!wsi.has(this)) {
            wsi.add(this);
            gameWS = this;

            this._onmessage = this.onmessage;
            this.onmessage = function(event) {
                this._onmessage(event);
                const data = new Uint8Array(event.data);
                if(data[0] === 6) nodeWS.send(data);
            };
        }
    }
};