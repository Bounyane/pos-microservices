-- auth.lua
local _M = {}
local cjson = require "cjson"

function _M.validate_auth(allowed_roles)
    local http = require "resty.http"
    local httpc = http.new()
    
    local auth_header = ngx.var.http_authorization
    if not auth_header then
        ngx.status = 401
        ngx.header.content_type = "application/json"
        ngx.say('{"error":"Unauthorized","message":"Valid token required"}')
        return ngx.exit(401)
    end
    
    local res, err = httpc:request_uri("http://auth-service:8081/api/auth/validate", {
        method = "POST",
        headers = {
            ["Authorization"] = auth_header,
            ["Content-Type"] = "application/json"
        },
        timeout = 5000
    })
    
    if err then
        ngx.log(ngx.ERR, "Auth validation request failed: ", err)
        ngx.status = 500
        ngx.header.content_type = "application/json"
        ngx.say('{"error":"Internal Server Error","message":"Auth validation failed"}')
        return ngx.exit(500)
    end
    
    if not res or res.status ~= 200 then
        ngx.status = 401
        ngx.header.content_type = "application/json"
        ngx.say('{"error":"Unauthorized","message":"Valid token required"}')
        return ngx.exit(401)
    end
    
    -- Parse the response to get user info
    local user_data
    local success, parse_err = pcall(function()
        user_data = cjson.decode(res.body)
    end)
    
    if not success or not user_data or not user_data.user then
        ngx.log(ngx.ERR, "Failed to parse auth response: ", parse_err or "Invalid response format")
        ngx.status = 500
        ngx.header.content_type = "application/json"
        ngx.say('{"error":"Internal Server Error","message":"Auth validation failed"}')
        return ngx.exit(500)
    end
    
    local user_role = user_data.user.role
    
    -- Check if user role is allowed
    if allowed_roles then
        local role_allowed = false
        for _, role in ipairs(allowed_roles) do
            if user_role == role then
                role_allowed = true
                break
            end
        end
        
        if not role_allowed then
            ngx.status = 403
            ngx.header.content_type = "application/json"
            ngx.say('{"error":"Forbidden","message":"Insufficient permissions"}')
            return ngx.exit(403)
        end
    end
    
    -- Set headers to pass user info to backend services
    ngx.req.set_header("X-User-ID", user_data.user.uid)
    ngx.req.set_header("X-User-Email", user_data.user.email)
    ngx.req.set_header("X-User-Role", user_role)
    
    return user_data
end

return _M