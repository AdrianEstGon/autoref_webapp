export const metadata = {
  title: 'AutoRef',
  description: 'Aplicación de gestión deportiva',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
