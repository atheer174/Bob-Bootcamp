# Lab: Setting up Figma MCP on Bob IDE — Desktop MCP (IBM Bob)

**Audience:** Build with Bob · **Level:** Advanced · **Topics:** `mcp` · `figma` · `design`

> For IBM Bob, use Figma's desktop MCP server: remote MCP is off on the IBM tenant.
> Connect Bob to `127.0.0.1:3845`, or proxy that Windows listener into WSL.

---

## Tutorial Flow

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1 · Enable desktop MCP in Figma](#step-1)
4. [Step 2 · Point Bob at the local server](#step-2)
5. [WSL · Bob in Ubuntu, Figma on Windows](#wsl)
6. [Step 3 · Restart Bob and verify](#step-3)
7. [Step 4 · Prompt with selection or link](#step-4)
8. [Step 5 · Optional Figma-side settings](#step-5)
9. [What we are not using (IBM Bob)](#not-this-path)
10. [Tools reference](#tools)
11. [Troubleshooting](#troubleshooting)
12. [Security habits](#security)
13. [Where Bob reads MCP settings](#locations)

---

## Overview

<a id="overview"></a>

Figma's MCP server can run in different ways. Figma documents a **remote** hosted server and a **desktop** server. On IBM's Figma tenant, remote MCP is turned off for security reasons, so this lab documents the **desktop** path: Figma Desktop runs the MCP process locally, and Bob IDE connects with `streamable-http`.

When Bob and Figma Desktop share the same OS, that URL is `http://127.0.0.1:3845/mcp`. When Bob runs in **WSL** and Figma Desktop runs on Windows, WSL cannot reach Windows loopback. Use the [WSL section](#wsl) instead: a port proxy on **3846** and the Windows host IP.

**Success criteria:** With Figma Desktop running and desktop MCP enabled, Bob shows a connected server (for example `figma`) and can answer prompts that use your **current selection** in Figma or a pasted **frame/layer link**.

---

## Prerequisites

<a id="prerequisites"></a>

- **Figma Desktop** installed and updated (the browser-only Figma session is not enough for desktop MCP).
- **Bob IDE** with MCP support and permission to add an MCP server entry.
- **A Figma Design file** you can open in the desktop app for Dev Mode.
- **WSL users:** Figma Desktop still runs on Windows. Bob in Ubuntu needs an Administrator PowerShell session on Windows for the port proxy in the [WSL section](#wsl).

---

## Step 1 · Enable the desktop MCP server in Figma

<a id="step-1"></a>

Follow Figma's flow (summarized here; details stay in [Set up the desktop server](https://developers.figma.com/docs/figma-mcp-server/local-server-installation/)):

1. **Open the Figma desktop app** and update to the latest version.
2. **Create or open** a Figma Design file.
3. **Switch to Dev Mode** from the toolbar (shortcut: `Shift+D`).
4. In the **inspect** panel, find the **MCP server** section and click **Enable desktop MCP server**.

You should see a confirmation that the server is running. Keep this address for the next step:

```
http://127.0.0.1:3845/mcp
```

> That listener is on the machine that runs Figma Desktop. WSL Ubuntu is a different machine from Windows's point of view — skip Step 2's localhost URL and go straight to the [WSL section](#wsl).

✅ **Check:** Figma stays open with desktop MCP enabled while you use Bob.

---

## Step 2 · Point Bob at the local Figma MCP server

<a id="step-2"></a>

Use this JSON when Bob and Figma Desktop share the same OS (macOS, Linux, or native Windows). Add an MCP entry targeting the local URL with Bob's **`streamable-http`** transport — this is what works against Figma Desktop's local listener, even though the URL is localhost, not Figma's remote `mcp.figma.com` server.

Place this in your project's `.bob/mcp.json` or user-level `mcp_settings.json`:

```json
{
  "mcpServers": {
    "figma": {
      "type": "streamable-http",
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

> **Optional:** add `"disabled": true` to keep the block in config but stop Bob from loading the server when you are not using Figma. Omit the property or set `false` when you want the tools available.

> **Note:** Figma's own "other editors" snippets sometimes show only `url`; for Bob, include `type` as above.

**Why:** Bob talks to the server Figma Desktop already started — nothing is fetched from Figma's cloud MCP host for this path.

✅ **Check:** JSON is valid and saved where Bob actually merges MCP config for your workspace.

---

## WSL · Reach Figma Desktop from Bob in WSL

<a id="wsl"></a>

Figma Desktop binds MCP to Windows `127.0.0.1:3845`. Bob in WSL Ubuntu has its own loopback, so `http://127.0.0.1:3845/mcp` inside WSL is **not** Figma. Finish [Step 1](#step-1) on Windows first, then expose that listener on a second port and point Bob at the Windows host.

### Confirm Figma is listening (Windows PowerShell)

```powershell
netstat -ano | findstr :3845
```

Expected output:

```
TCP    127.0.0.1:3845    0.0.0.0:0    LISTENING
```

Then probe the endpoint:

```powershell
curl.exe http://127.0.0.1:3845/mcp
```

> Use `curl.exe` here — PowerShell's `curl` alias is `Invoke-WebRequest` and will not give you this check.

The server is up when you get:

```json
{"jsonrpc":"2.0","error":{"code":-32001,"message":"Invalid sessionId"}}
```

That error is the **success signal** — Figma wants an MCP session, not a bare HTTP GET.

### Proxy 3845 onto 3846 (PowerShell as Administrator)

Figma stays on Windows localhost. WSL cannot use that address, so forward a second port:

```powershell
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=3846 connectaddress=127.0.0.1 connectport=3845
```

Verify:

```powershell
netsh interface portproxy show all
```

Expected row:

```
0.0.0.0    3846    127.0.0.1    3845
```

### Allow 3846 through Windows Firewall (PowerShell as Administrator)

```powershell
New-NetFirewallRule -DisplayName "Figma MCP Proxy" -Direction Inbound -Protocol TCP -LocalPort 3846 -Action Allow
```

The proxy listens on every interface (`0.0.0.0`), which is how WSL reaches it. The firewall rule is the boundary — see [Security habits](#security).

### Find the Windows host IP (WSL Ubuntu)

```bash
ip route | grep default
```

Example output:

```
default via 172.23.0.1 dev eth0
```

The address after `via` is the Windows host. **It can change** after a reboot, VPN change, or WSL restart — re-run this before troubleshooting a URL that stopped working.

### Test from WSL

```bash
curl http://172.23.0.1:3846/mcp
```

Replace `172.23.0.1` with your host IP. You want the same `Invalid sessionId` JSON you saw on Windows — this proves WSL can reach Figma MCP.

### Point Bob at the proxy URL

In the MCP config Bob in WSL actually reads (`~/.bob/settings/mcp_settings.json` or `.bob/mcp.json`), use the host IP and port **3846**:

```json
{
  "mcpServers": {
    "figma": {
      "type": "streamable-http",
      "url": "http://172.23.0.1:3846/mcp"
    }
  }
}
```

> ⚠️ Do **not** use `http://127.0.0.1:3845/mcp` from WSL — that address is WSL's own loopback, not Figma Desktop on Windows.

Then continue with [Step 3](#step-3).

**To remove the proxy later:**

```powershell
netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=3846
Remove-NetFirewallRule -DisplayName "Figma MCP Proxy"
```

---

## Step 3 · Restart Bob IDE and confirm the connection

<a id="step-3"></a>

1. **Save** your MCP config file.
2. **Restart Bob IDE** (or use your build's "reload MCP" action if it exists).
3. In MCP tools or server status, confirm **figma** (or the server id you chose) is connected.

If no tools appear, Figma's doc suggests restarting the Figma desktop app and the editor — do that before changing JSON again. On WSL, also re-check that Figma is still listening on Windows and that `curl` from Ubuntu still hits the proxy.

---

## Step 4 · Prompt Bob: selection-based or link-based

<a id="step-4"></a>

Per [Figma's desktop guide](https://developers.figma.com/docs/figma-mcp-server/local-server-installation/), design context reaches Bob in two ways:

- **Selection-based:** select a frame or layer in the Figma desktop app, then ask Bob to implement or explain the **current selection**.
- **Link-based:** copy a link to a frame or layer, paste it into chat, and ask Bob to work from that node. The client does not open the URL like a browser; it uses the node id from the link.

**Example prompts:**

```
Help me implement the component for my current selection in Figma.

Using this design link, list constraints and spacing I should match in code: [paste Figma URL]
```

---

## Step 5 · Optional: tune desktop MCP in Figma

<a id="step-5"></a>

In the same **MCP server** area of the inspect panel, open the **settings** modal. Figma documents options such as **image handling** (local server vs downloading assets) and **Code Connect**. Use those when your demo needs real assets or mapped components — see [desktop server installation](https://developers.figma.com/docs/figma-mcp-server/local-server-installation/).

---

## What this IBM Bob lab does not use

<a id="not-this-path"></a>

- **Figma's cloud remote MCP** (`https://mcp.figma.com/…`) — on IBM's Figma tenant it is **not enabled** for security. This lab assumes that policy. You still use Bob's `streamable-http` *transport*; the `url` points at **local** Figma Desktop (or the WSL proxy to that listener), not Figma's SaaS endpoint.
- **`npx` + personal access token** packages as the primary connector — desktop MCP does not replace Figma Desktop with a separate Node child for this walkthrough.

> Figma still publishes [remote server installation](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/) for environments that support it; use that only if your organization explicitly enables it in Bob.

---

## Tools reference

<a id="tools"></a>

Exact tool names can change with Figma's server version. Use Figma's reference: [Tools and prompts](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/).

---

## Troubleshooting

<a id="troubleshooting"></a>

| Symptom | What to try |
|---|---|
| No tools / connection failed | Confirm Figma Desktop is running, a Design file is open, Dev Mode is on, and **desktop MCP** is still enabled. Restart Figma Desktop, then restart Bob. |
| Wrong or refused URL (same OS) | Use exactly `http://127.0.0.1:3845/mcp`. Another app using that port is rare but possible — close conflicting tools. |
| Connection refused from WSL | Do not point Bob at `127.0.0.1:3845` inside Ubuntu. Follow [WSL](#wsl): confirm Windows is listening on 3845, the portproxy row for 3846 exists, the firewall rule is present, then `curl` the host IP on 3846 from WSL. |
| WSL URL worked yesterday, fails today | Re-run `ip route` in Ubuntu and read the address after `default via`. The Windows host IP often changes across WSL restarts, VPN, or reboot. Update the `url` in MCP config and restart Bob. |
| `Invalid sessionId` from `curl` | That is the healthy MCP response to a GET without a session — it means the listener is up. |
| Works in browser Figma only | Desktop MCP requires the **desktop app** — switch to Figma Desktop for this flow. |
| JSON errors | Validate commas and braces; compare with a working HTTP MCP entry in the same file. |
| Server listed but never connects | Check for `"disabled": true` — remove it or set `false` when you want Figma tools active. |
| Firewall rule already exists | `New-NetFirewallRule` fails on a duplicate display name. Keep the existing **Figma MCP Proxy** rule, or remove it and recreate. |

---

## Security habits

<a id="security"></a>

- **Design sensitivity:** your prompts can pull real UI structure — only share files and links appropriate for the audience.
- **Localhost trust:** on the same OS, the MCP endpoint is on your machine. Keep workstation and Figma session access under your org's policies.
- **WSL port proxy:** the `0.0.0.0:3846` forward is wider than Figma's default loopback bind. Keep the firewall rule, do not port-forward 3846 off the laptop, and delete the proxy when you no longer need WSL access.

---

## Where Bob reads MCP settings

<a id="locations"></a>

Paths vary by OS and install; confirm against current Bob IDE documentation. Typical patterns:

| Scope | Where teams usually put it |
|---|---|
| User (global) | `~/.bob/settings/mcp_settings.json` (Unix style, including **Bob inside WSL**) or your team's Windows equivalent under the user profile for native Windows Bob. |
| Project | `.bob/mcp.json` at the workspace root — same `mcpServers` shape. For a repo on `/mnt/c/...`, that is the Linux path Bob in WSL sees. |

> Treat these files like production integration configs: review in pull requests and avoid committing secrets. A WSL Bob process does not read Windows `%APPDATA%` Bob settings; edit the Linux-side file or the project file the WSL workspace actually opens.

---

**[Back to Bob Bootcamp](../README.md)**
