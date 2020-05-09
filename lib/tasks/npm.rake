desc 'Install npm packages'
task :npm do
  sh(*%w(npm install)) # rubocop:disable Lint/UnneededSplatExpansion
end

task :npm do
  cp(Dir['node_modules/signalr/jquery.signalR.min.js'],
     'source/Web/Scripts/lib/signalr/')
end
