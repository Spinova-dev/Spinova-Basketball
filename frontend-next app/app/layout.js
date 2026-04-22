import "./globals.css";

export const metadata = {
  title: "Spinova Demo",
  description: "Spinova basketball demo in Next.js"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.logout = async function logout() {
                try {
                  await fetch('/api/auth/logout', { method: 'POST' });
                } finally {
                  window.location.href = '/login';
                }
              };
            `
          }}
        />
        {children}
      </body>
    </html>
  );
}
