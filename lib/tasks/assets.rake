namespace :assets do


  gem_home = `echo $GEM_HOME`.gsub("\n", "/gems")
  gem_env = " --gemPath #{gem_home}"


  desc "Prepare client-side assets for deployment (replaces assets:precompile)"
  task :prepare => :environment do
    if Rails.env.development?
      system "gulp --env production #{gem_env}"
    end
  end
  desc "(Re)build client-side assets for development"
  task :build => :environment do
    puts gem_env
    if Rails.env.development?
      system "gulp #{gem_env}"
    end
  end
  desc "Removes assets compiled using :prepare and recompiles for development"
  task :clear => :environment do
    if Rails.env.development?
      system "gulp #{gem_env}"
      system "touch tmp/restart.txt"
    end
  end
  desc "Refreshes assets as they change via gulp.watch"
  task :watch => :environment do
    if Rails.env.development?
      system "gulp watch #{gem_env}"
    end
  end

  task :wtf => :environment do
    system "gulp wtf #{gem_env}"
  end

  task :fonts => :environment do
    system "gulp fonts #{gem_env}"
  end

  # We make use of rake's behaviour and chain this after rails' assets:precompile.
  desc 'Gzip assets after rails has finished precompilation'
  task precompile: :environment do
    assets = Rails.configuration.assets.precompile.select do |asset|
      asset.is_a?(String) && !asset.include?("tinymce") && asset.match(/\.(css|js)$/)
    end.map do |asset|
      asset.gsub(/.*\/assets\/(javascripts|images|stylesheets)\/?/, "")
    end
    assets = assets + ["bootstrap/glyphicons-halflings-regular.woff", "bootstrap/glyphicons-halflings-regular.ttf"]
    assets = assets.map do |asset|
      Rails.application.assets.find_asset(asset).digest_path rescue ""
    end



    assets.each do |asset|

      digest = asset.match(/[[:alnum:]]{32}/)[0]
      asset_path_name = asset.gsub("-#{digest}", "")
      folder_split_at = asset.rindex("/").to_i

      folder = asset[0, folder_split_at]
      folder << "/" unless folder.empty?

      filename = if folder_split_at == 0
        asset
      else
        asset[folder_split_at + 1, asset.size]
      end
      content = ""
      puts "---"
      puts "ASSET: #{asset}"
      puts "ASSET PATH NAME: #{asset_path_name}"
      puts "FOLDER: #{folder}"
      puts "FILE NAME: #{filename}"
      puts asset.gsub(/\-[[:alnum:]]{32}/, "")
      puts "---"
      File.open("#{Rails.root}/public/assets/#{asset}") do |file|
        content = ActiveSupport::Gzip.compress(file.read)
      end
      file = Tempfile.new(filename)
      file.write(content.force_encoding("UTF-8"))
      file.rewind
      file.close
      content_type = case
        when asset.end_with?(".js") then "application/javascript"
        when asset.end_with?(".css") then "text/css"
        else ""
      end


    end
  end
end
