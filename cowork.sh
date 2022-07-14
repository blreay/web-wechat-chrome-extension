#!/bin/bash
#set -vx

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

##### install inotify guide
:<<EOF
git clone  https://github.com/rvoicilas/inotify-tools.git
cd inotify-tools/
./autogen.sh
./configure
make -j8
sudo make install
EOF
################################

# for this PJ
# ./cowork.sh test aa bb

function my_show_usage {
  trap '' INT EXIT
  cat - <<EOF
Usage: ${g_appname_short} test [-b builder] [type] [target|]
         -b     : specify builder, cmake or bazel, default is cmake
         type   : debug | release | or others defined in build.sh
         target : install | other
Example:
  ${g_appname_short} test -b bazel debug              #pj official build
EOF
}

function clean {
  echo "############ clearup pid: ${g_pid} $(cat ${PIDFILE} 2>/dev/null)"
  #following statement must not use "all" because the second mykilltree.sh will not work
  mykilltree.sh ${g_pid} child
  echo "all child process have been killed, try to kill current process: ${g_pid}"
  #including all to kill all include itself, this is mandatory because Ctrl-C lead to
  #some child process's parent become 1, must store it's PID to physical file
  [[ -f "${PIDFILE}" ]] && { mykilltree.sh $(cat $PIDFILE) all ; /bin/rm -f ${PIDFILE}; }
  echo "############ after kill:  ${g_appname}"
  ps -ef|grep ${g_appname} |egrep -v "(vim|grep|$$)"
  #mykilltree.sh $$
  echo "############ cleanup done"
}
#trap 'clean' INT EXIT

function my_entry {
  typeset g_pid=$$
  echo "PID is ${g_pid}"

  g_appname=$(basename ${BASH_SOURCE[0]})
  PIDFILE=_pid_of_${g_appname}

  /bin/rm -f ${PIDFILE} && echo $$ > ${PIDFILE}

  export GOPATH=$HOME/go
  export PATH=/usr/local/go/bin:$PATH
  export CASEDIR=$PWD
  export PJDIR=${PWD}
  export PJ_ROOT=${PWD}
  export WORKSPACE=current

  typeset act="${1:-null}"
  shift 1
  #typeset param2=$2
  #typeset param3=$3

  case $act in
    "test") PJDIR=${PWD}; WORKSPACE="test";;
  esac

while true; do
  #inotifywait -e modify -r -c $PJDIR --exclude cscope
  #echo "MYCPROD=$MYCPROD"
  echo "Watching: $PJDIR" "WORKSPACE=$WORKSPACE" "PJ_ROOT=${PJ_ROOT}"

  PJ_WIN_ROOT="$(cygpath -w ${PJ_ROOT})"

  inotifywait.exe -c -e modify -r --exclude "(cscope.out$|tags$|.*.log$|.*.data$|.*.json.|.*.diff$|cowork.sh$|build)" "${PJ_WIN_ROOT}"

  typeset ret=$?
  MSG "inotifywait return ${ret}"

  ## avoid dead-loop if press CTRL-C
  case ${ret} in
    0)   echo "file changed, do build";;            #file changed
    1)   echo "maybe branch changed, do build";;    #git co XXX lead to inotifywait return 1
    130) echo "abnormal kill by CTRL-C" && exit 1;; #ctrl-c lead to inotifywait return 130
    *)   echo "OMG, what happened??? ret=${ret}";;  #unknown exit code
  esac

  # Do something *after* a write occurs, e.g. copy the file
  #set -vx
  echo "FILE changed at time: $(date): $@"
  [[ -n "${g_pid}" && "${g_pid}" != "$$" ]] && { mykilltree.sh ${g_pid} all ; echo "old process ${g_pid} has been killed"; }
  case "${WORKSPACE}" in
    current)  ./build.sh $@ & ;;
    *)        MSG "not support";;
  esac
  g_pid=$!
  echo "****************** background process: ${g_pid}"
  echo ${g_pid} > ${PIDFILE}
done
}

main $@
