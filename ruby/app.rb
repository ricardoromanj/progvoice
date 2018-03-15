require 'sinatra'


set :bind, '0.0.0.0'
set :port, 3000


get '/replyhello' do
  'Hello from Ruby.'
end

get '/replygoodbye' do
  'Good bye from Ruby.'
end
