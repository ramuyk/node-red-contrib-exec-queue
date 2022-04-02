## Overview
A Node-RED alternative exec node that runs a template code with a queue.

## How to use

This node allows you to use the command line of your system to execute template code inside Node-RED:

![](https://raw.githubusercontent.com/rafaelmuynarsk/node-red-contrib-exec-queue/main/images/template.gif)

The sample above is using the command `python3` that's installed on the system to execute `$file` (which is the code written inside the template space). Since it uses the command line of the system, you can execute code written on any programming language that you can execute on the command line. The following examples show how this node can be used:

1. Executing `Bash` code:

![](https://raw.githubusercontent.com/rafaelmuynarsk/node-red-contrib-exec-queue/main/images/executing_bash.gif)

2. Executing `Node.js` code:

![](https://raw.githubusercontent.com/rafaelmuynarsk/node-red-contrib-exec-queue/main/images/executing_node.js.gif)

3. Executing `Python` code:

![](https://raw.githubusercontent.com/rafaelmuynarsk/node-red-contrib-exec-queue/main/images/executing_python.gif)

4. Queueing code:

![](https://raw.githubusercontent.com/rafaelmuynarsk/node-red-contrib-exec-queue/main/images/queue.gif)

5. Using spawn:

![](https://raw.githubusercontent.com/rafaelmuynarsk/node-red-contrib-exec-queue/main/images/spawn.gif)

6. Output code as parsed JSON:

![](https://raw.githubusercontent.com/rafaelmuynarsk/node-red-contrib-exec-queue/main/images/output_object.gif)

---

## Syntax Highlight

This node is designed to work with the Ace editor. All syntax highlights available on Ace can be found on their GitHub page: https://github.com/ajaxorg/ace-builds/tree/master/src-min-noconflict

On Linux, it's possible to install the Vim mode and the syntax highlights available on this node with the following commands:

```bash
# vim mode
sudo wget -P /usr/local/lib/node_modules/node-red/node_modules/@node-red/editor-client/public/vendor/ace https://raw.githubusercontent.com/ajaxorg/ace-builds/master/src-min-noconflict/keybinding-vim.js

# syntax highlight
sudo wget -P /usr/local/lib/node_modules/node-red/node_modules/@node-red/editor-client/public/vendor/ace https://raw.githubusercontent.com/ajaxorg/ace-builds/master/src-min-noconflict/mode-sh.js
sudo wget -P /usr/local/lib/node_modules/node-red/node_modules/@node-red/editor-client/public/vendor/ace https://raw.githubusercontent.com/ajaxorg/ace-builds/master/src-min-noconflict/mode-pgsql.js
sudo wget -P /usr/local/lib/node_modules/node-red/node_modules/@node-red/editor-client/public/vendor/ace https://raw.githubusercontent.com/ajaxorg/ace-builds/master/src-min-noconflict/mode-r.js
sudo wget -P /usr/local/lib/node_modules/node-red/node_modules/@node-red/editor-client/public/vendor/ace https://raw.githubusercontent.com/ajaxorg/ace-builds/master/src-min-noconflict/mode-nginx.js
sudo wget -P /usr/local/lib/node_modules/node-red/node_modules/@node-red/editor-client/public/vendor/ace https://raw.githubusercontent.com/ajaxorg/ace-builds/master/src-min-noconflict/mode-apache_conf.js
sudo wget -P /usr/local/lib/node_modules/node-red/node_modules/@node-red/editor-client/public/vendor/ace https://raw.githubusercontent.com/ajaxorg/ace-builds/master/src-min-noconflict/mode-dockerfile.js
sudo wget -P /usr/local/lib/node_modules/node-red/node_modules/@node-red/editor-client/public/vendor/ace https://raw.githubusercontent.com/ajaxorg/ace-builds/master/src-min-noconflict/mode-terraform.js
```

---

JSON flow with samples using this node:

```json
[{"id":"d88ed402d0ec72b1","type":"exec queue","z":"ff922ddb.76cc18","name":"node.js code","currentLine":{"row":0,"column":26},"command":"node $file","debugMode":false,"outputs":1,"useSpawn":"false","field":"payload","fieldType":"msg","format":"javascript","template":"console.log('Hello World')","output":"str","outputEmpty":false,"vimMode":true,"queue":"1","addpayCB":false,"splitLine":false,"cleanQueue":true,"x":390,"y":2680,"wires":[["6e3c4b4a924be99e"]]},{"id":"0b757017d1b2036d","type":"inject","z":"ff922ddb.76cc18","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":200,"y":2680,"wires":[["d88ed402d0ec72b1"]]},{"id":"6e3c4b4a924be99e","type":"debug","z":"ff922ddb.76cc18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","statusVal":"","statusType":"auto","x":580,"y":2680,"wires":[]},{"id":"f95176bd495277a0","type":"exec queue","z":"ff922ddb.76cc18","name":"bash code","currentLine":{"row":0,"column":18},"command":"bash $file","debugMode":false,"outputs":1,"useSpawn":"false","field":"payload","fieldType":"msg","format":"sh","template":"echo \"Hello World\"\n","output":"str","outputEmpty":false,"vimMode":true,"queue":"1","addpayCB":false,"splitLine":false,"cleanQueue":true,"x":390,"y":2800,"wires":[["b7e4d03852b6627d"]]},{"id":"eddc63eecd0d6953","type":"inject","z":"ff922ddb.76cc18","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":200,"y":2800,"wires":[["f95176bd495277a0"]]},{"id":"b7e4d03852b6627d","type":"debug","z":"ff922ddb.76cc18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","statusVal":"","statusType":"auto","x":580,"y":2800,"wires":[]},{"id":"ea3450ab0e0dda27","type":"exec queue","z":"ff922ddb.76cc18","name":"python code (template parameters)","currentLine":{"row":0,"column":22},"command":"python3 $file","debugMode":false,"outputs":1,"useSpawn":"false","field":"payload","fieldType":"msg","format":"python","template":"print('{{{payload}}}')","output":"str","outputEmpty":false,"vimMode":true,"queue":"1","addpayCB":false,"splitLine":false,"cleanQueue":true,"x":460,"y":2860,"wires":[["68498b4f87e67150"]]},{"id":"272271b6bea61817","type":"inject","z":"ff922ddb.76cc18","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":200,"y":2860,"wires":[["ea3450ab0e0dda27"]]},{"id":"68498b4f87e67150","type":"debug","z":"ff922ddb.76cc18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","statusVal":"","statusType":"auto","x":710,"y":2860,"wires":[]},{"id":"bbba0e33b8b86cab","type":"exec queue","z":"ff922ddb.76cc18","name":"python code (parsed json output)","currentLine":{"row":0,"column":1},"command":"python3 $file","debugMode":false,"outputs":1,"useSpawn":"false","field":"payload","fieldType":"msg","format":"python","template":"print('''\n{\n   \"value\": \"Hello World\" \n}\n\n''')","output":"parsedJSON","outputEmpty":false,"vimMode":true,"queue":"1","addpayCB":false,"splitLine":false,"cleanQueue":true,"x":450,"y":3100,"wires":[["7ae446a444d4a341"]]},{"id":"bb6ecec0f6675207","type":"inject","z":"ff922ddb.76cc18","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":200,"y":3100,"wires":[["bbba0e33b8b86cab"]]},{"id":"7ae446a444d4a341","type":"debug","z":"ff922ddb.76cc18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","statusVal":"","statusType":"auto","x":710,"y":3100,"wires":[]},{"id":"e6245fd12753faf3","type":"exec queue","z":"ff922ddb.76cc18","name":"python code (exec sleep 3)","currentLine":{"row":6,"column":0},"command":"python3 $file","debugMode":false,"outputs":1,"useSpawn":"false","field":"payload","fieldType":"msg","format":"python","template":"import time\n\ntime.sleep(3)\nprint(\"Hello World\")\ntime.sleep(3)\nprint(\"Hello World\")\ntime.sleep(3)\nprint(\"Hello World\")","output":"str","outputEmpty":false,"vimMode":true,"queue":"1","addpayCB":false,"splitLine":false,"cleanQueue":true,"x":440,"y":2980,"wires":[["b184625a4b5a52ed"]]},{"id":"68ff1ea197b44d1f","type":"inject","z":"ff922ddb.76cc18","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":200,"y":2980,"wires":[["e6245fd12753faf3"]]},{"id":"b184625a4b5a52ed","type":"debug","z":"ff922ddb.76cc18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","statusVal":"","statusType":"auto","x":710,"y":2980,"wires":[]},{"id":"048b906fd13ce0f6","type":"exec queue","z":"ff922ddb.76cc18","name":"python code (spawn sleep 3)","currentLine":{"row":8,"column":0},"command":"python3 -u $file","debugMode":false,"outputs":1,"useSpawn":"true","field":"payload","fieldType":"msg","format":"python","template":"import time\n\ntime.sleep(3)\nprint(\"Hello World\")\ntime.sleep(3)\nprint(\"Hello World\")\ntime.sleep(3)\nprint(\"Hello World\")\n","output":"str","outputEmpty":false,"vimMode":true,"queue":"1","addpayCB":false,"splitLine":false,"cleanQueue":true,"x":440,"y":3040,"wires":[["95ae632e91472810"]]},{"id":"a775b58ae119823f","type":"inject","z":"ff922ddb.76cc18","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":200,"y":3040,"wires":[["048b906fd13ce0f6"]]},{"id":"95ae632e91472810","type":"debug","z":"ff922ddb.76cc18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","statusVal":"","statusType":"auto","x":710,"y":3040,"wires":[]},{"id":"32c6d7f945cc6d10","type":"exec queue","z":"ff922ddb.76cc18","name":"python code (queue)","currentLine":{"row":3,"column":2},"command":"python3 $file","debugMode":false,"outputs":1,"useSpawn":"false","field":"payload","fieldType":"msg","format":"python","template":"import time\n\ntime.sleep(3)\nprint(\"Hello World\")","output":"str","outputEmpty":false,"vimMode":true,"queue":"3","addpayCB":false,"splitLine":false,"cleanQueue":true,"x":420,"y":2920,"wires":[["c171d12311b34d89"]]},{"id":"3d798f85970b4349","type":"inject","z":"ff922ddb.76cc18","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":200,"y":2920,"wires":[["32c6d7f945cc6d10"]]},{"id":"c171d12311b34d89","type":"debug","z":"ff922ddb.76cc18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","statusVal":"","statusType":"auto","x":710,"y":2920,"wires":[]},{"id":"523bf687a42cc31f","type":"exec queue","z":"ff922ddb.76cc18","name":"using node.js synchronous code without interfering with the flow","currentLine":{"row":3,"column":11},"command":"node $file","debugMode":false,"outputs":1,"useSpawn":"false","field":"payload","fieldType":"msg","format":"javascript","template":"sleepSync(5000)\nconsole.log('Sync Node.js Hello World')\n\n// function\nfunction sleepSync(ms) {\n  var start = new Date().getTime(), expire = start + ms;\n  while (new Date().getTime() < expire) { }\n  return;\n}","output":"str","outputEmpty":false,"vimMode":true,"queue":"1","addpayCB":false,"splitLine":false,"cleanQueue":true,"x":550,"y":2740,"wires":[["23d228a61895ad97"]]},{"id":"0606fdcb05758e07","type":"inject","z":"ff922ddb.76cc18","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":200,"y":2740,"wires":[["523bf687a42cc31f"]]},{"id":"23d228a61895ad97","type":"debug","z":"ff922ddb.76cc18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","statusVal":"","statusType":"auto","x":910,"y":2740,"wires":[]}]
```
