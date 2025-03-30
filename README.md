This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
### Build environment
To run this project you need to install `Node.js 12.22.0` or higer version.

Clone this repo:
```
git clone https://github.com/CloudFan-cyf/robot-monitor.git
cd robot-monitor
```
### Run devlopoment server
First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Updating server URL
Update server url in `app/page.tsx`(line 85) to connect to your own server:
```Typescript
const connect = () => {
      ws = new WebSocket('ws://localhost:80/ws') // update `localhost:80` to `your_server_url:your_port`
...
```
Flash the web page, you should be able to connect your server and see the events and status of the robots.


