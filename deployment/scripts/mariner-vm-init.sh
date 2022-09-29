# Copyright (c) Microsoft Corporation. All rights reserved
# Licensed under the MIT license. See LICENSE file in the project root for more information


# shellcheck disable=SC2154,SC2188,SC2129,SC2236
###################################################################################################
# This script is designed to be executed on an edge device
#
#
###################################################################################################

set -e

###########################################################
# Edge Module Prerequisites
###########################################################

# create the local group and user for the edge module
# these are mapped from host to container in the deployment manifest in the desired properties for the module
sudo groupadd -f -g 1010 localedgegroup
sudo useradd --home-dir /home/localedgeuser --uid 1010 --gid 1010 localedgeuser
sudo mkdir -p /home/localedgeuser

# create folders to be used by the rtspsim module
sudo mkdir -p /home/localedgeuser/samples
sudo mkdir -p /home/localedgeuser/samples/input

# give the local user access
sudo chown -R localedgeuser:localedgegroup /home/localedgeuser/

# set up folders for use by the video analyzer module
# these are mounted in the deployment manifest

# !NOTE! these folder locations are must match the folders used in `deploy-modules.sh` and ultimately the IoT edge deployment manifest

# general app data for the module
sudo mkdir -p /var/lib/videoanalyzer 
sudo chown -R localedgeuser:localedgegroup /var/lib/videoanalyzer/
sudo mkdir -p /var/lib/videoanalyzer/tmp/ 
sudo chown -R localedgeuser:localedgegroup /var/lib/videoanalyzer/tmp/
sudo mkdir -p /var/lib/videoanalyzer/logs
sudo chown -R localedgeuser:localedgegroup /var/lib/videoanalyzer/logs

# output folder for file sink
sudo mkdir -p /var/media
sudo chown -R localedgeuser:localedgegroup /var/media/
