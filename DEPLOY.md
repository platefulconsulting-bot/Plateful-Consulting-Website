# Going live on platefulconsulting.com

A step-by-step guide. Copy each command exactly, one block at a time, and check
the result matches before moving on. Nothing here is irreversible until
**Step 7**, and even that can be undone in two minutes (see *Rollback*).

Roughly 45 minutes end to end, most of it waiting for the first build.

---

## Two things that must not break

Read these once before you start. They are the only ways this can go badly.

1. **Your company email runs on this domain** (`mx1.hostinger.com`).
   Email is controlled by the **MX** records and the **nameservers**. In Step 7
   you change only the **A record**. Do not change nameservers, do not touch MX,
   and email keeps working throughout.

2. **Do not cancel the Hostinger web-hosting plan after the switch**, at least
   not yet. On Hostinger, mailboxes are often tied to that plan — cancelling it
   can take your email with it. It is also your instant rollback. Keep it for a
   month, confirm email is on a plan of its own, then decide.

---

## Before you start

- A **Hostinger VPS** (KVM 1 is plenty: 1 vCPU / 4 GB RAM). Choose **Ubuntu 24.04**
  as the operating system, not a control-panel image.
- Its **IP address** and **root password**, from the Hostinger VPS panel.
- Access to **hPanel → Domains → platefulconsulting.com → DNS / Nameservers**.
- A **backup of the current WordPress site**, taken from hPanel first. You almost
  certainly will not need it. Take it anyway.

Throughout, replace `SERVER_IP` with your VPS address.

---

## Step 1 — Log in to the server

On your own PC, open **PowerShell**:

```powershell
ssh root@SERVER_IP
```

Type `yes` if it asks about authenticity, then the root password.
You should end up at a prompt like `root@srv123:~#`.

---

## Step 2 — Install Docker

On the server:

```bash
curl -fsSL https://get.docker.com | sh
docker --version
```

Expect something like `Docker version 27.x.x`.

Then close the firewall to everything except web and SSH:

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

Expect `Status: active` with 22, 80 and 443 listed.

---

## Step 3 — Upload the site

Back on **your PC**, in PowerShell (not the server window):

```powershell
cd "C:\Office\PFC Website"
tar -czf ..\plateful.tar.gz --exclude=node_modules --exclude=.next --exclude=.git --exclude=storage --exclude=data --exclude=uploads --exclude=.env --exclude=prisma/dev.db .
scp ..\plateful.tar.gz root@SERVER_IP:/root/
```

The upload is about 5–10 MB and takes a few seconds.

Then on **the server**:

```bash
mkdir -p /opt/plateful
tar -xzf /root/plateful.tar.gz -C /opt/plateful
cd /opt/plateful
ls
```

You should see `Dockerfile`, `docker-compose.yml`, `Caddyfile`, `src`, `prisma`.

---

## Step 4 — Set the secrets

Still on the server. First generate a signing key and copy the output:

```bash
openssl rand -hex 32
```

Now create the settings file:

```bash
cp .env.example .env
nano .env
```

Change exactly these three lines:

| Line | Set it to |
| --- | --- |
| `AUTH_SECRET=` | the long random string you just generated |
| `STUDIO_PASSWORD=` | a real password for the Blog Studio — long, and not reused |
| `NEXT_PUBLIC_SITE_URL=` | leave as `https://platefulconsulting.com` |

Leave everything else alone. `DATABASE_URL` and `UPLOAD_DIR` are set
automatically by the server and are ignored here.

Save with **Ctrl+O**, **Enter**, then exit with **Ctrl+X**.

---

## Step 5 — Start it

```bash
cd /opt/plateful
docker compose up -d --build
```

**The first build takes 5–10 minutes** — it installs everything and pre-renders
all 32 articles. You will see a lot of output. That is normal.

When it finishes:

```bash
docker compose ps
```

Both `app` and `caddy` should say `running`. `app` may say `health: starting`
for the first minute, then `healthy`.

---

## Step 6 — Check it works, before touching DNS

```bash
docker compose exec app node -e "fetch('http://127.0.0.1:3000/').then(r=>console.log('site responded:',r.status))"
```

Expect `site responded: 200`.

Check the articles came across:

```bash
docker compose exec app node -e "const{PrismaClient}=require('@prisma/client');const d=new PrismaClient();d.post.count({where:{status:'published'}}).then(n=>{console.log('published articles:',n);process.exit(0)})"
```

Expect `published articles: 32`.

If either fails, look at the log and send me what it says:

```bash
docker compose logs --tail=50 app
```

> Caddy will be logging certificate errors at this point. That is expected — it
> cannot get a certificate until the domain points here, which is the next step.

---

## Step 7 — Point the domain at the new server

**This is the cutover.** In hPanel → **Domains → platefulconsulting.com → DNS /
Nameservers → DNS records**:

