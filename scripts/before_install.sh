#!/bin/bash -ev

if [ -d /srv/hk01-member-frontend ]; then
  rm -rf /srv/hk01-member-frontend
fi

mkdir -vp /srv/hk01-member-frontend
