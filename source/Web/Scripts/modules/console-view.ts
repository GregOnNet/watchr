import { BufferedTerminal } from './buffered-terminal';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import * as XtermWebfont from 'xterm-webfont';
import { ResizeSensor } from 'css-element-queries';
import { Terminal } from 'xterm';
import { TextReceived } from './console-hub';

export interface ConsoleViewSettings {
  parent: JQuery<HTMLElement>;
  hideOnConnection: JQuery<HTMLElement>;
}

export class ConsoleView {
  private _settings: ConsoleViewSettings;
  private _sessionId: string;

  constructor(settings: ConsoleViewSettings, sessionId: string) {
    this._settings = settings;
    this._sessionId = sessionId;
  }

  public get container(): JQuery<Element> {
    return this._settings.parent.find('section#' + this.containerId);
  }

  private get containerId(): string {
    return this._sessionId.replace(/[\W\s]/g, '_');
  }

  private async findOrCreateTerminal(): Promise<BufferedTerminal> {
    if (this.container.length) {
      return (this.container[0] as any).terminalInstance;
    }

    this._settings.hideOnConnection.hide();

    const terminalDiv = $('<div>').addClass('term');
    const container = $('<section>')
      .attr('id', this.containerId)
      .append($('<header>').text(this._sessionId))
      .append(terminalDiv);

    this._settings.parent.append(container);

    const terminal = new BufferedTerminal({
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

    // This is borked when rolled up.
    try {
      terminal.loadAddon(new XtermWebfont());
    } catch {
      (terminal as any).loadWebfontAndOpen = (el: HTMLElement) =>
        terminal.open(el);
    }

    terminal.loadAddon(new WebLinksAddon());
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    (container[0] as any).terminalInstance = terminal;

    await (terminal as any).loadWebfontAndOpen(terminalDiv[0]);
    this.autoFit(terminalDiv[0], fitAddon);

    return terminal;
  }

  private autoFit(element: Element, fitAddon: FitAddon) {
    fitAddon.fit();
    new ResizeSensor(element, () => fitAddon.fit());
  }

  public async textReceived(text: TextReceived) {
    const terminal = await this.findOrCreateTerminal();

    const result = terminal.writeBuffered(text);

    const addOrRemoveClass = result.buffering
      ? this.container.addClass.bind(this.container)
      : this.container.removeClass.bind(this.container);

    addOrRemoveClass('delayed');
  }

  public terminate(): void {
    this.container.addClass('terminated');
  }
}
