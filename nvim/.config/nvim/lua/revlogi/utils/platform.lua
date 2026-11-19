local system = vim.uv.os_uname().sysname

return {
  is_macos = system == 'Darwin',
  is_remote = vim.env.SSH_CONNECTION ~= nil,
}
