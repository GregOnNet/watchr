import { ConsoleView, ConsoleViewSettings } from './console-view';
import { Block } from './buffered-terminal';

interface ConsoleHubSettings extends ConsoleViewSettings {
  status: JQuery<HTMLElement>;
  group?: string;
}

export interface TextReceived extends Block {
  SessionId?: string;
}

export class ConsoleHub {
  private _settings: ConsoleHubSettings;
  private _connection: SignalR.Hub.Connection;

  public async setUp(settings: ConsoleHubSettings) {
    this._settings = settings;

    await this.connect(this.connection);
  }

  private get connection(): SignalR.Hub.Connection {
    if (this._connection) {
      return this._connection;
    }

    this._connection = jQuery.hubConnection(undefined, { logging: true });

    this._connection.error(error =>
      this._settings.status.attr('class', 'error').text(error.message),
    );

    this._connection.disconnected(() => {
      setTimeout(() => this.connect(this._connection), 5000);
    });

    this._connection.stateChanged(change => {
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

    return this.connection;
  }

  private get hub(): SignalR.Hub.Proxy {
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
      await this.hub.invoke('joinGroup', this._settings.group);
      console.log('Joined group with ' + this._settings.group);
    } catch (error) {
      console.log('Could not join group. Error: ' + error);
    }
  }
}
