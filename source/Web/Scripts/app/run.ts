import { ConsoleHub } from './modules/console-hub';

$(function () {
  new ConsoleHub().setUp({
    parent: $('#terminals'),
    hideOnConnection: $('#welcome'),
    status: $('#status'),
  });
});
