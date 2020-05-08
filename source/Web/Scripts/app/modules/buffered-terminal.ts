import { Terminal } from 'xterm';

export interface TextReceived {
  SessionId: string;
  StartOffset: number;
  EndOffset: number;
  Text: string;
}

export class BufferedTerminal extends Terminal {
  _backlog: TextReceived[] = [];
  _nextOffset = 0;

  public writeBuffered(text: TextReceived) {
    this.saveToBacklog(text);
    this.applyBacklog();

    return this._backlog.length === 0;
  }

  private saveToBacklog(text: TextReceived) {
    this._backlog.push(text);
  }

  private applyBacklog() {
    this._backlog = this._backlog
      .sort((a, b) => a.StartOffset - b.StartOffset)
      .filter(item => !this.apply(item));
  }

  private apply(text: TextReceived): boolean {
    if (this._nextOffset === text.StartOffset || this._nextOffset === 0) {
      this._nextOffset = text.EndOffset;

      this.write(text.Text);
      return true;
    }

    return false;
  }
}
