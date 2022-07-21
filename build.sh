#!/bin/bash

#################################################################
# This tool is used to package chrome extention
#################################################################
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
typeset sshopt="-o TCPKeepAlive=yes -o ServerAliveCountMax=2 -o ServerAliveInterval=120 -o StrictHostKeyChecking=no"
typeset g_mandatory_utilities="yarn"

#### support environment variables

function my_show_usage {
    cat - <<EOF
#################################################################
Storage cluster management tool used to expand cluster
#################################################################

Usage: ${g_appname_short} action 
          action           : specify sub command, only support "pack" now
Examples:
        ${g_appname_short} expand
EOF
}

function sub_cmd_build {
  typeset CMD="yarn build"
  MSG "${CMD}"
  eval "${CMD}"
  BCS_CHK_RC0 "exec failed: ${CMD}"

  typeset CMD="cp -r src/background.js src/chrome build/"
  MSG "${CMD}"
  eval "${CMD}"
  BCS_CHK_RC0 "exec failed: ${CMD}"

  MSG "Done        $(date +'%Y/%m/%d %H:%M:%S')"
}

function my_entry {
  typeset act="${1:-build}"
  shift 1
  #DBG "act: $act $@"

  ## used to backup conf file and data file
  export g_start_time=$(date +'%Y%m%d_%H%M%S')
  export g_backup_id="bk.${g_start_time}"

  case ${act} in
    "build") sub_cmd_build $@;;
    "pack")  sub_cmd_pack $@;;
    *) MSG "unsupported sub-command: ${act}";;
  esac
}

function sub_cmd_pack {
	#chrome.exe --pack-extension="D:\Projects\Beyond Feeds Flood"
	exe="/cygdrive/c/Program Files/Google/Chrome/Application/chrome.exe"
	"${exe}" --pack-extension="D:\mydisk\cygwin\home\zhaoyong.zzy\git\web-wechat-chrome-extension"
}

main $@
