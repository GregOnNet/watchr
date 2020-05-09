/// <reference path='../../../source/Web/Scripts/modules/single-console.ts' />

describe(SingleConsole.name, function() {
  let terminal;
  let _console;
  let _parent;
  let _welcome;

  beforeEach(function() {
    _parent = $('<div>').attr('id', 'parent-container');
    _welcome = $('<div>').attr('id', 'welcome-container');
    setFixtures(_parent);
    setFixtures(_welcome);

    terminal = jasmine.createSpyObj('BufferedTerminal', [
      'loadWebfontAndOpen',
      'writeBuffered',
      'fit',
    ]);

    terminal.loadWebfontAndOpen.and.returnValue(
      new Promise(resolve => resolve(terminal))
    );

    spyOn(window, 'BufferedTerminal').and.returnValue(terminal);

    _console = new SingleConsole({ parent: _parent, hideOnConnection: _welcome }, 'id');
  });

  it('has a session id', function() {
    expect(_console.sessionId).toEqual('id');
  });

  describe('text received', function() {
    describe('new session started', function() {
      beforeEach(done => {
        _console.textReceived({ StartOffset: 0, Text: 'line 1' }).then(done);
      });

      it('hides welcome message', function() {
        expect(_welcome).toBeHidden();
      });

      it('creates a new terminal', function() {
        expect(_parent.find('section#session-id')).toExist();
      });

      it('sets terminal title', function() {
        expect(_parent.find('section#session-id header')).toHaveText('id');
      });

      it('creates container for xterm', function() {
        expect(_parent.find('section#session-id div.term')).toExist();
      });

      it('creates a xterm instance', function() {
        expect(terminal.loadWebfontAndOpen).toHaveBeenCalledWith(
          _parent.find('section#session-id div.term')[0]
        );
      });

      it('writes lines', function() {
        expect(terminal.write).toHaveBeenCalledWith('line 1');
      });

      it('fits the terminal to the screen', function() {
        expect(terminal.fit).toHaveBeenCalled();
      });
    });

    describe('text for running session', function() {
      beforeEach(done => {
        _console
          .text({
            StartOffset: 0,
            EndOffset: 'line 1'.length,
            Text: 'line 1'
          })
          .then(() =>
            _console.textReceived({ StartOffset: 'line 1'.length, Text: 'line 2' })
          )
          .then(done);
      });

      it('uses existing xterm instance', function() {
        expect(terminal.loadWebfontAndOpen.calls.count()).toEqual(1);
      });

      it('writes lines', function() {
        expect(terminal.write.calls.allArgs()).toEqual([
          ['line 1'],
          ['line 2']
        ]);
      });
    });

    describe('new session started with another session running', function() {
      beforeEach(done =>
        _console.textReceived({ StartOffset: 0, Text: 'line 1' }).then(done));

      it('creates a new terminal', done => {
        var second = new Console(_parent, _welcome, 'id-2');
        const parent = _parent;

        second.text({ StartOffset: 0, Text: 'line 1' }).then(() => {
          expect(parent.children()).toHaveLength(2);
          done();
        });
      });
    });

    describe('delayed text for new session', function() {
      beforeEach(done =>
        _console.textReceived({ StartOffset: 42, Text: 'line 2' }).then(done));

      it('starts session with delayed text', function() {
        expect(terminal.write).toHaveBeenCalledWith('line 2');
      });
    });

    describe('delayed text for running session', function() {
      beforeEach(done => {
        _console
          .text({
            StartOffset: 0,
            EndOffset: 'first'.length,
            Text: 'first'
          })
          .then(done);
      });

      it('marks warning for terminal', done => {
        _console
          .text({
            StartOffset: 'first-late'.length,
            Text: 'early'
          })
          .then(() => {
            expect(_parent.find('section#session-id')).toHaveClass('delayed');
            done();
          });
      });

      describe('delay resolved', function() {
        beforeEach(done => {
          _console
            .text({
              StartOffset: 'first'.length,
              EndOffset: 'first-late'.length,
              Text: 'late'
            })
            .then(() =>
              _console.textReceived({
                StartOffset: 'first-late'.length,
                Text: 'early'
              })
            )
            .then(done);
        });

        it('reorders text', function() {
          expect(terminal.write.calls.allArgs()).toEqual([
            ['first'],
            ['late'],
            ['early']
          ]);
        });

        it('removes warning', function() {
          expect(_parent.find('section#session-id')).not.toHaveClass('delayed');
        });
      });
    });
  });

  describe('session terminated', function() {
    beforeEach(done =>
      _console.textReceived({ StartOffset: 0, Text: 'line 1' }).then(done));

    it('disables the terminal', function() {
      _console.terminate();

      expect(_parent.find('section#session-id')).toHaveClass('terminated');
    });
  });
});
