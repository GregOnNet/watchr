using System;
using System.Linq;
using System.Reactive.Concurrency;
using System.Reactive.Disposables;
using System.Reactive.Linq;

using Client.Messages;

using Microsoft.AspNet.SignalR.Client.Hubs;
using Microsoft.AspNet.SignalR.Client.Transports;

using NLog;

namespace Client.Web
{
  static class ObservableExtensions
  {
    public static IObservable<T> BufferUntil<T>(this IObservable<T> instance, IObservable<T> gateStream, Func<int, bool> shouldBuffer)
    {
      return instance
        .Window(gateStream)
        .Select((d, index) =>
        {
          if (shouldBuffer(index))
          {
            return d.ToList().SelectMany(x => x);
          }
          return d;
        })
        .Concat();
    }

    public static IObservable<T> RetryAfter<T>(this IObservable<T> instance, TimeSpan delay)
    {
      return instance
        .Catch<T, Exception>(ex => Observable
                                     .Throw<T>(ex)
                                     .DelaySubscription(delay))
        .Retry();
    }

    public static IObservable<T> RetryAfter<T>(this IObservable<T> instance, Action<T> onNext, TimeSpan delay)
    {
      return instance
        .SelectMany(x => Observable
                           .Defer(() => Observable.Start(() => x))
                           .Do(onNext)
                           .RetryAfter(delay));
    }
  }

  class WebClient : IDisposable
  {
    static readonly Logger Logger = LogManager.GetCurrentClassLogger();
    readonly HubConnection _connection;
    readonly IHubProxy _hub;
    readonly CompositeDisposable _subscriptions;

    public WebClient(string url)
    {
      Logger.Info("Starting web client for {0}", url);

      _connection = new HubConnection(url);
      _hub = _connection.CreateHubProxy("ConsoleHub");

      var connection = new Connection(_connection);

      var onlineMessages = new Messages()
        .Stream
        .BufferUntil(connection.State,
                     gateStreamMessageIndex =>
                     {
                       var shouldBuffer = gateStreamMessageIndex % 2 != 0;
                       if (shouldBuffer)
                       {
                         Logger.Warn("Buffering until connection becomes available");
                       }
                       else
                       {
                         Logger.Warn("Releasing buffer");
                       }
                       return shouldBuffer;
                     })
        .Publish();

      var eventLoop = new EventLoopScheduler();

      _subscriptions = new CompositeDisposable(
        connection
          .ConnectRequired
          .ObserveOn(eventLoop)
          .Do(Connect)
          .RetryAfter(TimeSpan.FromSeconds(10))
          .Subscribe(),
        onlineMessages
          .OfType<BlockParsed>()
          .ObserveOn(eventLoop)
          .RetryAfter(Send, TimeSpan.FromSeconds(10))
          .Subscribe(),
        onlineMessages
          .OfType<SessionTerminated>()
          .ObserveOn(eventLoop)
          .RetryAfter(Terminate, TimeSpan.FromSeconds(10))
          .Subscribe(),
        onlineMessages.Connect()
        );
    }

    public void Dispose()
    {
      _subscriptions.Dispose();
      _connection.Stop();
    }

    static void Connect(Microsoft.AspNet.SignalR.Client.Connection connection)
    {
      Logger.Info("SignalR: Starting connection");

      try
      {
        connection.Start(new LongPollingTransport()).Wait();
      }
      catch (Exception exception)
      {
        Logger.Error("SignalR: Could not start connection", MaybeAggregateException(exception));
        throw;
      }
    }

    void Send(BlockParsed output)
    {
      Logger.Info("Session {0}: Sending {1} lines, starting at index {2}",
                  output.SessionId,
                  output.Lines.Count(),
                  output.Lines.First().Index);

      try
      {
        _hub.Invoke<string>("Broadcast", output).Wait();
      }
      catch (Exception exception)
      {
        Logger.Error(String.Format("Session {0}: Error sending request",
                                   output.SessionId),
                     MaybeAggregateException(exception));
        throw;
      }
    }

    void Terminate(SessionTerminated message)
    {
      Logger.Info("Session {0}: Terminated", message.SessionId);

      try
      {
        _hub.Invoke<string>("Terminate", message.SessionId).Wait();
      }
      catch (Exception exception)
      {
        Logger.Error(String.Format("Session {0}: Error sending request",
                                   message.SessionId),
                     MaybeAggregateException(exception));
        throw;
      }
    }

    static Exception MaybeAggregateException(Exception exception)
    {
      var aex = exception as AggregateException;
      if (aex != null)
      {
        exception = aex.GetBaseException();
      }
      return exception;
    }
  }
}
