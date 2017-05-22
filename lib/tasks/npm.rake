desc 'Install npm packages'
task :npm do
  sh(*%w(npm install))
end

task :npm do
  cp(Dir['node_modules/xterm/dist/*.js', 'node_modules/xterm/dist/*.js.map'],
     'source/Web/Scripts/xterm/')
  cp('node_modules/xterm/dist/addons/fit/fit.js', 'source/Web/Scripts/xterm/fit.js')
  cp(Dir['node_modules/xterm/dist/*.css'],
     'source/Web/Css')
end

task :npm do
  cp('node_modules/css-element-queries/src/ResizeSensor.js',
     'source/Web/Scripts/css-element-queries/')
end