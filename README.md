## Overview
A Node-RED alternative exec node that runs a template code with a queue.

![](https://raw.githubusercontent.com/rafaelmuynarsk/node-red-contrib-fast-debug-counter/main/gif/debug.gif)


Runs system commands on a queue and returns its output. This node puts together three concepts: the exec node, the template node, a queue.

## How to use
The template text works exactly the same as the template node. On the `Command` input it allows you to run the template by using `$file`. For example, `python3 $file` will get the code written inside the template and execute it with python.

