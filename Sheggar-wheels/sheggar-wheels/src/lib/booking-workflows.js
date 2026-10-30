export const bookingTransitions = Object.freeze({
  requested: ["confirmed", "declined", "cancelled"],
  confirmed: ["in_progress", "cancelled"],
  in_progress: ["completed", "disputed"],
  completed: ["reviewed"],
  disputed: ["resolved"],
});

export function canTransitionBooking(currentStatus, nextStatus) {
  return bookingTransitions[currentStatus]?.includes(nextStatus) ?? false;
}

const inactiveOverlapStatuses = new Set(["cancelled", "declined", "completed", "reviewed", "resolved"]);

export function hasActiveBookingOverlap(bookings, candidate) {
  return bookings.some((booking) =>
    booking.id !== candidate.id &&
    booking.carId === candidate.carId &&
    !inactiveOverlapStatuses.has(booking.status) &&
    candidate.startDate < booking.endDate &&
    candidate.endDate > booking.startDate
  );
}
