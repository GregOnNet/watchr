desc 'Install npm packages'
task :npm do
  sh(*%w(npm install)) # rubocop:disable Lint/UnneededSplatExpansion
end
