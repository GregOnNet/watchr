import { ConsoleHub } from '../../source/Web/Scripts/modules/console-hub';
import * as ConsoleViewFunctions from '../../source/Web/Scripts/modules/console-view';
import { ConsoleView } from '../../source/Web/Scripts/modules/console-view';

describe(ConsoleHub.name, () => {
  let group: string;
  let connection: SignalR.Hub.Connection;
  let hub: SignalR.Hub.Proxy;
  let parent;
  let hideOnConnection;
  let status;

  beforeEach(() => {
    hub = jasmine.createSpyObj('Hub', {
      on: undefined,
      invoke: Promise.resolve(),
    });

    connection = jasmine.createSpyObj(
      'SignalR.Hub.Connection',
      {
        createHubProxy: hub,
        error: undefined,
        disconnected: undefined,
        stateChanged: undefined,
        start: Promise.resolve(),
      },
      { logging: false },
    );

    $.hubConnection = jasmine
      .createSpy('hubConnection')
      .and.returnValue(connection);

    parent = $('#parent-container');
    hideOnConnection = $('#welcome-container');
    status = $('#status');
    group = '?something';
  });

  describe('setup', () => {
    beforeEach(async () => {
      await new ConsoleHub().setUp({
        parent: parent,
        hideOnConnection: hideOnConnection,
        status: status,
        group: group,
      });
    });

    it('enables logging', () => {
      expect($.hubConnection).toHaveBeenCalledWith(undefined, {
        logging: true,
      });
    });

    it('handles connection errors', () => {
      expect(connection.error).toHaveBeenCalledWith(jasmine.any(Function));
    });

    it('handles disconnects', () => {
      expect(connection.disconnected).toHaveBeenCalledWith(
        jasmine.any(Function),
      );
    });

    it('handles connection state changes', () => {
      expect(connection.stateChanged).toHaveBeenCalledWith(
        jasmine.any(Function),
      );
    });

    it('creates the hub', () => {
      expect(connection.createHubProxy).toHaveBeenCalledWith('consoleHub');
    });

    it('handles hub "text" events', () => {
      expect(hub.on).toHaveBeenCalledWith('text', jasmine.any(Function));
    });

    it('handles hub "terminate" events', () => {
      expect(hub.on).toHaveBeenCalledWith('terminate', jasmine.any(Function));
    });

    it('starts the connection', () => {
      expect(connection.start).toHaveBeenCalled();
    });

    it('joins group with query string', () => {
      expect(hub.invoke).toHaveBeenCalledWith('joinGroup', group);
    });
  });

  describe('runtime', () => {
    const sessionId = 'session id';
    let console: ConsoleView;

    beforeEach(async () => {
      console = jasmine.createSpyObj('ConsoleView', [
        'textReceived',
        'terminate',
      ]);

      spyOn(ConsoleViewFunctions, 'ConsoleView').and.returnValue(console);

      await new ConsoleHub().setUp({
        parent: parent,
        hideOnConnection: hideOnConnection,
        status: status,
      });
    });

    describe('text received', () => {
      let text = {
        SessionId: sessionId,
        StartOffset: 0,
        EndOffset: 'text'.length,
        Text: 'text',
      };

      beforeEach(() => {
        const subscriber = (hub.on as jasmine.Spy).calls.argsFor(0)[1];
        subscriber(text);
      });

      it('sends text to the console', () => {
        expect(console.textReceived).toHaveBeenCalledWith(text);
      });
    });

    describe('session terminated', () => {
      beforeEach(() => {
        const subscriber = (hub.on as jasmine.Spy).calls.argsFor(1)[1];
        subscriber(sessionId);
      });

      it('terminates the console', () => {
        expect(console.terminate).toHaveBeenCalled();
      });
    });
  });
});
