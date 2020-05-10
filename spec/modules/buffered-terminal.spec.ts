import {
  BufferedTerminal,
  Block,
} from '../../source/Web/Scripts/modules/buffered-terminal';
import { Terminal } from 'xterm';

describe(BufferedTerminal.name, () => {
  let terminal: BufferedTerminal;
  let writeSpy: jasmine.Spy<any>;

  beforeEach(() => {
    terminal = new BufferedTerminal();

    writeSpy = spyOn(terminal as Terminal, 'write');
  });

  describe('buffered write', () => {
    describe('start at the beginning', () => {
      let block: Block = {
        StartOffset: 0,
        EndOffset: 'line 1'.length,
        Text: 'line 1',
      };

      beforeEach(() => terminal.writeBuffered(block));

      it('writes text', () => {
        expect(writeSpy).toHaveBeenCalledWith(block.Text);
      });

      it('has no backlog', () => {
        expect(terminal._backlog.length).toEqual(0);
      });
    });

    describe('start with unseen blocks', () => {
      let block: Block = {
        StartOffset: 42,
        EndOffset: 'line 1'.length,
        Text: 'line 1',
      };

      beforeEach(() => terminal.writeBuffered(block));

      it('writes text', () => {
        expect(writeSpy).toHaveBeenCalledWith(block.Text);
      });

      it('has no backlog', () => {
        expect(terminal._backlog.length).toEqual(0);
      });
    });

    describe('consecutive blocks', () => {
      const blocks: Block[] = [
        {
          StartOffset: 0,
          EndOffset: 'line 1'.length,
          Text: 'line 1',
        },
        {
          StartOffset: 'line 1'.length,
          EndOffset: 'line 2'.length,
          Text: 'line 2',
        },
      ];

      beforeEach(() => blocks.forEach(b => terminal.writeBuffered(b)));

      it('writes all text', () => {
        const text = blocks.map(b => [b.Text]);

        expect(writeSpy.calls.allArgs()).toEqual(text);
      });

      it('has no backlog', () => {
        expect(terminal._backlog.length).toEqual(0);
      });
    });

    describe('delayed block', () => {
      const first: Block = {
        StartOffset: 0,
        EndOffset: 'first'.length,
        Text: 'first',
      };

      const late: Block = {
        StartOffset: 'first'.length,
        EndOffset: 'first-late'.length,
        Text: '-late',
      };

      const early: Block = {
        StartOffset: 'first-late'.length,
        EndOffset: 'first-late-early'.length,
        Text: '-early',
      };

      beforeEach(() => {
        terminal.writeBuffered(first);
        terminal.writeBuffered(early);
      });

      it('does not write early text', () => {
        const text = [first].map(b => [b.Text]);

        expect(writeSpy.calls.allArgs()).toEqual(text);
      });

      it('stores early block to backlog', () => {
        expect(terminal._backlog[0]).toEqual(early);
      });

      describe('delay resolved', () => {
        beforeEach(() => {
          terminal.writeBuffered(late);
        });

        it('has no backlog', () => {
          expect(terminal._backlog.length).toEqual(0);
        });

        it('write backlog block text', () => {
          const text = [first, late, early].map(b => [b.Text]);

          expect(writeSpy.calls.allArgs()).toEqual(text);
        });
      });
    });
  });
});
