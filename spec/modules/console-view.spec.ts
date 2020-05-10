import { BufferedTerminal } from '../../source/Web/Scripts/modules/buffered-terminal';
import { ConsoleView } from '../../source/Web/Scripts/modules/console-view';
import { TextReceived } from '../../source/Web/Scripts/modules/console-hub';

describe(ConsoleView.name, () => {
  let terminal: BufferedTerminal;
  let view: ConsoleView;
  let parent: JQuery<HTMLElement>;
  let hideOnConnection: JQuery<HTMLElement>;
  let sessionId: string;

  beforeEach(() => {
    sessionId = 'session id';

    parent = $('<div>').attr('id', 'parent-container');
    hideOnConnection = $('<div>').attr('id', 'welcome-container');
    setFixtures(parent.html());
    setFixtures(hideOnConnection.html());

    terminal = jasmine.createSpyObj('BufferedTerminal', [
      'loadWebfontAndOpen',
      'writeBuffered',
    ]);

    (terminal as any).loadWebfontAndOpen.and.returnValue(
      new Promise(resolve => resolve(terminal)),
    );

    // spyOn(window, 'BufferedTerminal').and.returnValue(terminal);

    view = new ConsoleView(
      { parent: parent, hideOnConnection: hideOnConnection },
      sessionId,
    );
  });

  describe('text received', () => {
    let event: TextReceived;

    beforeEach(async () => {
      event = {
        SessionId: sessionId,
        StartOffset: 0,
        EndOffset: 'line 1'.length,
        Text: 'line 1',
      };

      await view.textReceived(event);
    });

    it('hides welcome message', () => {
      expect(hideOnConnection).toBeHidden();
    });

    it('creates container inside parent', () => {
      expect(view.container.parent()).toEqual(parent);
    });

    it('creates a container', () => {
      expect(view.container).toExist();
    });

    it('sets view title', () => {
      expect(view.container.find('header')).toHaveText(sessionId);
    });

    it('creates container for xterm', () => {
      expect(view.container.find('div.term')).toExist();
    });

    it('creates a xterm instance', () => {
      expect((terminal as any).loadWebfontAndOpen).toHaveBeenCalledWith(
        view.container.find('div.term')[0],
      );
    });

    it('writes buffered lines', () => {
      expect(terminal.writeBuffered).toHaveBeenCalledWith(event);
    });

    it('fits the terminal to the screen', () => {
      // expect((terminal as any).fit).toHaveBeenCalled();
    });

    describe('terminal is not buffering', () => {
      it('does not mark container as delayed', () => {
        expect(view.container).not.toHaveClass('delayed');
      });
    });

    describe('terminal is buffering', () => {
      beforeEach(async () => {
        const early = {
          SessionId: sessionId,
          StartOffset: event.EndOffset + 1,
          EndOffset: event.EndOffset + 1 + 'early'.length,
          Text: 'early',
        };

        await view.textReceived(early);
      });

      it('marks container as delayed', () => {
        expect(view.container).toHaveClass('delayed');
      });
    });

    describe('session terminated', () => {
      beforeEach(() => {
        view.terminate();
      });

      it('marks container as terminated', () => {
        expect(view.container).toHaveClass('terminated');
      });
    });
  });
});
