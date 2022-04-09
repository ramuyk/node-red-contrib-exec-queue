## Overview
A Node-RED alternative exec node that runs template code with a queue.

## Limitations

* Currently it doesn't work on Windows. It was tested and worked on Linux only
* Slow for sending a huge amount of messages at once (in my computer it takes around 2 minutes for executing 10 thousand processes that are only printing a message)

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
[{"id":"1fe0aad8f59279e6","type":"exec queue","z":"ff922ddb.76cc18","name":"node.js code","currentLine":{"row":0,"column":24},"command":"node $file","debugMode":false,"outputs":1,"useSpawn":"false","field":"payload","fieldType":"msg","format":"javascript","template":"console.log('Hello World')","output":"str","outputEmpty":false,"vimMode":true,"queue":"1","addpayCB":false,"splitLine":false,"cleanQueue":true,"x":290,"y":4200,"wires":[["067388d0f5f0bc63"]]},{"id":"c4bbe370378bc234","type":"inject","z":"ff922ddb.76cc18","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":155,"y":4200,"wires":[["1fe0aad8f59279e6"]],"l":false},{"id":"067388d0f5f0bc63","type":"debug","z":"ff922ddb.76cc18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":555,"y":4200,"wires":[],"l":false},{"id":"6d5e78de3114b886","type":"exec queue","z":"ff922ddb.76cc18","name":"bash code","currentLine":{"row":0,"column":18},"command":"bash $file","debugMode":false,"outputs":1,"useSpawn":"false","field":"payload","fieldType":"msg","format":"sh","template":"echo \"Hello World\"\n","output":"str","outputEmpty":false,"vimMode":true,"queue":"1","addpayCB":false,"splitLine":false,"cleanQueue":true,"x":290,"y":4320,"wires":[["49702ca370d9f756"]]},{"id":"4ebf5b2aa93f2b67","type":"inject","z":"ff922ddb.76cc18","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":155,"y":4320,"wires":[["6d5e78de3114b886"]],"l":false},{"id":"49702ca370d9f756","type":"debug","z":"ff922ddb.76cc18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":555,"y":4320,"wires":[],"l":false},{"id":"37a8a116aae3dce3","type":"exec queue","z":"ff922ddb.76cc18","name":"python code (template parameters)","currentLine":{"row":0,"column":22},"command":"python3 $file","debugMode":false,"outputs":1,"useSpawn":"false","field":"payload","fieldType":"msg","format":"python","template":"print('{{{payload}}}')","output":"str","outputEmpty":false,"vimMode":true,"queue":"1","addpayCB":false,"splitLine":false,"cleanQueue":true,"x":360,"y":4380,"wires":[["b35308b00d181b45"]]},{"id":"9c2c5923aff087f1","type":"inject","z":"ff922ddb.76cc18","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":155,"y":4380,"wires":[["37a8a116aae3dce3"]],"l":false},{"id":"b35308b00d181b45","type":"debug","z":"ff922ddb.76cc18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":555,"y":4380,"wires":[],"l":false},{"id":"038111031078bda8","type":"exec queue","z":"ff922ddb.76cc18","name":"python code (parsed json output)","currentLine":{"row":0,"column":1},"command":"python3 $file","debugMode":false,"outputs":1,"useSpawn":"false","field":"payload","fieldType":"msg","format":"python","template":"print('''\n{\n   \"value\": \"Hello World\" \n}\n\n''')","output":"parsedJSON","outputEmpty":false,"vimMode":true,"queue":"1","addpayCB":false,"splitLine":false,"cleanQueue":true,"x":350,"y":4620,"wires":[["6bf711436e4c78b2"]]},{"id":"e61f3df446be8e0e","type":"inject","z":"ff922ddb.76cc18","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":155,"y":4620,"wires":[["038111031078bda8"]],"l":false},{"id":"6bf711436e4c78b2","type":"debug","z":"ff922ddb.76cc18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":555,"y":4620,"wires":[],"l":false},{"id":"a9e08253657428c1","type":"exec queue","z":"ff922ddb.76cc18","name":"python code (exec sleep 3)","currentLine":{"row":6,"column":2},"command":"python3 $file ","debugMode":false,"outputs":1,"useSpawn":"false","field":"payload","fieldType":"msg","format":"python","template":"import time\n\ntime.sleep(3)\nprint(\"Hello World\")\ntime.sleep(3)\nprint(\"Hello World\")\ntime.sleep(3)\nprint(\"Hello World\")","output":"str","outputEmpty":false,"vimMode":true,"queue":"1","addpayCB":false,"splitLine":false,"cleanQueue":true,"x":340,"y":4500,"wires":[["6c5a597dd98e3c69"]]},{"id":"71ed70de01f00df6","type":"inject","z":"ff922ddb.76cc18","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":155,"y":4500,"wires":[["a9e08253657428c1"]],"l":false},{"id":"6c5a597dd98e3c69","type":"debug","z":"ff922ddb.76cc18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":555,"y":4500,"wires":[],"l":false},{"id":"3c40817b162d1ba9","type":"exec queue","z":"ff922ddb.76cc18","name":"python code (spawn sleep 3)","currentLine":{"row":8,"column":0},"command":"python3 -u $file","debugMode":false,"outputs":1,"useSpawn":"true","field":"payload","fieldType":"msg","format":"python","template":"import time\n\ntime.sleep(3)\nprint(\"Hello World\")\ntime.sleep(3)\nprint(\"Hello World\")\ntime.sleep(3)\nprint(\"Hello World\")\n","output":"str","outputEmpty":false,"vimMode":true,"queue":"1","addpayCB":false,"splitLine":false,"cleanQueue":true,"x":340,"y":4560,"wires":[["15f2032281da3432"]]},{"id":"3316a7a3cc4bbdb6","type":"inject","z":"ff922ddb.76cc18","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":155,"y":4560,"wires":[["3c40817b162d1ba9"]],"l":false},{"id":"15f2032281da3432","type":"debug","z":"ff922ddb.76cc18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":555,"y":4560,"wires":[],"l":false},{"id":"34e8cb4e37f2d8a9","type":"exec queue","z":"ff922ddb.76cc18","name":"python code (queue)","currentLine":{"row":3,"column":2},"command":"python3 $file","debugMode":false,"outputs":1,"useSpawn":"false","field":"payload","fieldType":"msg","format":"python","template":"import time\n\ntime.sleep(3)\nprint(\"Hello World\")","output":"str","outputEmpty":false,"vimMode":true,"queue":"3","addpayCB":false,"splitLine":false,"cleanQueue":true,"x":320,"y":4440,"wires":[["558c5a8f111dbef9"]]},{"id":"376c02853cd956fb","type":"inject","z":"ff922ddb.76cc18","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":155,"y":4440,"wires":[["34e8cb4e37f2d8a9"]],"l":false},{"id":"558c5a8f111dbef9","type":"debug","z":"ff922ddb.76cc18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":555,"y":4440,"wires":[],"l":false},{"id":"623a2f138efe29ed","type":"exec queue","z":"ff922ddb.76cc18","name":"using node.js synchronous code without interfering with the flow","currentLine":{"row":0,"column":0},"command":"node $file","debugMode":false,"outputs":1,"useSpawn":"false","field":"payload","fieldType":"msg","format":"javascript","template":"sleepSync(5000)\nconsole.log('Sync Node.js Hello World')\n\n// function\nfunction sleepSync(ms) {\n  var start = new Date().getTime(), expire = start + ms;\n  while (new Date().getTime() < expire) { }\n  return;\n}","output":"str","outputEmpty":false,"vimMode":true,"queue":"1","addpayCB":false,"splitLine":false,"cleanQueue":true,"x":450,"y":4260,"wires":[["17e18b61b0e44bea"]]},{"id":"4de7adfb59574592","type":"inject","z":"ff922ddb.76cc18","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":155,"y":4260,"wires":[["623a2f138efe29ed"]],"l":false},{"id":"17e18b61b0e44bea","type":"debug","z":"ff922ddb.76cc18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":725,"y":4260,"wires":[],"l":false},{"id":"d9f0145631e0c10c","type":"inject","z":"ff922ddb.76cc18","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":845,"y":4260,"wires":[["7571802f132d43f8"]],"l":false},{"id":"7571802f132d43f8","type":"function","z":"ff922ddb.76cc18","name":"using synchronous code interfering with the flow","func":"sleepSync(5000)\nmsg.payload = 'Sync Node.js Hello World'\nreturn msg\n\n// function\nfunction sleepSync(ms) {\n  var start = new Date().getTime(), expire = start + ms;\n  while (new Date().getTime() < expire) { }\n  return;\n}","outputs":1,"noerr":0,"initialize":"","finalize":"","libs":[],"x":1080,"y":4260,"wires":[["2325d1e2296efe00"]]},{"id":"2325d1e2296efe00","type":"debug","z":"ff922ddb.76cc18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":1315,"y":4260,"wires":[],"l":false}]
```
