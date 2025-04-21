#!/bin/sh
# 输出 DSA 网口状态（JSON 格式）
echo "["
FIRST=1
for iface in $(ls /sys/class/net | grep -E '^lan[0-9]+$|^wan$|^eth[0-9]+$'); do
    [ -f "/sys/class/net/$iface/carrier" ] || continue

    LINK=$(cat "/sys/class/net/$iface/carrier")
    SPEED=$(cat "/sys/class/net/$iface/speed" 2>/dev/null)
    DUPLEX=$(cat "/sys/class/net/$iface/duplex" 2>/dev/null)

    [ "$LINK" = "1" ] && STATUS="up" || STATUS="down"

    [ -z "$SPEED" ] && SPEED="N/A"
    [ -z "$DUPLEX" ] && DUPLEX="N/A"

    [ $FIRST -eq 0 ] && echo ","
    FIRST=0

    echo "  {\"iface\": \"$iface\", \"status\": \"$STATUS\", \"speed\": \"$SPEED\", \"duplex\": \"$DUPLEX\"}"
done
echo "]"

