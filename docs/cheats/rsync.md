# rsync over SSH

One-way copies: source first, destination second. Requires rsync on both hosts.
`dev` is the SSH alias from `dot cheats ssh`; remote relative paths start at
that user's home directory. Ensure destination parent directories exist.

## Upload: preview, then transfer

```sh
rsync -avhn -e ssh ./project/ dev:project/
rsync -avhP -e ssh ./project/ dev:project/
```

## Download

```sh
rsync -avhn -e ssh dev:project/ ./project/
rsync -avhP -e ssh dev:project/ ./project/
```

## Single file / local copy

```sh
rsync -avhP -e ssh ./report.pdf dev:report.pdf
rsync -avh ./project/ ./backup/
```

## Source trailing slash

- `project/` copies its contents into the destination.
- `project` copies the directory itself into an existing destination directory.

## Options

| Flag | Purpose |
| --- | --- |
| -a | Recursive archive copy; preserve links and common metadata |
| -v / -h | Verbose / readable sizes |
| -n | Preview without changing files |
| -P | Progress plus retained partial transfers |
| -z | Compress in transit; optional for compressible data |
| --exclude | Skip matching paths |
| --delete | Remove destination entries absent from source |

Rerun an interrupted transfer; retained partial files may reduce retransmission.
Archive mode does not include ACLs, extended attributes, or hard-link preservation.

## Exclude generated or private files

```sh
rsync -avhn -e ssh \
  --exclude='.git/' --exclude='node_modules/' --exclude='.venv/' \
  --exclude='.env' --exclude='.env.*' \
  ./project/ dev:project/
```

Remove `n` after reviewing. Add project-specific exclusions as needed.

## Mirror deletions deliberately

```sh
rsync -avhn --delete -e ssh ./project/ dev:project/
```

Review deletions before removing `n`; this can erase destination-only files.

## Without an SSH alias

```sh
rsync -avhP -e 'ssh -p 2222 -i ~/.ssh/id_ed25519' \
  ./project/ alice@server.example.com:project/
```

Reference: [rsync manual](https://download.samba.org/pub/rsync/rsync.1).
