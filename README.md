# Graphixel Tips — Getting It Online

This folder is a complete, ready-to-deploy website. It includes the tip widget,
a "receive tips" QR card, wallet connection, and everything Next.js needs to
run. You don't need to install anything on your computer — GitHub + Vercel
will do the work, the same way Cryptoscope went live.

There are 4 steps:

1. Get one free API key
2. Put this code on GitHub
3. Put your wallet address in
4. Deploy on Vercel

---

## 1. Get a free OnchainKit API key

This key lets the app show basenames (like `yourname.base.eth`) and wallet
info.

1. Go to **https://portal.cdp.coinbase.com/products/onchainkit**
2. Sign in (you can use your existing Coinbase account) and create a project
   if asked.
3. Copy the **Client API Key** shown on that page. Save it somewhere — you'll
   paste it into Vercel in step 4.

---

## 2. Put this code on GitHub

1. Go to **github.com** and sign in.
2. Click the **+** icon (top right) → **New repository**.
3. Name it something like `graphixel-tips`.
4. Leave it set to **Public** (or Private, your choice).
5. **Do not** check "Add a README file" — leave the repo empty.
6. Click **Create repository**.
7. On the new repo's page, click the link that says **"uploading an existing
   file"**.
8. On your computer, **unzip** the file I gave you. You'll get a folder called
   `graphixel-tips` containing `app`, `components`, `lib`, `package.json`,
   etc.
9. **Drag that whole folder** onto the GitHub upload page. GitHub will list
   all the files with their folders.
   - If dragging the folder doesn't work in your browser, try Chrome or Edge.
10. Scroll down and click **Commit changes**.

You should now see folders `app`, `components`, `lib` and files like
`package.json` in your repo.

---

## 3. Put your wallet address in

This tells the "Tip the creator" widget where tips should go.

1. In your GitHub repo, open `app` → `page.tsx`.
2. Click the **pencil (edit) icon**.
3. Find this line near the top:

   ```
   const CREATOR_ADDRESS = '0x0000000000000000000000000000000000dEaD' as const;
   ```

4. Replace the long `0x...dEaD` part with **your own wallet address** (copy
   it from MetaMask or Coinbase Wallet — it starts with `0x` and is 42
   characters long). Keep the quotes around it.
5. Scroll down and click **Commit changes**.

---

## 4. Deploy on Vercel

1. Go to **vercel.com** and sign in with your GitHub account.
2. Click **Add New...** → **Project**.
3. Find your `graphixel-tips` repo in the list and click **Import**.
4. Before clicking Deploy, open the **Environment Variables** section and add:
   - **Name:** `NEXT_PUBLIC_ONCHAINKIT_API_KEY`
   - **Value:** (paste the API key from step 1)
5. Click **Deploy** and wait about a minute.
6. Click the link Vercel gives you (something like
   `graphixel-tips.vercel.app`) to open your live site.

---

## Testing it

- Click **Connect Wallet** (top right) and connect MetaMask or Coinbase
  Wallet, set to the **Base** network.
- If your wallet has USDC on Base, try sending a small tip with the "Tip the
  creator" widget.
- Try "Send a tip to anyone" — paste an address, or type a basename like
  `name.base.eth`.
- Try the QR scan button (works best on a phone, or a laptop with a webcam —
  it'll ask for camera permission).
- If your wallet has **no USDC**, you should see an amber "not enough USDC"
  message — that's expected. The swap option will fill that spot next.

---

## If the build fails on Vercel

Click into the failed deployment and look at the build log — it'll usually
point to a missing or misspelled file/folder. The most common cause is a
folder not uploading correctly in step 2. You can check by browsing your repo
on GitHub: you should see `app/page.tsx`, `app/layout.tsx`,
`app/providers.tsx`, `app/globals.css`, `lib/wagmi.ts`, `lib/usdc.ts`, and the
three files in `components/`.

---

## What's next

Once this is live and working, the next piece is the swap widget (USDC ↔ ETH)
that fills in the "Swap widget goes here" box.
