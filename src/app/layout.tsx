import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/app/ui/global.css';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '机器人状态监控',
  description: '机器人实时状态监控系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
