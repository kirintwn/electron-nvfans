#!/usr/bin/env bash

declare -A index;   declare -a orders;
#nodeFSstart
index["0"]="0"; orders+=( "0" )
index["26"]="36"; orders+=( "26" )
index["50"]="40"; orders+=( "50" )
index["59"]="43"; orders+=( "59" )
index["69"]="58"; orders+=( "69" )
index["80"]="100"; orders+=( "80" )
index["100"]="100"; orders+=( "100" )
#nodeFSend

#Notice: valux X in index["X"] should be the same in orders+=("X")
#Warning: Don't move the orders of this shell script
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
lastRoundTemp="0"

currentTempQuerier () {
    prequery="nvidia-settings -q '[gpu:$1]/GPUCoreTemp'"
    read originRes <<< $(eval "$prequery" | awk '/Attribute[[:space:]]/ { print $4 }')

    afterRes="${originRes//.}"
    echo "CurrentTemp: "$afterRes
    if [ $lastRoundTemp -eq $afterRes ]; then
        #echo "No Need To Call API"
        return
    else
        lastRoundTemp=$afterRes
        interpolator $1 $afterRes
    fi
}

interpolator() {
    calculatedSpeed=""
    for i in "${!orders[@]}"
    do
        #echo "${orders[$i]}: ${index[${orders[$i]}]}"
        if [ $2 -eq ${orders[$i]} ]; then
            calculatedSpeed=${index[${orders[$i]}]}
            setFanSpeed $1 $calculatedSpeed
            break
        elif [ $2 -lt ${orders[$i]} ]; then
            #calculatedSpeed = fa + (fb-fa) * (x-a) / (b-a)
            fa=${index[${orders[($i-1)]}]}
            fbfa=$((${index[${orders[$i]}]} - ${index[${orders[($i-1)]}]}))
            xa=$(($2 - ${orders[($i-1)]}))
            ba=$((${orders[$i]} - ${orders[($i-1)]}))
            roundNearest=$(($ba / 2))

            calculatedSpeed=$(( $fa  +  $(($(( $(($fbfa * $xa)) + $roundNearest)) / $ba)) ))
            setFanSpeed $1 $calculatedSpeed
            break
        fi
    done
}

setFanSpeed() {
    #echo "Going to set fan $1 speed at $2 %"
    cmd="nvidia-settings -a '[fan:$1]/GPUTargetFanSpeed=$2'"
    eval "$cmd"
}

setAll() {
    read originCount <<< $(nvidia-settings -q gpus | cut -d" " -f 1)
    totalCount=$(($originCount -1))

    #echo "you have $(($totalCount + 1)) gpus."

    for (( i=0; i <= $totalCount; i++ ))
    do
        precmd="nvidia-settings -a '[gpu:$i]/GPUFanControlState=1'"
        eval "$precmd"
    done

    for (( ; ; ))
    do
        for (( j=0; j <= $totalCount; j++ ))
        do
            currentTempQuerier $j
        done
        sleep 2
    done
}

setSeperation() {
    for var in "$@"
    do
        precmd="nvidia-settings -a '[gpu:$var]/GPUFanControlState=1'"
        eval "$precmd"
    done

    for (( ; ; ))
    do
        for var1 in "$@"
        do
            currentTempQuerier $var1
        done
        sleep 2
    done
}

main() {
    if [ $# -eq 0 ]; then
        setAll
    elif [ $1 -eq "-1" ]; then
        setAll
    else
        setSeperation $@
    fi
}

#################
# Main Function #
#################
main $@
exit;
