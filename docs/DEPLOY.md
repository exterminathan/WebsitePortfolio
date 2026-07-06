# Deploy & SSH — Hostinger

How to connect to the Hostinger server and push site changes without manual
file uploads.

## Connection

SSH is already configured on this machine. An entry named `hostinger` lives in
`~/.ssh/config`:

```
Host hostinger
  HostName 185.212.70.87
  Port 65002
  User u795556072
  IdentityFile ~/.ssh/hostinger
  IdentitiesOnly yes
```

- **Key:** a dedicated `ed25519` keypair at `~/.ssh/hostinger` (private) /
  `~/.ssh/hostinger.pub` (public). The public key is registered in
  hPanel → Advanced → SSH Access → Manage SSH keys.
- **Connect:** `ssh hostinger`
- **Web root:** `~/public_html` → `domains/nathanshturm.com/public_html`
  (the live site is served flat from this directory).

To set this up again on a new machine: generate a key
(`ssh-keygen -t ed25519 -f ~/.ssh/hostinger`), paste the `.pub` into hPanel's
SSH keys, and add the `Host hostinger` block above to `~/.ssh/config`.

## Deploying changes (rsync)

The site is static, so deploy = copy the built site into `public_html/`. Use the
helper script:

```bash
# preview what WOULD change (safe, no writes):
./scripts/deploy.sh --dry-run

# actually push:
./scripts/deploy.sh
```

The script rsyncs a local source directory up to `~/public_html` over the
`hostinger` SSH host. It uses `--delete` so the server mirrors your local folder
exactly — files removed locally get removed on the server. **Always run
`--dry-run` first** until you trust it.

### Important: point the script at the RIGHT source

The repo layout does not yet match the flat deploy layout. Until it's flattened:

- The deployable homepage lives at `pages/index/` on the `portfolio-redesign`
  branch, but its asset paths (`../../images/…`) assume that nesting.
- The live server is **flat** (`index.html` + `images/` at the root).

So do **not** rsync `pages/index/` directly — the paths won't line up. Either:

1. **(Recommended) Flatten the repo first** so `index.html`, `index.css`,
   `index.js`, `resume.pdf`, and `images/` all sit at the repo root with
   `images/…` paths, then deploy the root; **or**
2. Assemble a `dist/` folder with the correct flat structure and point the script
   at that.

Set `SRC` at the top of `scripts/deploy.sh` to whichever directory holds the
flat, deploy-ready site.

## Pulling from the server

To grab something that only exists on the server (e.g. the live Steam-link edit,
or `resume.pdf`):

```bash
scp hostinger:public_html/index.html ./somewhere/
# or a whole folder:
rsync -avz hostinger:public_html/ ./server-backup/
```

## Editing live over SSH (optional)

If you ever want to edit files directly on the server, VS Code's **Remote-SSH**
extension can open `hostinger:~/public_html` in place. Convenient, but you'd be
editing production directly and bypassing git — prefer the rsync flow.

## Notes / gotchas

- Hostinger's SSH port is **65002**, not 22.
- The private key `~/.ssh/hostinger` has **no passphrase** (convenient for
  scripted deploys). If you want one, run
  `ssh-keygen -p -f ~/.ssh/hostinger` and load it via `ssh-agent`.
- First connection to a new machine will prompt to trust the host key — accept it
  once and it's saved to `~/.ssh/known_hosts`.
</content>