1. **Edit the `A` record** for name `@`
   → change the value from `89.117.157.40` to **your VPS IP**
   → set TTL to `300` if you can.

2. **Delete the `AAAA` record** for `@`
   (current value `2a02:4780:11:1099:0:3707:d5c7:2`).
   This one matters: it is the IPv6 address. Leave it and anyone on IPv6 —
   which is most mobile networks — keeps landing on the old WordPress site while
   everyone else sees the new one.

3. **Leave everything else exactly as it is.** In particular do not touch:
   - the **NS / nameservers** (`ns1.dns-parking.com`, `ns2.dns-parking.com`)
   - the **MX records** (`mx1.hostinger.com`, `mx2.hostinger.com`) — your email
   - the **`www` CNAME**, which already follows the main domain

Now wait. Usually 5–15 minutes. Check from your PC:

```powershell
nslookup platefulconsulting.com 8.8.8.8
```

When it returns your VPS IP, the switch has happened.

The HTTPS certificate is then issued automatically within a minute or two. Watch
it happen on the server:

```bash
docker compose logs -f caddy
```

Look for `certificate obtained successfully`. Press **Ctrl+C** to stop watching.

---

## Step 8 — Verify the live site

Open these and check each one:

- <https://platefulconsulting.com> — padlock shown, homepage loads, 3D backdrop moves
- <https://www.platefulconsulting.com> — should jump to the non-www address
- <http://platefulconsulting.com> — should jump to **https**
- <https://platefulconsulting.com/blogs> — 32 articles
- <https://platefulconsulting.com/how-to-increase-swiggy-orders> — an old URL still works
- <https://platefulconsulting.com/sitemap.xml> — lists 46 URLs
- <https://platefulconsulting.com/studio> — log in with your new password
- The contact form — send yourself a test enquiry, then confirm it appears in
  **Studio → Enquiries**
- The sun/moon button — switch themes, reload, confirm it remembered

Then send a test email to `info@platefulconsulting.com` and confirm it still
arrives. It should — nothing we changed affects mail — but check anyway.

---

## Step 9 — Tell Google

In [Google Search Console](https://search.google.com/search-console) for
platefulconsulting.com:

1. **Sitemaps** → submit `sitemap.xml`
2. **URL Inspection** → paste the homepage → *Request indexing*
3. Do the same for two or three of the most important articles

Every article kept its original web address, so rankings carry over. Expect
Google to re-crawl over a few days. Watch **Pages** and **Performance** for a
fortnight; a small dip in the first week is normal, a sustained drop is not —
tell me if you see one.

---

## Rollback

If anything is wrong and you want the old site back, change the DNS records back
to exactly these values and wait ten minutes:

| Type | Name | Value |
| --- | --- | --- |
| `A` | `@` | `89.117.157.40` |
| `AAAA` | `@` | `2a02:4780:11:1099:0:3707:d5c7:2` |

WordPress is untouched on Hostinger and comes straight back. Nothing on the VPS
is lost — you can fix the problem and switch again whenever you like.

---

## Running it day to day

**See what it is doing**

```bash
cd /opt/plateful && docker compose logs -f app
```

**Restart**

```bash
cd /opt/plateful && docker compose restart app
```

**Change the Studio password** — edit `.env`, then restart. Applied on boot;
articles and enquiries are untouched.

```bash
cd /opt/plateful && nano .env && docker compose restart app
```

**Back up** — everything that matters is two folders. Run this monthly, and
always before an update:

```bash
cd /opt/plateful
tar -czf ~/plateful-backup-$(date +%F).tar.gz data uploads
ls -lh ~/plateful-backup-*.tar.gz
```

Then copy it to your PC, from PowerShell:

```powershell
scp root@SERVER_IP:~/plateful-backup-*.tar.gz "C:\Office\backups\"
```

**Deploy a change** — repeat Step 3 to upload the new code, then:

```bash
cd /opt/plateful && docker compose up -d --build
```

Your database and uploaded images live in `./data` and `./uploads` and are never
touched by a rebuild.

---

## If something goes wrong

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Browser says "not secure" / no padlock | Certificate not issued yet | `docker compose logs caddy`. Confirm DNS points here and ports 80/443 are open. |
| Site loads on desktop but shows the old WordPress on mobile | The `AAAA` record is still there | Delete the `AAAA` record (Step 7.2) |
| `permission denied` on start | Script line endings | `sed -i 's/\r$//' scripts/docker-entrypoint.sh` then rebuild |
| Blog is empty | Volume created before the database was seeded | `docker compose down`, `rm -rf data`, `docker compose up -d` |
| Out of memory during build | VPS too small | Use a plan with 2 GB RAM or more |
| Emails stopped | MX or nameservers were changed | Restore them in hPanel; the A record is the only one that should have changed |

Send me the output of `docker compose logs --tail=80 app` for anything not
listed here.
