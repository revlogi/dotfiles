# SSH keys and host aliases

Replace `alice`, `server.example.com`, and port `2222` with your values.
These are templates; keep keys and credentials outside the dotfiles repository.

## Generate a key pair

```sh
mkdir -p ~/.ssh
chmod 700 ~/.ssh
ssh-keygen -a 100 -t ed25519 -f ~/.ssh/id_ed25519 -C "laptop"
```

Enter a passphrase when prompted. If that filename already exists, keep the
existing key or choose another filename; do not overwrite it accidentally.
`-a 100` sets passphrase key-derivation rounds, not key size.

- `id_ed25519`: private key; keep it on your machine.
- `id_ed25519.pub`: public key; install this on servers.

```sh
ssh-keygen -lf ~/.ssh/id_ed25519.pub  # Display the public fingerprint
ssh-add ~/.ssh/id_ed25519            # Load into an existing SSH agent
ssh-keygen -p -f ~/.ssh/id_ed25519    # Change the private-key passphrase
```

If ssh-add cannot reach an agent, start one in this shell with
`eval "$(ssh-agent -s)"`, then retry.

## Install the public key

Requires an existing way to log in, such as a server password.

```sh
ssh-copy-id -i ~/.ssh/id_ed25519.pub -p 2222 alice@server.example.com
```

If ssh-copy-id is unavailable, append the public key manually:

```sh
cat ~/.ssh/id_ed25519.pub | ssh -p 2222 alice@server.example.com \
  'umask 077; mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys'
```

Run one method, not both; the manual command can append duplicates.

## Connect

```sh
ssh -p 2222 -i ~/.ssh/id_ed25519 alice@server.example.com
```

On first connection, verify the host fingerprint with the server administrator.

## Host alias

Add to your local `~/.ssh/config`:

```sshconfig
Host dev
    HostName server.example.com
    User alice
    Port 2222
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
```

```sh
chmod 600 ~/.ssh/config
ssh dev
ssh dev 'hostname'
ssh -v dev                  # Diagnose connection/authentication problems
```

Place specific Host blocks before wildcard defaults. rsync over SSH can use
this alias too; see `dot cheats rsync`.

References: [ssh-keygen](https://man.openbsd.org/ssh-keygen),
[ssh_config](https://man.openbsd.org/ssh_config).
