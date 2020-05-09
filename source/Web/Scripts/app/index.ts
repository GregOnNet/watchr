import jquery from 'jquery';
import { ConsoleHub } from './modules/console-hub';

jquery(function () {
  new ConsoleHub().setUp({
    parent: jquery('#terminals'),
    hideOnConnection: jquery('#welcome'),
    status: jquery('#status'),
  });
});
