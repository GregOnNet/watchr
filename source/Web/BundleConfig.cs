using System.Web.Optimization;

namespace Web
{
  class BundleConfig
  {
    public static void RegisterBundles(BundleCollection bundles)
    {
      bundles.Add(new StyleBundle("~/assets/css")
                    .Include("~/Css/style.css"));

      bundles.Add(new ScriptBundle("~/assets/js")
                    .Include("~/Scripts/lib/signalr/server.js")
                    .Include("~/Scripts/index.min.js")
                    .ForceOrdered());
    }
  }
}
