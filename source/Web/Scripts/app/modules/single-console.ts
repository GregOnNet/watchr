import { BufferedTerminal, TextReceived } from './buffered-terminal';
import { FitAddon } from 'xterm-addon-fit';
import * as XtermWebfont from 'xterm-webfont';
import { ResizeSensor } from 'css-element-queries';
import { Terminal } from 'xterm';

export interface SingleConsoleSettings {
  parent: JQuery<HTMLElement>;
  hideOnConnection: JQuery<HTMLElement>;
}

export class SingleConsole {
  _settings: SingleConsoleSettings;
  _sessionId: string;

  constructor(settings: SingleConsoleSettings, sessionId: string) {
    this._settings = settings;
    this._sessionId = 'session-' + sessionId.replace(/[\W\s]/g, '_');
  }

  private getTerminalDiv(element: JQuery<Element>) {
    return element.children().last()[0];
  }

  private async findOrCreateTerminal(): Promise<BufferedTerminal> {
    this._settings.hideOnConnection.hide();

    var element = this._settings.parent.find('section#' + this._sessionId);

    if (element.length) {
      return (this.getTerminalDiv(element) as any).terminalInstance();
    }

    element = $('<section>')
      .attr('id', this._sessionId)
      .append($('<header>').text(this._sessionId.replace(/\s.*/, '')))
      .append($('<div>').addClass('term'));

    this._settings.parent.append(element);
    var div = this.getTerminalDiv(element);

    var terminal = new BufferedTerminal({
      scrollback: 20000,
      cursorBlink: false,
      cursorStyle: 'block',
      fontFamily: 'Droid Sans Mono',
      fontSize: 13,
      disableStdin: true,
      theme: {
        foreground: '#000',
        background: '#fff',
        cursor: '#000',
        cursorAccent: '#000',
        selection: 'rgba(0, 52, 120, 0.25)',
        brightYellow: '#c4a000',
      },
    });

    terminal.loadAddon(new XtermWebfont());
    terminal.loadAddon(new FitAddon());

    (div as any).terminalInstance = () => terminal;

    await (terminal as any).loadWebfontAndOpen(div);
    this.autoFit(div, terminal);

    return terminal;
  }

  private autoFit(element: Element, terminal: Terminal) {
    (terminal as any).fit();
    new ResizeSensor(element, () => (terminal as any).fit());
  }

  public async textReceived(text: TextReceived) {
    const terminal = await this.findOrCreateTerminal();

    const buffering = terminal.writeBuffered(text);

    const element = $('section#' + this._sessionId, parent);
    if (buffering) {
      element.addClass('delayed');
    } else {
      element.removeClass('delayed');
    }

    return terminal;
  }

  public terminate() {
    $('section#' + this._sessionId, parent).addClass('terminated');
  }
}
