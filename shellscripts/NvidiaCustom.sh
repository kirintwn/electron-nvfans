#!/usr/bin/env bash

################################################
#  Fans Control Custom Script for Nvidia Cards #
################################################
# Utility Name: UbuntuFansControl              #
# Version: alpha 0.0.1                         #
# Author: Kirintw                              #
# https://github.com/cy91244/UbuntuFansControl #
################################################

# Licensed under the MIT License
# See the LICENSE file for details.

#####################################################################
#                          *** IMPORTANT ***                        #
# DO NOT MODIFY PAST THIS POINT IF YOU DONT KNOW WHAT YOUR DOING!!! #
#####################################################################

############################
# index (Associative Array)#
############################
#nodeFSptr
declare -A index;   declare -a orders;
index["0"]="20";    orders+=( "0" )
index["40"]="30";   orders+=( "40" )
index["62"]="43";   orders+=( "62" )
index["70"]="60";   orders+=( "70" )
index["73"]="65";   orders+=( "73" )
index["75"]="80";   orders+=( "75" )
index["80"]="100";  orders+=( "80" )
index["100"]="100"; orders+=( "100" )

lastRoundTemp="0"

currentTempQuerier () {
    #originRes="$(nvidia-settings -q '[gpu:0]/GPUCoreTemp' | awk '{print $3}')"
    read originRes <<< $(nvidia-settings -q '[gpu:0]/GPUCoreTemp' | awk '/Attribute[[:space:]]/ { print $4 }')
    afterRes="${originRes//.}"
    echo "CurrentTemp: "$afterRes
    if [ $lastRoundTemp -eq $afterRes ]; then
        #echo "No Need To Call API"
        return
    else
        lastRoundTemp=$afterRes
        interpolator $afterRes
    fi
}

interpolator() {
    calculatedSpeed=""
    #echo $1
    for i in "${!orders[@]}"
    do
        #echo "${orders[$i]}: ${index[${orders[$i]}]}"
        if [ $1 -eq ${orders[$i]} ]; then
            calculatedSpeed=${index[${orders[$i]}]}
            setFanSpeed $calculatedSpeed
            break
        elif [ $1 -lt ${orders[$i]} ]; then
            #calculatedSpeed = fa + (fb-fa) * (x-a) / (b-a)
            fa=${index[${orders[($i-1)]}]}
            fbfa=$((${index[${orders[$i]}]} - ${index[${orders[($i-1)]}]}))
            xa=$(($1 - ${orders[($i-1)]}))
            ba=$((${orders[$i]} - ${orders[($i-1)]}))
            roundNearest=$(($ba / 2))

            calculatedSpeed=$(( $fa  +  $(($(( $(($fbfa * $xa)) + $roundNearest)) / $ba)) ))
            setFanSpeed $calculatedSpeed
            break
        fi
    done
}

setFanSpeed() {
    # echo "Going to set fan speed at $1 %"
    cmd="nvidia-settings -a '[fan:0]/GPUTargetFanSpeed=$1'"
    eval "$cmd"
}

main() {
    nvidia-settings -a '[gpu:0]/GPUFanControlState=1'

    for (( ; ; ))
    do
       currentTempQuerier
       sleep 2
    done
}

#################
# Main Function #
#################

main
exit;
