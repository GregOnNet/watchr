using System.Web.Optimization;

namespace Web
{
  class BundleConfig
  {
    public static void RegisterBundles(BundleCollection bundles)
    {
      bundles.Add(new StyleBundle("~/assets/css")
                    .Include("~/Css/style.css")
                    .Include("~/Css/xterm.css")
                    .ForceOrdered());

      bundles.Add(new ScriptBundle("~/assets/js/lib")
                    .Include("~/Scripts/lib/jquery/jquery.js")
                    // SignalR.
                    .Include("~/Scripts/lib/signalr/jquery.signalR.min.js")
                    .Include("~/Scripts/lib/signalr/server.js")
                    // xterm base.
                    .Include("~/Scripts/lib/xterm/xterm.js")
                    // xterm terminal fitting.
                    .Include("~/Scripts/lib/xterm/xterm-addon-fit.js")
                    .Include("~/Scripts/lib/css-element-queries/*.js")
                    // Load web font before opening xterm terminal.
                    .Include("~/Scripts/lib/xterm/xterm-webfont.js")
                    .Include("~/Scripts/lib/fontfaceobserver/fontfaceobserver.js")
                    .ForceOrdered());

      bundles.Add(new ScriptBundle("~/assets/js/app")
                    .Include("~/Scripts/app/modules/*.js")
                    .Include("~/Scripts/app/*.js")
                    .ForceOrdered());
    }
  }
}
