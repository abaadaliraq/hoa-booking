export const metadata = {
  title: "House of Antiques Booking",
  description: "Reservation system for House of Antiques",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}