Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.network :forwarded_port, guest: 4567, host: 4567, auto_correct: true

  # Configure the guest's proxy environment variables to point to CNTLM on the host
  # to get internet access at FPH.
  if Vagrant.has_plugin?("vagrant-proxyconf")
   config.proxy.http     = "http://10.0.2.2:3128"
   config.proxy.https    = "https://10.0.2.2:3128"
   config.proxy.no_proxy = "localhost,127.0.0.1"
  end

  config.vm.provision "bootstrap",
    type: "shell",
    inline: <<-SHELL
      sudo apt-get install software-properties-common
      sudo apt-add-repository ppa:brightbox/ruby-ng
      sudo apt-get update
      sudo apt-get install -yq ruby2.2 ruby2.2-dev pkg-config build-essential nodejs git libxml2-dev libxslt-dev
      sudo apt-get autoremove -yq
      gem2.2 install --no-ri --no-rdoc bundler
    SHELL

  # add the local user git config to the vm
  config.vm.provision "file", source: "~/.gitconfig", destination: ".gitconfig"

  config.vm.provision "install",
    type: "shell",
    privileged: false,
    inline: <<-SHELL
      echo "=============================================="
      echo "Installing app dependencies"
      cd /vagrant
      bundle config build.nokogiri --use-system-libraries
      bundle install
    SHELL

  # config.vm.provision "run",
  #   type: "shell",
  #   privileged: false,
  #   run: "always",
  #   inline: <<-SHELL
  #     echo "=============================================="
  #     echo "Starting up middleman at http://localhost:4567"
  #     echo "If it does not come up, check the ~/middleman.log file for any error messages"
  #     cd /vagrant
  #     bundle exec middleman server &> ~/middleman.log &
  #   SHELL
end
