/// <reference path='../../../source/Web/Scripts/modules/console-hub.ts' />

describe(ConsoleHub.name, function() {
  beforeEach(function() {
    this.window = {
      location: {
        search: "?something"
      }
    };

    this.hub = {
      on: jasmine.createSpy('on'),
      invoke: jasmine.createSpy('invoke')
                     .and.returnValue($.Deferred().resolve().promise())
    };

    this.connection = {
      logging: false,
      createHubProxy: jasmine.createSpy('createHubProxy')
                             .and.returnValue(this.hub),
      error: jasmine.createSpy('error'),
      disconnected: jasmine.createSpy('disconnected'),
      stateChanged: jasmine.createSpy('stateChanged'),
      start: jasmine.createSpy('start')
                    .and.returnValue($.Deferred().resolve().promise())
    };

    $.hubConnection = jasmine.createSpy('hubConnection')
                             .and.returnValue(this.connection);

    this.parent = $('#parent-container');
    this.welcome = $('#welcome-container');
  });

  describe('setup', function() {
    beforeEach(function() {
      new ConsoleHub().setUp(this.window, this.parent, this.welcome);
    });

    it('enables logging', function () {
      expect(this.connection.logging)
        .toEqual(true);
    });

    it('handles connection errors', function () {
      expect(this.connection.error)
        .toHaveBeenCalledWith(jasmine.any(Function));
    });

    it('handles disconnects', function () {
      expect(this.connection.disconnected)
        .toHaveBeenCalledWith(jasmine.any(Function));
    });

    it('handles connection state changes', function () {
      expect(this.connection.stateChanged)
        .toHaveBeenCalledWith(jasmine.any(Function));
    });

    it('creates the hub', function() {
      expect(this.connection.createHubProxy)
        .toHaveBeenCalledWith('consoleHub');
    });

    it('handles hub "text" events', function() {
      expect(this.hub.on)
        .toHaveBeenCalledWith('text', jasmine.any(Function));
    });

    it('handles hub "terminate" events', function() {
      expect(this.hub.on)
        .toHaveBeenCalledWith('terminate', jasmine.any(Function));
    });

    it('starts the connection', function() {
      expect(this.connection.start)
        .toHaveBeenCalled();
    });

    it('joins group with query string', function() {
      expect(this.hub.invoke)
        .toHaveBeenCalledWith('joinGroup', this.window.location.search);
    });
  });

  describe('running', function() {
    beforeEach(function() {
      this.console = jasmine.createSpyObj('SingleConsole',
                                          ['text', 'terminate']);

      spyOn(window, 'SingleConsole').and.returnValue(this.console);

      new ConsoleHub().setUp(this.window, this.parent, this.welcome);
    });

    describe('text received', function() {
      beforeEach(function() {
        this.text = { SessionId: 'id', Offset: 0, Text: 'text' };

        var textfn = this.hub.on.calls.argsFor(0)[1];
        textfn(this.text);
      });

      it('sends text to the console', function() {
        expect(this.console.text)
          .toHaveBeenCalledWith(this.text);
      });
    });

    describe('session terminated', function() {
      beforeEach(function() {
        this.sessionId = 'id';

        var terminatefn = this.hub.on.calls.argsFor(1)[1];
        terminatefn(this.sessionId);
      });

      it('terminates the console', function() {
        expect(this.console.terminate)
          .toHaveBeenCalled();
      });
    });
  });
});
