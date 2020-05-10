import { ConsoleHub } from '../../source/Web/Scripts/modules/console-hub';

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

  // describe('running', () =>  {
  //   beforeEach(() =>  {
  //     console = jasmine.createSpyObj('ConsoleView',
  //                                         ['text', 'terminate']);

  //     spyOn(window, 'SingleConsole').and.returnValue(console);

  //     new ConsoleHub(window, parent, welcome);
  //   });

  //   describe('text received', () =>  {
  //     beforeEach(() =>  {
  //       text = { SessionId: 'id', Offset: 0, Text: 'text' };

  //       var textfn = hub.on.calls.argsFor(0)[1];
  //       textfn(text);
  //     });

  //     it('sends text to the console', () =>  {
  //       expect(console.text)
  //         .toHaveBeenCalledWith(text);
  //     });
  //   });

  //   describe('session terminated', () =>  {
  //     beforeEach(() =>  {
  //       sessionId = 'id';

  //       var terminatefn = hub.on.calls.argsFor(1)[1];
  //       terminatefn(sessionId);
  //     });

  //     it('terminates the console', () =>  {
  //       expect(console.terminate)
  //         .toHaveBeenCalled();
  //     });
  //   });
  // });
});
