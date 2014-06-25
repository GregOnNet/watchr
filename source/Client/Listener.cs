﻿using System;
using System.IO;
using System.Reactive;
using System.Reactive.Disposables;
using System.Reactive.Linq;

namespace Client
{
  public class Listener
  {
    public static IObservable<string> Register(string path, string filter = null)
    {
      return Observable.Create<string>(subject =>
      {
        var disp = new CompositeDisposable();

        var fsw = CreateFileSystemWatcher(path, filter);
        disp.Add(fsw);

        var sources =
          new[]
          {
            Observable.FromEventPattern
              <FileSystemEventHandler, FileSystemEventArgs>(x => fsw.Changed += x,
                                                            x => fsw.Changed -= x),
            Observable.FromEventPattern
              <FileSystemEventHandler, FileSystemEventArgs>(x => fsw.Created += x,
                                                            x => fsw.Created -= x),
            Observable.FromEventPattern
              <FileSystemEventHandler, FileSystemEventArgs>(x => fsw.Deleted += x,
                                                            x => fsw.Deleted -= x),
            Observable.FromEventPattern<ErrorEventArgs>(fsw, "Error")
                      .SelectMany(e => Observable.Throw<EventPattern<FileSystemEventArgs>>(e.EventArgs.GetException()))
          };

        var subscription = sources
          .Merge()
          .Select(x => x.EventArgs.FullPath)
          .Synchronize(subject)
          .Subscribe(subject);

        disp.Add(subscription);

        fsw.EnableRaisingEvents = true;
        return disp;
      }).Publish().RefCount();
    }

    static FileSystemWatcher CreateFileSystemWatcher(string path, string filter)
    {
      return new FileSystemWatcher(path, filter);
    }
  }
}
