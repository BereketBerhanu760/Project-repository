const earningStatuses = new Set([
  "confirmed",
  "in_progress",
  "completed",
  "reviewed",
  "disputed",
  "resolved",
]);

export function getMonthlyCarStats(car, bookings, now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const start = Date.UTC(year, month, 1);
  const end = Date.UTC(year, month + 1, 1);
  const daysInMonth = (end - start) / 86400000;
  const carBookings = bookings.filter(
    (booking) => booking.carId === car.id && earningStatuses.has(booking.status),
  );
  const monthlyBookings = carBookings.filter((booking) => {
    const bookingStart = Date.parse(`${booking.startDate}T00:00:00Z`);
    const bookingEnd = Date.parse(`${booking.endDate}T00:00:00Z`);
    return Number.isFinite(bookingStart) && Number.isFinite(bookingEnd) && bookingStart < end && bookingEnd > start;
  });
  const bookedDays = carBookings.reduce((sum, booking) => {
    const bookingStart = Date.parse(`${booking.startDate}T00:00:00Z`);
    const bookingEnd = Date.parse(`${booking.endDate}T00:00:00Z`);
    if (!Number.isFinite(bookingStart) || !Number.isFinite(bookingEnd)) return sum;
    const overlap = Math.max(0, Math.min(end, bookingEnd) - Math.max(start, bookingStart));
    return sum + overlap / 86400000;
  }, 0);

  return {
    carId: car.id,
    name: car.name,
    bookingCount: carBookings.length,
    bookingValue: carBookings.reduce((sum, booking) => sum + Number(booking.total || 0), 0),
    monthlyBookingValue: monthlyBookings.reduce((sum, booking) => sum + Number(booking.total || 0), 0),
    bookedDays,
    utilization: Math.min(100, Math.round((bookedDays / daysInMonth) * 100)),
  };
}
