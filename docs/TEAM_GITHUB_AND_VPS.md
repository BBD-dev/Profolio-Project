# Team access (BBD-dev) + VPS deploy

GitHub **does not accept account passwords** for `git clone`. Everyone on the team uses **SSH** or a **Personal Access Token (PAT)**. The VPS uses its own **deploy key** (read-only) so the server can pull without anyone’s personal password.

---

## 1. Give the team access to the repo

1. Open **https://github.com/BBD-dev/Profolio-Project**
2. **Settings** → **Collaborators and teams** (or org **Teams** → add repo to team)
3. Invite members or add a team (e.g. `developers`) with **Write** (or **Maintain** for leads)

Each person must **accept** the org/repo invite. They clone with **their own** GitHub login (SSH or PAT), not a shared password.

---

## 2. How developers clone on their PC

### Option A — SSH (recommended for daily work)

1. Generate a key (once): `ssh-keygen -t ed25519 -C "your@email"`
2. Add **public** key: GitHub → **Settings** → **SSH and GPG keys** → **New SSH key**
3. Clone:

```bash
git clone git@github.com:BBD-dev/Profolio-Project.git
```

### Option B — HTTPS + PAT

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens**
2. Fine-grained: access **BBD-dev** / **Profolio-Project** → Contents: **Read** (Write if they push)
3. Clone:

```bash
git clone https://github.com/BBD-dev/Profolio-Project.git
```

Username: your GitHub handle. **Password:** the token (not your account password).

---

## 3. VPS: deploy key (server only, read-only)

One key on the VPS; the **whole team** updates the server by **pushing to GitHub**, then pulling on the VPS (or via CI later).

**On the VPS (once):**

```bash
ssh-keygen -t ed25519 -C "bbd-profolio-vps-deploy" -f ~/.ssh/github_bbd_profolio -N ""
cat ~/.ssh/github_bbd_profolio.pub
```

**On GitHub (repo admins):**

1. **BBD-dev/Profolio-Project** → **Settings** → **Deploy keys** → **Add deploy key**
2. Title: `bbd-profolio-vps`
3. Paste the **public** key from `cat` above
4. Leave **Allow write access** unchecked (read-only is enough)

**Clone on VPS:**

```bash
mkdir -p /opt/profolio
cd /opt/profolio

# If folder isn't empty from a failed clone, clean first:
# rm -rf .git * 2>/dev/null   # only if you're sure nothing important is there

GIT_SSH_COMMAND='ssh -i ~/.ssh/github_bbd_profolio -o IdentitiesOnly=yes' \
  git clone git@github.com:BBD-dev/Profolio-Project.git .
```

**Optional — always use this key for this repo:**

```bash
cat >> ~/.ssh/config << 'EOF'
Host github.com-bbd-profolio
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_bbd_profolio
  IdentitiesOnly yes
EOF

cd /opt/profolio
git remote set-url origin git@github.com-bbd-profolio:BBD-dev/Profolio-Project.git
```

**Update production after someone pushes to `main`:**

```bash
cd /opt/profolio
git pull
docker compose up -d --build
# With app web test: docker compose --profile app-test up -d --build
```

Anyone with **push** access to the repo can merge; **one person** (or a runbook) runs `git pull` + compose on the VPS, or you add GitHub Actions later.

---

## 4. Who needs what

| Person / system | Needs |
|-----------------|--------|
| Developer | Org/repo access + SSH or PAT on laptop |
| VPS | Deploy key (read) on **Profolio-Project** only |
| Admin dashboard users | `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `api.env` on VPS (not GitHub) |

Do **not** put GitHub tokens in the repo. Do **not** commit `api.env` or `server/.env`.

---

## 5. Optional later: GitHub Actions

Team pushes to `main` → workflow SSHs to VPS (or uses a runner) → `git pull` + `docker compose up -d --build`. Ask when you want this; it replaces manual `git pull` on the server.

---

## 6. Deploy checklist

Full server steps: [VPS_DEPLOY_CHECKLIST.md](../VPS_DEPLOY_CHECKLIST.md)
