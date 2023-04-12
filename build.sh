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
My Chrome extension build and pack tool
#################################################################

Usage: ${g_appname_short} action 
          action           : support "build" and "pack"
Examples:
        ${g_appname_short} build
        ${g_appname_short} pack
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
	mark=$(date +'%Y%m%d_%H%M%S')
	if [[ -f build.crx ]]; then mv build.crx build.crx.$mark; fi
	if [[ -f build.pem ]]; then mv build.pem build.pem.$mark; fi
	set -vx
	exe="/cygdrive/c/Program Files/Google/Chrome/Application/chrome.exe"
	"${exe}" --pack-extension="$(cygpath -w $PWD/build)"
}

main $@
