import {
  BufferedTerminal,
  TextReceived,
} from '../../source/Web/Scripts/modules/buffered-terminal';
import { SingleConsole } from '../../source/Web/Scripts/modules/single-console';

describe(SingleConsole.name, () => {
  let terminal: BufferedTerminal;
  let _console: SingleConsole;
  let _parent;
  let _welcome;
  let _sessionId: string;

  beforeEach(() => {
    _sessionId = 'session id';

    _parent = $('<div>').attr('id', 'parent-container');
    _welcome = $('<div>').attr('id', 'welcome-container');
    setFixtures(_parent);
    setFixtures(_welcome);

    terminal = jasmine.createSpyObj('BufferedTerminal', [
      'loadWebfontAndOpen',
      'writeBuffered',
      'fit',
    ]);

    (terminal as any).loadWebfontAndOpen.and.returnValue(
      new Promise(resolve => resolve(terminal)),
    );

    spyOn(window, 'BufferedTerminal').and.returnValue(terminal);

    _console = new SingleConsole(
      { parent: _parent, hideOnConnection: _welcome },
      _sessionId,
    );
  });

  it('has a session id', () => {
    expect(_console._sessionId).toEqual(_sessionId);
  });

  describe('text received', () => {
    describe('new session started', () => {
      let _event: TextReceived;

      beforeEach(async () => {
        _event = {
          SessionId: _sessionId,
          StartOffset: 0,
          EndOffset: 42,
          Text: 'line 1',
        };

        await _console.textReceived(_event);
      });

      it('hides welcome message', () => {
        expect(_welcome).toBeHidden();
      });

      it('creates a new terminal', () => {
        expect(_parent.find('section#session-id')).toExist();
      });

      it('sets terminal title', () => {
        expect(_parent.find('section#session-id header')).toHaveText('id');
      });

      it('creates container for xterm', () => {
        expect(_parent.find('section#session-id div.term')).toExist();
      });

      it('creates a xterm instance', () => {
        expect((terminal as any).loadWebfontAndOpen).toHaveBeenCalledWith(
          _parent.find('section#session-id div.term')[0],
        );
      });

      it('writes lines', () => {
        expect(terminal.writeBuffered).toHaveBeenCalledWith(_event);
      });

      it('fits the terminal to the screen', () => {
        expect((terminal as any).fit).toHaveBeenCalled();
      });
    });

    // xdescribe('text for running session', () => {
    //   beforeEach(done => {
    //     _console
    //       .text({
    //         StartOffset: 0,
    //         EndOffset: 'line 1'.length,
    //         Text: 'line 1',
    //       })
    //       .then(() =>
    //         _console.textReceived({
    //           StartOffset: 'line 1'.length,
    //           Text: 'line 2',
    //         }),
    //       )
    //       .then(done);
    //   });

    //   it('uses existing xterm instance', () => {
    //     expect(terminal.loadWebfontAndOpen.calls.count()).toEqual(1);
    //   });

    //   it('writes lines', () => {
    //     expect(terminal.write.calls.allArgs()).toEqual([
    //       ['line 1'],
    //       ['line 2'],
    //     ]);
    //   });
    // });

    // xdescribe('new session started with another session running', () => {
    //   beforeEach(done =>
    //     _console.textReceived({ StartOffset: 0, Text: 'line 1' }).then(done),
    //   );

    //   it('creates a new terminal', done => {
    //     var second = new Console(_parent, _welcome, 'id-2');
    //     const parent = _parent;

    //     second.text({ StartOffset: 0, Text: 'line 1' }).then(() => {
    //       expect(parent.children()).toHaveLength(2);
    //       done();
    //     });
    //   });
    // });

    // xdescribe('delayed text for new session', () => {
    //   beforeEach(done =>
    //     _console.textReceived({ StartOffset: 42, Text: 'line 2' }).then(done),
    //   );

    //   it('starts session with delayed text', () => {
    //     expect(terminal.write).toHaveBeenCalledWith('line 2');
    //   });
    // });

    // xdescribe('delayed text for running session', () => {
    //   beforeEach(done => {
    //     _console
    //       .text({
    //         StartOffset: 0,
    //         EndOffset: 'first'.length,
    //         Text: 'first',
    //       })
    //       .then(done);
    //   });

    //   it('marks warning for terminal', done => {
    //     _console
    //       .text({
    //         StartOffset: 'first-late'.length,
    //         Text: 'early',
    //       })
    //       .then(() => {
    //         expect(_parent.find('section#session-id')).toHaveClass('delayed');
    //         done();
    //       });
    //   });

    //   describe('delay resolved', () => {
    //     beforeEach(done => {
    //       _console
    //         .text({
    //           StartOffset: 'first'.length,
    //           EndOffset: 'first-late'.length,
    //           Text: 'late',
    //         })
    //         .then(() =>
    //           _console.textReceived({
    //             StartOffset: 'first-late'.length,
    //             Text: 'early',
    //           }),
    //         )
    //         .then(done);
    //     });

    //     it('reorders text', () => {
    //       expect(terminal.write.calls.allArgs()).toEqual([
    //         ['first'],
    //         ['late'],
    //         ['early'],
    //       ]);
    //     });

    //     it('removes warning', () => {
    //       expect(_parent.find('section#session-id')).not.toHaveClass('delayed');
    //     });
    //   });
    // });
    // });

    // xdescribe('session terminated', () => {
    //   beforeEach(done =>
    //     _console.textReceived({ StartOffset: 0, Text: 'line 1' }).then(done),
    //   );

    //   it('disables the terminal', () => {
    //     _console.terminate();

    //     expect(_parent.find('section#session-id')).toHaveClass('terminated');
    //   });
    // });
  });
});
