import { SingleConsole, SingleConsoleSettings } from './single-console';
import { TextReceived } from './buffered-terminal';

interface ConsoleHubSettings extends SingleConsoleSettings {
  status: JQuery<HTMLElement>;
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
      const console = new SingleConsole(this._settings, text.SessionId);
      await console.textReceived(text);
    });

    hub.on('terminate', (sessionId: string) => {
      const console = new SingleConsole(this._settings, sessionId);
      console.terminate();
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
