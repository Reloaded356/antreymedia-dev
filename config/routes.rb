Rails.application.routes.draw do
  #root 'welcome#index'
  root 'visitors#index'
  devise_for :users
  resources :users
end
