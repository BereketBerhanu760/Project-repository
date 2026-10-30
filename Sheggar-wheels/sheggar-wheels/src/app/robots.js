export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/cars"],
      disallow: ["/admin", "/owner", "/dashboard", "/bookings", "/checkout", "/signin", "/signup"],
    },
  };
}
