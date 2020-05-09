import { ConsoleHub } from './modules/console-hub';

jQuery(function () {
  new ConsoleHub().setUp({
    parent: jQuery('#terminals'),
    hideOnConnection: jQuery('#welcome'),
    status: jQuery('#status'),
  });
});
