local M = {}

function M.get_switch_status()
    local result = {}
    local pipe = io.popen("swconfig dev switch0 show")
    if not pipe then return result end

    for line in pipe:lines() do
        local port, link, speed, mode = line:match("Port (%d+): link: (%w+) speed: ([^ ]+) ([^ ]+)")
        if port then
            table.insert(result, {
                port = port,
                link = (link == "up") and "connected" or "disconnected",
                speed = speed,
                mode = mode
            })
        end
    end
    pipe:close()
    return result
end

return M