var fs = require('fs');
var url = require('url');
var process = require('process');
var ws = require('ws');
var HttpsProxyAgent = require('https-proxy-agent');
var webSocketServer = require('ws').Server,
    wss = new webSocketServer({
        port: 8080
    });

var proxies = fs.readFileSync('proxies.txt', 'utf8').split('\r\n');
var agents;
var params;
var proxiesCount = proxies.length;
console.log("loaded " + proxiesCount + " proxies.")
var bot;
var number = 0;
var activeBots = 0;
var botsname = "Toddeus OP";

var diepWS = '';
var partyID = '';

var packet_STAT_REGEN = new Uint8Array([3, 8, 1]);
var packet_STAT_HEALTH = new Uint8Array([3, 10, 1]);
var packet_STAT_BODYDAMAGE = new Uint8Array([3, 12, 1]);
var packet_STAT_BULLETSPEED = new Uint8Array([3, 14, 1]);
var packet_STAT_PENETRATION = new Uint8Array([3, 0, 1]);
var packet_STAT_DAMAGE = new Uint8Array([3, 2, 1]);
var packet_STAT_RELOAD = new Uint8Array([3, 4, 1]);
var packet_STAT_MOVEMENT = new Uint8Array([3, 6, 1]);

var packet_TANK_SNIPER = new Uint8Array([4, 58]);
var packet_TANK_OVERSEER = new Uint8Array([4, 32]);
var packet_TANK_NECRO = new Uint8Array([4, 20]);

var packet_INPUT;
var packet_SPAWN;
var packet_INIT;
var packet_HEARTBEAT = new Uint8Array([5]);

var started = false;
var spawning = false;
var shooting = false;
var killing = false;
var disabled = true;
var disabledbyClient = false;

console.log("Loading Server..");
wss.on('connection', function connection(wscon) {
  console.log("Client connected");
  disabled = false;
    wscon.on('message', function incoming(data) {
        if(data[0] === 0){
          var buildid = data.slice(0,1);
          console.log(buildid)
        }
        else if (data[0] === 1) {
            var prepacket = new Int8Array(data);
            prepacket[1] &= 0b10000001;
            prepacket[2] &= 0b11110010;
            prepacket[1] |= 0b00000001;
            prepacket[2] |= 0b00000010;
            packet_INPUT = prepacket;
        } else if(data[0] === 7) {
          //packet_SPAWN = data;
            if (spawning === true && killing === false) {
                console.log("killing bots...");
                killing = true;
                spawning = false;
            }
        }
        else if (data[0] === 6) {
            for (let i = 1; i < data.byteLength; i++) {
                let byte = data[i].toString(16).split('');
                if (byte.length === 1) {
                    partyID += (byte[0] + '0');
                } else {
                    partyID += (byte[1] + byte[0]);
                }
            }
            if (partyID.length === 0)
              packet_INIT = new TextEncoder().encode('\x006f59094d60f98fafc14371671d3ff31ef4d75d9e\x00\x00');
            else
            packet_INIT = new TextEncoder().encode('\x006f59094d60f98fafc14371671d3ff31ef4d75d9e\x00\x00' + partyID + '\x00\x00');
        } else if (data[0] === 2) {
            console.log("Changed Botsname.");
            packet_SPAWN = new Uint8Array(data);
        } else if (data[0] === 8) {
            if (spawning === false && disabled === false) {
                console.log("spawning bots...");
                spawning = true;
                killing = false;
            }
        } else if (data[0] === 9) {
            if (started === false) {
                started = true;
                startBots();
                console.log("starting bots..");
                if (partyID.length === 0)
              packet_INIT = new TextEncoder().encode('\x006f59094d60f98fafc14371671d3ff31ef4d75d9e\x00\x00');
            else
            packet_INIT = new TextEncoder().encode('\x006f59094d60f98fafc14371671d3ff31ef4d75d9e\x00\x00' + partyID + '\x00\x00');
            }
            else if(started === true && disabledbyClient === false) {
                disabledbyClient = true;
            }
            else if(started === true && disabledbyClient === true) {
                disabledbyClient = false;
            }
        } else {
          if(data.length === 40) {
            //var buildid = data;
            console.log(buildid);
          }
          else
            diepWS = data;
        }
    });
    wscon.on('close', function close() {
      disabled = true;
      started = false;
      diepWS = '';
      partyID = '';
      console.log("lost a client");
      console.log("Stopping Bots");
    });
});
function spawnPacketBuild(name) {
  var packet = [2];
    for (var temp in name) {
      packet.push(name.charCodeAt(temp));
    }
  packet.push(0);
  packet_SPAWN = new Uint8Array(packet);

}

function startBots() {
  spawnPacketBuild(botsname);
    function openCheck() {
        if(activeBots < 40 && disabled === false)
        checkBot();
        setTimeout(function() {
          if(disabled === false)
            openCheck();
        }, 200);
    }
    openCheck();
    function checkBot() {
        if (number > proxiesCount)
            number = 0;

        var localagent = new HttpsProxyAgent(url.parse('http://' + proxies[number]));
        params = {
            origin: 'https://diep.io',
            agent: localagent
        };
        bot = new ws(diepWS, params);
        bot.on('error', function e() {
            return;
        });
        openBot(bot);
        number = number + 1;
    }
}

function openBot(bot) {
    var activated = false;
    bot.on('open', function open() {
        activated = true;
        activeBots = activeBots + 1;
        console.log("Bot connected. Bots remaining: " + activeBots);
        bot.send(packet_INIT);
        bot.send(packet_HEARTBEAT);
        var newSpawn = false;
        var nuInterval = setInterval(function() {
          if(disabled === true) {
            bot.close();
            clearInterval(nuInterval);
          }
            if (spawning === true && newSpawn === false && disabledbyClient === false) {
                newSpawn = true;
                spawnBots();
            } else if (killing === true && spawning === false) {
                bot.send(new Uint8Array([1, 192, 16, 0, 0]));
                newSpawn = false;
                clearInterval(inputInterval);
            }
        }, 100);
        var inputInterval;
        function spawnBots() {
            bot.send(packet_SPAWN);
            var interval = setInterval(function() {
                bot.send(new Uint8Array([1, 128, 18, 0, 0]));
            }, 50);
            setTimeout(function() {
                clearInterval(interval);
                for (var i = 0; i < 7; i++) {
                    bot.send(packet_STAT_PENETRATION);
                    bot.send(packet_STAT_DAMAGE);
                    bot.send(packet_STAT_RELOAD);
                    bot.send(packet_STAT_BULLETSPEED);
                }
                bot.send(packet_TANK_SNIPER);
                bot.send(packet_TANK_OVERSEER);
                bot.send(packet_TANK_NECRO);
                bot.send(new Uint8Array([1, 129, 24, 0, 0]));
                inputInterval = setInterval(function() {
                    bot.send(packet_INPUT);
                    
                }, 50)
            }, 2500);
        }


    });
    bot.on('close', function close() {
        if (activated === true) {
            activeBots = activeBots - 1;
            console.log("Bot disconnected. Bots remaining: " + activeBots);
        }
        return;
    });
}