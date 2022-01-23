#!/bin/bash -ev

exit 0
# cd /srv/hk01-eatojoy-admin-frontend

# pm2 delete hk01-eatojoy-admin-frontend || :

# if [ "$DEPLOYMENT_GROUP_NAME" == "production" ]; then
#   aws s3 cp s3://wemedia01-ansible-res/hk01-eatojoy-admin-frontend/credentials.js ./src/config/
#   pm2 start pm2.config.js --env production
# else
#   aws s3 cp s3://hk01-ansible-res/hk01-eatojoy-admin-frontend/credentials.js ./src/config/
#   pm2 start pm2.config.js --env staging
# fi

# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
