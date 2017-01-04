using System;
using System.IO;

using Client.ScreenLogs;

namespace Client.Streams
{
  public class FileChangeListener : IObservable<string>
  {
    readonly IObservable<string> _stream;

    public FileChangeListener(string path)
    {
      _stream = new Listener(Path.GetDirectoryName(path), Path.GetFileName(path)).Register();
    }

    public IDisposable Subscribe(IObserver<string> observer)
    {
      return _stream.Subscribe(observer);
    }
  }
}
