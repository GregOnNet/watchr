# frozen_string_literal: true

require 'rake/funnel'

task compile: %i(npm) do
  sh(*%w(git clean -xdf source/Web/Scripts/app/))
  sh(*%w(npm run rollup))
end

Rake::Funnel::Tasks::SideBySideSpecs.new(:compile) do |t|
  t.references = 'NUnit.Framework'
  t.enabled = configatron.env == 'production'
end

Rake::Funnel::Tasks::MSBuild.new compile: %i(bin_path npm version template) do |t|
  t.args = {
    nologo: nil,
    verbosity: :minimal,
    target: :Rebuild,
    property: {
      restore_packages: false,
      download_paket: false,
      build_in_parallel: false,
      configuration: configatron.build.configuration
    }
  }.merge(Rake::Win32.windows? ? { node_reuse: false } : {})
end

Rake::Funnel::Tasks::Copy.new :compile do |t|
  t.source = FileList['source/Web/**/*']
             .exclude('**/*.cs')
             .exclude('**/*.??proj')
             .exclude('**/obj/**/*')
             .exclude('**/*.ts')
             .exclude('**/*-vsdoc.js')
             .exclude('**/bin/*.xml')
             .exclude('**/bin/Web.dll.config')
             .exclude('**/paket.references')
             .exclude('**/*.yaml')
             .exclude('**/*.template')
             .exclude('**/*.erb')
             .exclude('**/*.user')
  t.target = 'build/bin/Web/bin'
end

Rake::Funnel::Tasks::Copy.new compile: :template do |t|
  t.source = 'source/Web/deploy.yaml'
  t.target = 'build/bin/Web'
end

task :compile do
  # https://github.com/SignalR/SignalR/issues/933#issuecomment-266250392
  cp('build/bin/Web/bin/Web.config',
     'packages/Microsoft.AspNet.SignalR.Utils/tools/net40/signalr.exe.config')

  cmd = %w(
    packages/Microsoft.AspNet.SignalR.Utils/tools/net40/signalr.exe
    ghp
    /path:build/bin/Web/bin/bin
  )

  sh(*Rake::Funnel::Support::Mono.invocation(cmd))

  raise 'The generated server.js is empty' if File.size('server.js').zero?

  mkdir_p('build/bin/Web/bin/Scripts/lib')
  mv('server.js',
     'build/bin/Web/bin/Scripts/lib')
end
