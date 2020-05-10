import { ConsoleView, ConsoleViewSettings } from './console-view';
import { Block } from './buffered-terminal';

interface ConsoleHubSettings extends ConsoleViewSettings {
  status: JQuery<HTMLElement>;
}

export interface TextReceived extends Block {
  SessionId?: string;
}

export class ConsoleHub {
  _settings: ConsoleHubSettings;

  public setUp(settings: ConsoleHubSettings) {
    this._settings = settings;

    this.connect(this.connection);
  }

  private get connection(): SignalR.Hub.Connection {
    var connection = jQuery.hubConnection(undefined, { logging: true });

    connection.error(error =>
      this._settings.status.attr('class', 'error').text(error.message),
    );

    connection.disconnected(async () => await this.connect(connection));

    connection.stateChanged(change => {
      if (change.newState === jQuery.signalR.connectionState.connecting) {
        this._settings.status.attr('class', 'warning');
        this._settings.status.text('Connecting...');
      }

      if (change.newState === jQuery.signalR.connectionState.reconnecting) {
        this._settings.status.attr('class', 'warning');
        this._settings.status.text('Reconnecting...');
      }

      if (change.newState === jQuery.signalR.connectionState.connected) {
        this._settings.status.attr('class', 'success');
        this._settings.status.text('Online');
      }

      if (change.newState === jQuery.signalR.connectionState.disconnected) {
        this._settings.status.attr('class', 'error');
        this._settings.status.text('Disconnected');
      }
    });

    return connection;
  }

  private get hub() {
    var hub = this.connection.createHubProxy('consoleHub');

    hub.on('text', async (text: TextReceived) => {
      const view = new ConsoleView(this._settings, text.SessionId);
      await view.textReceived(text);
    });

    hub.on('terminate', (sessionId: string) => {
      const view = new ConsoleView(this._settings, sessionId);
      view.terminate();
    });

    return hub;
  }

  private async connect(connection: SignalR.Connection) {
    await connection.start();

    try {
      await this.hub.invoke('joinGroup', window.location.search);
      console.log('Joined group with ' + window.location.search);
    } catch (error) {
      console.log('Could not join group. Error: ' + error);
    }
  }
}
