# Deployment Server Setup Instructions

## Prerequisites

- A Linux server (Ubuntu 20.04/22.04 recommended)
- SSH access to the server
- Root or sudo privileges

---

## Step 1: Create Deployment Directory

```bash
sudo mkdir -p /var/www/todoapp
sudo chown -R $USER:$USER /var/www/todoapp
```

---

## Step 2: Create Systemd User

The workflow uses `www-data` user to run the server:

```bash
sudo useradd -m -s /bin/bash www-data
sudo systemctl daemon-reload
```

---

## Step 3: Create SSH Key for GitHub Actions

Generate an SSH key pair for GitHub Actions to use:

```bash
# Generate SSH key (replace with your preferred key name)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/todoapp_deploy

# Add the public key to GitHub
cat ~/.ssh/todoapp_deploy.pub
# Copy the entire output and add it to:
# Settings → Actions → General → Workflow permissions → Read and write permissions
# OR add as a deploy key for the repository
```

**OR** use an existing SSH key:

1. Copy your existing SSH public key (`~/.ssh/id_ed25519.pub` or `~/.ssh/id_rsa.pub`)
2. Add it as a **Deploy Key** in GitHub:
   - Go to your repo → Settings → Deploy keys → Add deploy key
   - Title: `github-actions-deploy`
   - Read-only: No (it needs write access for git pull)

---

## Step 4: Create SSH Configuration for GitHub Actions

Create an SSH config file for BatchMode (required by GitHub Actions):

```bash
# Create SSH config for GitHub Actions
sudo nano /etc/ssh/ssh_config.d/todoapp.conf
```

Add this content:

```
Host *
    BatchMode yes
    StrictHostKeyChecking no
```

**Note:** For production, you may want to use `StrictHostKeyChecking yes` for security.

---

## Step 5: Clone the Repository

```bash
cd /var/www/todoapp
git clone https://github.com/niyojilk/todoapp.git .
```

---

## Step 6: Create .env File

```bash
cp .env.example .env
# Edit .env with your desired settings:
nano .env
```

Example `.env` content:
```
HOST=0.0.0.0
PORT=8000
DEBUG=False
```

---

## Step 7: Create Systemd Service

Create the systemd service file for the application:

```bash
sudo mkdir -p /etc/systemd/system
sudo nano /etc/systemd/system/todoapp.service
```

Add this content:

```
[Unit]
Description=Todo App Python Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/todoapp
Environment="PATH=/var/www/todoapp/venv/bin:/usr/bin"
ExecStart=/var/www/todoapp/venv/bin/python server.py
Restart=always
RestartSec=5
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=todoapp

[Install]
WantedBy=multi-user.target
```

Reload systemd:

```bash
sudo systemctl daemon-reload
```

---

## Step 8: Test Manual Deployment

Start the server manually:

```bash
cd /var/www/todoapp
source venv/bin/activate
python server.py &
```

Check if it's running:

```bash
curl http://localhost:8000
```

Stop the manual process:

```bash
pkill -f "python server.py"
```

---

## Step 9: Add Secrets to GitHub

1. Go to: `https://github.com/niyojilk/todoapp/settings/secrets/actions`
2. Add these secrets:
   - `DEPLOY_SSH_KEY`: Paste your SSH private key (full content including `-----BEGIN OPENSSH PRIVATE KEY-----`)
   - `SSH_HOST`: Your SSH connection string (e.g., `your-user@your-server-ip -p 22`)
   - `DEPLOY_PATH`: `/var/www/todoapp`

**Important:** The SSH key must have:
- **Read** access (for cloning)
- **Write** access (for git pull)

---

## Step 10: Enable Automatic Deployment

After setting up all secrets and running a test commit:

1. Push a test commit to trigger the workflow
2. Check the Actions tab to see if deployment succeeds
3. If successful, you can remove the manual systemd service (GitHub Actions will create it)

---

## Step 11: Firewall Configuration (Optional)

If you want to expose the app to the internet, configure your firewall:

```bash
# For UFW (Ubuntu)
sudo ufw allow 8000/tcp
sudo ufw reload

# For firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

---

## Verification

After deployment, check:

```bash
# Check if server is running
curl http://localhost:8000

# Check server logs
sudo tail -f /var/www/todoapp/server.log

# Check systemd status (if using systemd)
sudo systemctl status todoapp
```

---

## Troubleshooting

### Server not starting
```bash
cd /var/www/todoapp
source venv/bin/activate
python server.py
# Check for errors in the terminal
```

### Permission denied errors
```bash
sudo chown -R www-data:www-data /var/www/todoapp
sudo chmod -R 755 /var/www/todoapp
```

### SSH key issues
- Make sure the private key file is not world-readable:
  ```bash
  chmod 600 ~/.ssh/todoapp_deploy
  ```

### Git pull fails
- Check SSH connection:
  ```bash
  ssh -T git@github.com
  ```
- Ensure deploy key has write permissions

---

## Next Steps

Once setup is complete:

1. Push a commit to trigger the first automated deployment
2. Monitor the GitHub Actions logs at: `https://github.com/niyojilk/todoapp/actions`
3. Your todo app will now automatically deploy on every push!
