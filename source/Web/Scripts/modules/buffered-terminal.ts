import { Terminal } from 'xterm';

export interface Block {
  StartOffset: number;
  EndOffset: number;
  Text: string;
}

export class BufferedTerminal extends Terminal {
  _backlog: Block[] = [];
  _nextOffset = 0;

  public writeBuffered(text: Block) {
    this.saveToBacklog(text);
    this.applyBacklog();

    return this._backlog.length === 0;
  }

  private saveToBacklog(block: Block) {
    this._backlog.push(block);
  }

  private applyBacklog() {
    this._backlog = this._backlog
      .sort((a, b) => a.StartOffset - b.StartOffset)
      .filter(item => !this.apply(item));
  }

  private apply(block: Block): boolean {
    if (this._nextOffset === block.StartOffset || this._nextOffset === 0) {
      this._nextOffset = block.EndOffset;

      this.write(block.Text);
      return true;
    }

    return false;
  }
}
