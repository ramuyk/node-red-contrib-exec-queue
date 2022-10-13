/** ////
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **///
module.exports = function(RED) {
	//// LIBRARIES
	"use strict";
	var mustache = require("mustache");
	var fs = require('fs');
	var terminate = require("terminate");
	var yaml = require("js-yaml");
	var convertXML = require('xml-js');
	var exec = require('child_process').exec;
	var spawn = require('child_process').spawn;
	var Queue = require('queue');
	///
	//// AUXILIARY FUNCTIONS
	function extractTokens(tokens,set) {
		set = set || new Set();
		tokens.forEach(function(token) {
			if (token[0] !== 'text') {
				set.add(token[1]);
				if (token.length > 4) {
					extractTokens(token[4],set);
				}
			}
		});
		return set;
	}

	function parseContext(key) {
		var match = /^(flow|global)(\[(\w+)\])?\.(.+)/.exec(key);
		if (match) {
			var parts = {};
			parts.type = match[1];
			parts.store = (match[3] === '') ? "default" : match[3];
			parts.field = match[4];
			return parts;
		}
		return undefined;
	}

	function parseEnv(key) {
        var match = /^env\.(.+)/.exec(key);
        if (match) {
            return match[1];
        }
        return undefined;
    }

	/**
	 * Custom Mustache Context capable to collect message property and node
	 * flow and global context
	 */

	function NodeContext(msg, nodeContext, parent, escapeStrings, cachedContextTokens) {
		this.msgContext = new mustache.Context(msg,parent);
		this.nodeContext = nodeContext;
		this.escapeStrings = escapeStrings;
		this.cachedContextTokens = cachedContextTokens;
	}

	NodeContext.prototype = new mustache.Context();

	NodeContext.prototype.lookup = function (name) {
		// try message first:
		try {
			var value = this.msgContext.lookup(name);
			if (value !== undefined) {
				if (typeof value === "object") {
					value = JSON.stringify(value)
				}
				if (this.escapeStrings && typeof value === "string") {
					value = value.replace(/\\/g, "\\\\");
					value = value.replace(/\n/g, "\\n");
					value = value.replace(/\t/g, "\\t");
					value = value.replace(/\r/g, "\\r");
					value = value.replace(/\f/g, "\\f");
					value = value.replace(/[\b]/g, "\\b");
				}
				return value;
			}

			// try env
            if (parseEnv(name)) {
                return this.cachedContextTokens[name];
            }

			// try flow/global context:
			var context = parseContext(name);
			if (context) {
				var type = context.type;
				var store = context.store;
				var field = context.field;
				var target = this.nodeContext[type];
				if (target) {
					return this.cachedContextTokens[name];
				}
			}
			return '';
		}
		catch(err) {
			throw err;
		}
	}

	NodeContext.prototype.push = function push (view) {
		return new NodeContext(view, this.nodeContext, this.msgContext, undefined, this.cachedContextTokens);
	};
	///

	function TemplateNode(n) {
		RED.nodes.createNode(this,n);
		//// SETTING VALUES
		this.name = n.name;
		this.field = n.field || "payload";
		this.template = n.template;
		this.syntax = n.syntax || "javascript";
		this.fieldType = n.fieldType || "msg";
		this.outputFormat = n.output || "str";

		this.cmd = (n.command || "").trim();
		this.append = (n.append || "").trim();
		this.useSpawn = n.useSpawn
		this.count = 0
		this.state = ""
		this.queue = n.queue
		this.executingCode = 0
		this.waitingForExecuting = 0
		this.processKilled = false
		this.statusTimerUp = new Date()
		this.statusTimerDown = new Date()
		this.addpayCB = n.addpayCB
		this.cmd = (n.command || "").trim();
		this.debugMode = n.debugMode
		//this.parsedJSON = n.parsedJSON
		this.splitLine = n.splitLine
		this.cleanQueue = n.cleanQueue

		if (n.addpay === undefined) { n.addpay = true; }
		this.addpay = n.addpay;
		this.append = (n.append || "").trim();
		this.useSpawn = (n.useSpawn == "true");
		this.timer = Number(n.timer || 0)*1000;
		this.activeProcesses = {};
		this.tempFiles = []
		this.oldrc = (n.oldrc || false).toString();
		//this.execOpt = {maxBuffer:50000000, windowsHide: (n.winHide === true)};
		//this.execOpt = {encoding:'binary', maxBuffer:50000000, windowsHide: (n.winHide === true)};
		this.execOpt = {maxBuffer:50000000, windowsHide: (n.winHide === true), detached: true};
		this.spawnOpt = {windowsHide: (n.winHide === true), detached: true }

		//		this.timer = Number(n.timer || 0)*1000;
		//		this.activeProcesses = {};
		//		this.oldrc = (n.oldrc || false).toString();
		//		this.execOpt = {encoding:'binary', maxBuffer:50000000, windowsHide: (n.winHide === true)};
		//		this.spawnOpt = {windowsHide: (n.winHide === true) }
		var node = this;
		///
		//// NODE INITIALIZATON SETUP
		if (process.platform === 'linux' && fs.existsSync('/bin/bash')) { node.execOpt.shell = '/bin/bash'; }

		var queue = Queue({ results: [], concurrency: node.queue, autostart: true})
		node.status({fill:"blue", shape:"ring", text: `0 (0/${node.queue})`});

		setInterval(() => {
			if ( node.executingCode !== 0 || node.waitingForExecuting !== 0 ){
				node.status({fill:"blue", shape:"ring", text: `${node.waitingForExecuting} (${node.executingCode}/${node.queue})`});
			}
		}, 1000)
		///

		node.on("input", function(msg, send, done) {
			msg.nodeName = node.name
			if ( msg._msgid === undefined ){
				output(msg, msg.message, send, done);
				delete msg.message
			} else { 
				const millisecondsUp  = ((new Date()).getTime() - node.statusTimerUp.getTime()) 
				node.statusTimerUp = new Date()
				try {
					//// RESOLVING THE TEMPLATE
					/***
					 * Allow template contents to be defined externally
					 * through inbound msg.template IFF node.template empty
					 */
					var template = node.template;
					if (msg.hasOwnProperty("template")) {
						if (template == "" || template === null) {
							template = msg.template;
						}
					}

					var promises = [];
					var tokens = extractTokens(mustache.parse(template));
					var resolvedTokens = {};
					tokens.forEach(function(name) {
						var env_name = parseEnv(name);
                        if (env_name) {
                            var promise = new Promise((resolve, reject) => {
                                var val = RED.util.evaluateNodeProperty(env_name, 'env', node)
                                resolvedTokens[name] = val;
                                resolve();
                            });
                            promises.push(promise);
                            return;
                        }

						var context = parseContext(name);
						if (context) {
							var type = context.type;
							var store = context.store;
							var field = context.field;
							var target = node.context()[type];
							if (target) {
								var promise = new Promise((resolve, reject) => {
									target.get(field, store, (err, val) => {
										if (err) {
											reject(err);
										} else {
											resolvedTokens[name] = val;
											resolve();
										}
									});
								});
								promises.push(promise);
								return;
							}
						}
					});
					///
					Promise.all(promises).then(function() {
						//// QUEUE LOGIC
						if ( node.useSpawn === false ){
							msg.lastMessage = false
						}
						if ( node.executingCode < node.queue ){
							node.executingCode++
						} else {
							node.waitingForExecuting++
						}
						if ( millisecondsUp > 100 ){
							node.status({fill:"blue", shape:"ring", text: `${node.waitingForExecuting} (${node.executingCode}/${node.queue})`});
						}

						queue.push(() => {
							return new Promise(function (resolve) {
								const millisecondsDown  = ((new Date()).getTime() - node.statusTimerDown.getTime()) 
								executeCode(msg, send, done, node, resolvedTokens).then(() => {
									node.statusTimerDown = new Date()
									if ( node.waitingForExecuting > 0){
										node.waitingForExecuting--
									} else if ( node.executingCode > 0 ){
										node.executingCode--
										if ( node.executingCode === 0 && node.useSpawn === false ){
											msg.lastMessage = true
										}
									}
									if ( node.processKilled === false && ( millisecondsDown > 100 || node.executingCode === 0) ){
										node.status({fill:"blue", shape:"ring", text: `${node.waitingForExecuting} (${node.executingCode}/${node.queue})`});
									}
									resolve()
								})
							})
						})
						///
					}).catch(function (err) {
						done(err.message);
					});
				} catch(err) {
					done(err.message);
				}
			}
		});

		node.on('close',function() {
			//// KILL PROCESSES AND ERASE FILES
			queue.end()
			node.executingCode = 0
			node.waitingForExecuting = 0
			node.processKilled = true
			for (var pid in node.activeProcesses) {
				/* istanbul ignore else  */
				if (node.activeProcesses.hasOwnProperty(pid)) {
					// process.kill(-pid, 9)
					terminate(pid)
					node.activeProcesses[pid] = null;
					node.warn(`Killing pid ${pid}`)
				}
			}

			for (let i = 0, len = node.tempFiles.length; i < len; i++) {
				fs.unlinkSync(nose.tempFiles[i])
			}
			node.activeProcesses = {};
			///
		});

		function executeCode(msg, send, done, node, resolvedTokens){
			return new Promise(resolve => {
				try {
					const is_json = (node.outputFormat === "parsedJSON");
					let template = node.template;
					if (msg.hasOwnProperty("template")) {
						if (template == "" || template === null) {
							template = msg.template;
						}
					}
					let value = mustache.render(template, new NodeContext(msg, node.context(), null, is_json, resolvedTokens));
					const addPayload = node.addpayCB ? msg.payload : ""

					let command = `${node.cmd} ${addPayload}`

					//// BASH SCRIPT THAT WILL BE EXECUTED
					const shellcode = `
export NODE_PATH="$NODE_PATH:$HOME/.node-red/node_modules:/usr/local/lib/node_modules"
file=$(mktemp)
cat > $file <<- "EOFEOF"
${value}
EOFEOF
chmod +x "$file"

${command}
code=$?
if [ -f $file ]; then rm $file;fi
if [ "$code" = 0 ]; then
	exit 0
else 
	exit "$code"
fi
`
///

					//// EXEC LOGIC
					if ( !node.useSpawn ) {
						// Exec Script
						const child = exec(shellcode, node.execOpt, (err, stdout, stderr) => {
							if (err) {
								const error = {}
								error.type = 'error'
								error.code = err.code
								error.killed = err.killed
								msg.error_info = error
								node.error(`error (${msg.nodeName})\n\n${stderr}`, msg)
							} else {
								if ( stderr ){
									node.error(`warning (${msg.nodeName})\n\n${stderr}`, msg)
								} 

								// Sending message to the next node
								if (stdout){
									stdout = stdout.trim()
									if ( node.splitLine === false ){
										output(msg, stdout, send, done);
									} else {
										stdout = stdout.split('\n')
										for (let i = 0; i < stdout.length; i++) {
											node.emit("input", {"message": stdout[i]})
										}
									}
									if ( node.debugMode === true ){
										node.warn(stdout)
									}
								}
							}
							delete node.activeProcesses[child.pid]
							resolve()
						})
						node.activeProcesses[child.pid] = child.pid;
					} // $exec
					///
					//// SPAWN LOGIC
					else {
						let stderr = false
						// spawn exec script
						const child = spawn('/bin/bash', [ '-c',  shellcode ], node.spawnOpt)
						node.activeProcesses[child.pid] = child.pid;

						child.stdout.on('data', (data) => {
							if ( node.splitLine === false ){
								output(msg, data.toString(), send, done);
							} else {
								data = data.toString().split('\n')
								for (let i = 0; i < data.length; i++) {
									if ( data[i] !== "" ){
										node.emit("input", {"message": data[i]})
									}
								}
							}
							if ( node.debugMode === true ){
								node.warn(messages[i].toString())
							}
						});

						child.stderr.on('data', (data) => {
							stderr = true
							node.error(`warning (${msg.nodeName})\n\n${data.toString()}`, msg)
						});

						child.on('close', (code) => {
							if ( code !== 0 ){
								const error = {}
								error.type = 'error'
								error.code = code
								msg.error_info = error
								node.error(`error (${msg.nodeName}): The node hasn't finished its execution`, msg)
							} 
							delete node.activeProcesses[child.pid];
							resolve()
						});

					}
				} catch(e){
					node.warn(e)
				}
			})
			///
		}

		function output(msg,value,send,done) {
			/* istanbul ignore else  */
			let parseError = false
			//// PARSE JSON
			if (node.outputFormat === "parsedJSON") {
				try {
					value = JSON.parse(value);
					if ( typeof value === 'number' ){
						parseError = true
						node.error('Error parsing JSON: \n\n' + error)
					}
				} catch (error){
					parseError = true
					node.error('Error parsing JSON: \n\n' + error)
				}
			}
			///
			//// PARSE XML
			if (node.outputFormat === "parsedXML") {
				try {
					//value = JSON.parse(convertXML.xml2json(value, {compact: true, spaces: 4}))
					value = convertXML.xml2js(value, {compact: true, spaces: 4})
				} catch (error){
					parseError = true
					node.error('Error parsing XML: \n\n' + error)
				}
			}
			///
			//// PARSE YAML
			/* istanbul ignore else  */
			if (node.outputFormat === "parsedYAML") {
				try {
					value = yaml.load(value);
					if ( typeof value === 'number' ){
						parseError = true
						node.error('Error parsing YAML: \n\n' + error)
					}
				} catch (error){
					parseError = true
					node.error('Error parsing YAML: \n\n' + error)
				}
			}
			///
			//// PARSE ERROR
			if ( parseError === false ){
				if (node.fieldType === 'msg') {
					RED.util.setMessageProperty(msg, node.field, value);
					send(msg);
					done();
				} else if ((node.fieldType === 'flow') ||
					(node.fieldType === 'global')) {
					var context = RED.util.parseContextStore(node.field);
					var target = node.context()[node.fieldType];
					target.set(context.key, value, context.store, function (err) {
						if (err) {
							done(err);
						} else {
							send(msg);
							done();
						}
					});
				}
			}
			///
		}

		Array.prototype.remove_by_value = function(val) {
			for (var i = 0; i < this.length; i++) {
				if (this[i] === val) {
					this.splice(i, 1);
					i--;
				}
			}
			return this;
		}
	}

	RED.nodes.registerType("exec queue",TemplateNode);
	RED.library.register("templates");
}
