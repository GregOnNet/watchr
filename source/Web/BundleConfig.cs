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
                    .Include("~/Scripts/lib/signalr/server.js")
                    .ForceOrdered());

      bundles.Add(new ScriptBundle("~/assets/js/app")
                    .Include("~/Scripts/index.js")
                    .ForceOrdered());
    }
  }
}
