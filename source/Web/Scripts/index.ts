import { ConsoleHub } from './modules/console-hub';
import { SingleConsole } from './modules/single-console';
import { BufferedTerminal } from './modules/buffered-terminal';
import { Terminal } from 'xterm';

jQuery(function () {
  new ConsoleHub().setUp({
    parent: jQuery('#terminals'),
    hideOnConnection: jQuery('#welcome'),
    status: jQuery('#status'),
  });
});

// No idea why this has to show up here to be exported by rollup.
export { ConsoleHub, SingleConsole, BufferedTerminal, Terminal };
