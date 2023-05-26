const ws = require('ws');
var httpsProxyAgent = require('https-proxy-agent');
var fs = require('fs');
var url = require('url');
var coloring = require('colors');

console.log('_________________________'.yellow);
console.log('Sandbox AC Bots'.red);
console.log('Made By: '.green);
console.log('shlong#2873 '.blue);
console.log('_________________________'.yellow);
setTimeout(function() {
    console.log('Waking up Bots! Please wait...'.red);
}, 1000);
var proxies = fs.readFileSync('proxies.txt', 'utf-8').split('\r\n');
var proxiesTwo = fs.readFileSync('proxiesTwo.txt', 'utf-8').split('\r\n');
var proxiesThree = fs.readFileSync('proxiesThree.txt', 'utf-8').split('\r\n');
var proxiesFour = fs.readFileSync('proxiesFour.txt', 'utf-8').split('\r\n');
var index = 0;
var indexTwo = 0;
var indexThree = 0;
var indexFour = 0;
var ProxyConnected = '0'
// YOU CAN CHANGE THESE
var serverlink = 'FEDD39407EDC';
var serverID = 'ba2f';
var name = 'Bandito?!$5252';


function Main() {
    var serverid = 'wss://'+ serverID +'.s.m28n.net/'
    var localagent = new httpsProxyAgent(url.parse(`http://${proxies[index]}`));
    var localagentTwo = new httpsProxyAgent(url.parse(`http://${proxiesTwo[indexTwo]}`));
    var localagentThree = new httpsProxyAgent(url.parse(`http://${proxiesThree[indexThree]}`));
    var localagentFour = new httpsProxyAgent(url.parse(`http://${proxiesFour[indexFour]}`));
    setInterval(function() {
        localagent
        localagentTwo
        localagentThree
        localagentFour
    }, 100);
    var link = {
        origin: 'http://diep.io',
        agent: localagent,
        agent: localagentTwo,
        agent: localagentThree,
        agent: localagentFour,
    }
    index++
    indexTwo++
    indexThree++
    indexFour++
    ProxyConnected++
    var init = new TextEncoder().encode('\x00a5c9e13100793a51056188a9608451d6d3d0bc20\x00\x00' + serverlink + '\x00\x00');
    var spawn = new TextEncoder().encode('\x02' + name);
    var idLink = new ws(serverid, link);
    // BOT ONE
    idLink.onopen = function ()
    {
        idLink.send(init);
        setInterval(function()
                    {
            idLink.send(spawn);
            idLink.send(new Int8Array([1, 128, 18]));
        }, 100);
        var ac = setTimeout(function()
                            {
            for (var i = 0; i < 7; i++)
            {
                idLink.send(new Int8Array([3, 6, 1]));
            }
            setInterval(function() {
                idLink.send(new Int8Array([1, 1]));
            });
        }, 3000);
    }
    // BOT TWO
    var idLinkTwo = new ws(serverid, link);
    idLinkTwo.onopen = function ()
    {
        idLinkTwo.send(init);
        setInterval(function()
                    {
            idLinkTwo.send(spawn);
            idLinkTwo.send(new Int8Array([1, 128, 18]));
        });
        var acTwo = setTimeout(function()
                               {
            for (var e = 0; e < 7; e++)
            {
                idLinkTwo.send(new Int8Array([3, 6, 1]));
            }
            setInterval(function() {
                idLinkTwo.send(new Int8Array([1, 1]));
            });
        }, 3000);
    }
    idLink.on("error", function(){});
    idLinkTwo.on("error", function(){});
    idLink.on('uncaughtException', function(){});
    idLinkTwo.on('uncaughtException', function(){});
}
setInterval(Main, 0);
// idLink.send(new Int8Array([1, 127]));