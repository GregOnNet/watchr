import {
  BufferedTerminal,
  Block,
  WriteBufferedResult,
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
      const block: Block = {
        StartOffset: 0,
        EndOffset: 'line 1'.length,
        Text: 'line 1',
      };
      let result: WriteBufferedResult;

      beforeEach(() => {
        result = terminal.writeBuffered(block);
      });

      it('writes text', () => {
        expect(writeSpy).toHaveBeenCalledWith(block.Text);
      });

      it('does not buffer', () => {
        expect(result.buffering).toBeFalse();
      });
    });

    describe('start with unseen blocks', () => {
      const block: Block = {
        StartOffset: 42,
        EndOffset: 'line 1'.length,
        Text: 'line 1',
      };
      let result: WriteBufferedResult;

      beforeEach(() => {
        result = terminal.writeBuffered(block);
      });

      it('writes text', () => {
        expect(writeSpy).toHaveBeenCalledWith(block.Text);
      });

      it('does not buffer', () => {
        expect(result.buffering).toBeFalse();
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
      let result: WriteBufferedResult[];

      beforeEach(() => {
        result = blocks.map(b => terminal.writeBuffered(b));
      });

      it('writes all text', () => {
        const text = blocks.map(b => [b.Text]);

        expect(writeSpy.calls.allArgs()).toEqual(text);
      });

      it('does not buffer', () => {
        result.forEach(r => expect(r.buffering).toBeFalse());
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

      let result: WriteBufferedResult;

      beforeEach(() => {
        terminal.writeBuffered(first);
        result = terminal.writeBuffered(early);
      });

      it('does not write early text', () => {
        const text = [first].map(b => [b.Text]);

        expect(writeSpy.calls.allArgs()).toEqual(text);
      });

      it('buffers block', () => {
        expect(result.buffering).toBeTrue();
      });

      describe('delay resolved', () => {
        beforeEach(() => {
          result = terminal.writeBuffered(late);
        });

        it('does not buffer', () => {
          expect(result.buffering).toBeFalse();
        });

        it('writes backlog block text', () => {
          const text = [first, late, early].map(b => [b.Text]);

          expect(writeSpy.calls.allArgs()).toEqual(text);
        });
      });
    });
  });
});
