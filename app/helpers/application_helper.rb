module ApplicationHelper

  def home_page?
    current_page?(root_url) || current_page?('home')
  end

end
