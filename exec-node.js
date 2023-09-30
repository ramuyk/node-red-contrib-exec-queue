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
module.exports = function (RED) {
    //* libraries
    "use strict";
    var mustache = require("mustache");
    var fs = require('fs');
    var tmp = require('tmp-promise');
    var fsPromises = require('fs').promises;
    var terminate = require("terminate");
    var yaml = require("js-yaml");
    var convertXML = require('xml-js');
    var exec = require('child_process').exec;
    var spawn = require('child_process').spawn;
    var Queue = require('queue');
    //* auxiliary functions
      //** function: extractTokens
    function extractTokens(tokens, set) {
        set = set || new Set();
        tokens.forEach(function (token) {
            if (token[0] !== 'text') {
                set.add(token[1]);
                if (token.length > 4) {
                    extractTokens(token[4], set);
                }
            }
        });
        return set;
    }

      //** function: parseContext
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

      //** function: parseEnv
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

      //** function: remove_by_value (prototype)
    Array.prototype.remove_by_value = function (val) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] === val) {
                this.splice(i, 1);
                i--;
            }
        }
        return this;
    }
      //** function: NodeContext
    function NodeContext(msg, nodeContext, parent, escapeStrings, cachedContextTokens) {
        this.msgContext = new mustache.Context(msg, parent);
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
        catch (err) {
            throw err;
        }
    }

    NodeContext.prototype.push = function push(view) {
        return new NodeContext(view, this.nodeContext, this.msgContext, undefined, this.cachedContextTokens);
    };
    ///

    //* ExecQueueNode
    function ExecQueueNode(n) {
        //** setting values
        RED.nodes.createNode(this, n);
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
        this.timer = Number(n.timer || 0) * 1000;
        this.activeProcesses = {};
        this.tempFiles = []
        this.oldrc = (n.oldrc || false).toString();
        //this.execOpt = {maxBuffer:50000000, windowsHide: (n.winHide === true)};
        //this.execOpt = {encoding:'binary', maxBuffer:50000000, windowsHide: (n.winHide === true)};
        this.execOpt = { maxBuffer: 50000000, windowsHide: (n.winHide === true), detached: true };
        this.spawnOpt = { windowsHide: (n.winHide === true), detached: true }

        //    this.timer = Number(n.timer || 0)*1000;
        //    this.activeProcesses = {};
        //    this.oldrc = (n.oldrc || false).toString();
        //    this.execOpt = {encoding:'binary', maxBuffer:50000000, windowsHide: (n.winHide === true)};
        //    this.spawnOpt = {windowsHide: (n.winHide === true) }
        var node = this;
        //** node initialization setup
        if (process.platform === 'linux' && fs.existsSync('/bin/bash')) { node.execOpt.shell = '/bin/bash'; }

        var queue = Queue({ results: [], concurrency: node.queue, autostart: true })
        node.status({ fill: "blue", shape: "ring", text: `0 (0/${node.queue})` });

        setInterval(() => {
            if (node.executingCode !== 0 || node.waitingForExecuting !== 0) {
                node.status({ fill: "blue", shape: "ring", text: `${node.waitingForExecuting} (${node.executingCode}/${node.queue})` });
            }
        }, 1000)

        //** node.on('input')
        node.on("input", async function (msg, send, done) {
            try {
                msg.nodeName = node.name;

                if (msg._msgid === undefined) {
                    output(msg, msg.message, send, done);
                    delete msg.message;
                    return;
                }

                const millisecondsUp = ((new Date()).getTime() - node.statusTimerUp.getTime());
                node.statusTimerUp = new Date();

                // resolving templates
                const resolvedTokens = await resolveTemplate(msg);

                // queue logic
                if (node.useSpawn === false) {
                    msg.lastMessage = false;
                }
                if (node.executingCode < node.queue) {
                    node.executingCode++;
                } else {
                    node.waitingForExecuting++;
                }
                if (millisecondsUp > 100) {
                    node.status({ fill: "blue", shape: "ring", text: `${node.waitingForExecuting} (${node.executingCode}/${node.queue})` });
                }

                await new Promise(resolve => {
                    queue.push(async () => {
                        try {
                            const millisecondsDown = ((new Date()).getTime() - node.statusTimerDown.getTime());
                            await executeCode(msg, send, done, node, resolvedTokens);
                            node.statusTimerDown = new Date();

                            if (node.waitingForExecuting > 0) {
                                node.waitingForExecuting--;
                            } else if (node.executingCode > 0) {
                                node.executingCode--;
                                if (node.executingCode === 0 && node.useSpawn === false) {
                                    msg.lastMessage = true;
                                }
                            }
                            if (node.processKilled === false && (millisecondsDown > 100 || node.executingCode === 0)) {
                                node.status({ fill: "blue", shape: "ring", text: `${node.waitingForExecuting} (${node.executingCode}/${node.queue})` });
                            }
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    });
                });

            } catch (err) {
                done(err.message);
            }
        });


        //** node.on('close')
        node.on('close', async function () {
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
                await fsPromises.unlink(file);
            }
            node.activeProcesses = {};
        });

        //** executeCode
        async function executeCode(msg, send, done, node, resolvedTokens) {
            const is_json = (node.outputFormat === "parsedJSON");
            let template = node.template || msg.template;
            const value = mustache.render(template, new NodeContext(msg, node.context(), null, is_json, resolvedTokens));
            const addPayload = node.addpayCB ? msg.payload : "";

            // Create a temporary file asynchronously
            const tmpObj = await tmp.file();
            await fsPromises.writeFile(tmpObj.path, value, 'utf8');
            
            let shellcode;
            if (process.platform === 'win32') {  // For Windows
                shellcode = `${node.cmd} ${addPayload} ${tmpObj.path}`;
            } else {  // For Linux and macOS
                shellcode = `
export NODE_PATH="$NODE_PATH:$HOME/.node-red/node_modules:/usr/local/lib/node_modules"
${node.cmd} ${addPayload} ${tmpObj.path}
            `;
            }

            try {
                if (!node.useSpawn) {
                    await executeWithExec(shellcode, node, msg, send, done);
                } else {
                    await executeWithSpawn(shellcode, node, msg, send, done);
                }
            } finally {
                await tmpObj.cleanup();
            }
        }

        async function executeWithExec(shellcode, node, msg, send, done) {
            return new Promise((resolve) => {
                const child = exec(shellcode, node.execOpt, (err, stdout, stderr) => {
                    if (err) {
                        const error = {
                            type: 'error',
                            code: err.code,
                            killed: err.killed
                        };
                        msg.error_info = error;
                        node.error(`error (${msg.nodeName})\n\n${stderr}`, msg);
                    } else {
                        if (stderr) {
                            node.error(`warning (${msg.nodeName})\n\n${stderr}`, msg);
                        }

                        if (stdout) {
                            stdout = stdout.trim();
                            if (node.splitLine === false) {
                                output(msg, stdout, send, done);
                            } else {
                                stdout = stdout.split('\n');
                                for (let i = 0; i < stdout.length; i++) {
                                    node.emit("input", { "message": stdout[i] });
                                }
                            }
                            if (node.debugMode === true) {
                                node.warn(stdout);
                            }
                        }
                    }
                    delete node.activeProcesses[child.pid];
                    resolve();
                });
                node.activeProcesses[child.pid] = child.pid;
            });
        }

        async function executeWithSpawn(shellcode, node, msg, send, done) {
            return new Promise((resolve, reject) => {
                const child = spawn('/bin/bash', ['-c', shellcode], node.spawnOpt);
                node.activeProcesses[child.pid] = child.pid;

                child.stdout.on('data', (data) => {
                    data = data.toString();
                    if (node.splitLine === false) {
                        output(msg, data, send, done);
                    } else {
                        const lines = data.split('\n');
                        for (let line of lines) {
                            if (line) {
                                node.emit("input", { "message": line });
                            }
                        }
                    }
                    if (node.debugMode === true) {
                        node.warn(data);
                    }
                });

                child.stderr.on('data', (data) => {
                    node.error(`warning (${msg.nodeName})\n\n${data.toString()}`, msg);
                });

                child.on('close', (code) => {
                    if (code !== 0) {
                        const error = {
                            type: 'error',
                            code: code
                        };
                        msg.error_info = error;
                        node.error(`error (${msg.nodeName}): The node hasn't finished its execution`, msg);
                        reject(new Error(`Child process exited with code ${code}`));
                    }
                    delete node.activeProcesses[child.pid];
                    resolve();
                });
            });
        }

        //** resolveTemplate
        async function resolveTemplate(msg) {
            var template = node.template;
            if (msg.hasOwnProperty("template")) {
                if (template == "" || template === null) {
                    template = msg.template;
                }
            }

            var resolvedTokens = {};
            var tokens = extractTokens(mustache.parse(template));

            // Iterate over the extracted tokens to resolve their values.
            for (let name of tokens) {
                let env_name = parseEnv(name);
                if (env_name) {
                    resolvedTokens[name] = RED.util.evaluateNodeProperty(env_name, 'env', node);
                    continue;
                }

                // Check if the token refers to a flow or global context variable.
                let context = parseContext(name);
                if (context) {
                    let type = context.type;
                    let store = context.store;
                    let field = context.field;
                    let target = node.context()[type];
                    if (target) {
                        resolvedTokens[name] = await new Promise((resolve, reject) => {
                            target.get(field, store, (err, val) => {
                                if (err) reject(err);
                                else resolve(val);
                            });
                        });
                    }
                }
            }

            return resolvedTokens;
        }
        //** function: output
        function output(msg, value, send, done) {
            /* istanbul ignore else  */
            let parseError = false
            //*** parse json
            if (node.outputFormat === "parsedJSON") {
                try {
                    value = JSON.parse(value);
                    if (typeof value === 'number') {
                        parseError = true
                        node.error('Error parsing JSON: \n\n' + error)
                    }
                } catch (error) {
                    parseError = true
                    node.error('Error parsing JSON: \n\n' + error)
                }
            }

            //*** parse xml
            if (node.outputFormat === "parsedXML") {
                try {
                    //value = JSON.parse(convertXML.xml2json(value, {compact: true, spaces: 4}))
                    value = convertXML.xml2js(value, { compact: true, spaces: 4 })
                } catch (error) {
                    parseError = true
                    node.error('Error parsing XML: \n\n' + error)
                }
            }

            //*** parse yaml
            if (node.outputFormat === "parsedYAML") {
                try {
                    value = yaml.load(value);
                    if (typeof value === 'number') {
                        parseError = true
                        node.error('Error parsing YAML: \n\n' + error)
                    }
                } catch (error) {
                    parseError = true
                    node.error('Error parsing YAML: \n\n' + error)
                }
            }

            //*** parse error
            if (parseError === false) {
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
        }

    }

    //* end
    RED.nodes.registerType("exec queue", ExecQueueNode);
    RED.library.register("templates");
}
