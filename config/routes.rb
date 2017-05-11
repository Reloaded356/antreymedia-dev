Rails.application.routes.draw do
  root to: 'pages#home'
  # root 'visitors#index'
  devise_for :users
  resources :users
end
