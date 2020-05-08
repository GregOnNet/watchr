/// <reference path='../../lib/jquery/jquery.js' />
/// <reference path="../../lib/xterm/xterm.js" />
/// <reference path="../../lib/xterm/fit.js" />
/// <reference path="../../lib/xterm-webfont-custom/xterm-webfont.js" />
/// <reference path="../../lib/css-element-queries/ResizeSensor.js" />

function Console(parent, welcome, sessionId) {
  Terminal.applyAddon(fit);

  this.sessionId = sessionId;

  var getSessionId = function () {
    return 'session-' + sessionId.replace(/[\W\s]/g, '_');
  };

  function getTerminalDiv(element) {
    return element.children().last()[0];
  }

  var findOrCreateTerminal = function () {
    var deferral = $.Deferred();

    welcome.hide();

    var element = parent.find('section#' + getSessionId());

    if (element.length) {
      return deferral.resolve(getTerminalDiv(element).terminalInstance());
    }

    element = $('<section>')
      .attr('id', getSessionId())
      .append($('<header>').text(sessionId.replace(/\s.*/, '')))
      .append($('<div>').addClass('term'));

    parent.append(element);
    var div = getTerminalDiv(element);

    var terminal = new Terminal({
      scrollback: 20000,
      cursorBlink: false,
      cursorStyle: 'block',
      fontFamily: 'Droid Sans Mono',
      fontSize: 13,
      disableStdin: true,
      focus: false,
      theme: {
        foreground: '#000',
        background: '#fff',
        cursor: '#000',
        cursorAccent: '#000',
        selection: 'rgba(0, 52, 120, 0.25)',
        brightYellow: '#c4a000'
      }
    });

    terminal.loadAddon(new XtermWebfont())
    terminal.loadAddon(new FitAddon())

    div.terminalInstance = function () {
      return terminal;
    };

    // Support buffering.
    terminal.__backlog = [];
    terminal.__nextOffset = 0;

    terminal.__applyText = function (text) {
      if (this.__nextOffset === text.StartOffset || this.__nextOffset === 0) {
        this.__nextOffset = text.EndOffset;
        this.write(text.Text);

        return true;
      }

      return false;
    };

    terminal.__buffer = function (text) {
      $('section#' + getSessionId(), parent).addClass('delayed');
      return this.__backlog.push(text);
    };

    terminal.__applyBuffer = function () {
      if (this.__backlog.length === 0) {
        return;
      }

      var that = this;

      this.__backlog = this.__backlog
        .sort(function (a, b) {
          return a.StartOffset - b.StartOffset;
        })
        .filter(function (item) {
          return !that.__applyText(item);
        });

      if (this.__backlog.length === 0) {
        $('section#' + getSessionId(), parent).removeClass('delayed');
      }
    };

    terminal
      .loadWebfontAndOpen(div)
      .then(function (terminal) {
        // Initial fit.
        terminal.fit();

        // Fit on resize.
        new ResizeSensor(div, function () {
          terminal.fit();
        });

        return terminal;
      })
      .then(function (terminal) {
        deferral.resolve(terminal);
      });

    return deferral.promise();
  };

  this.text = function (text) {
    return findOrCreateTerminal().then(function (terminal) {
      if (terminal.__applyText(text)) {
        terminal.__applyBuffer();
      } else {
        terminal.__buffer(text);
      }
      return terminal;
    });
  };

  this.terminate = function () {
    $('section#' + getSessionId(), parent).addClass('terminated');
  };
}
