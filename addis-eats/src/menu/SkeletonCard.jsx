function SkeletonCard() {
  return (
    <article className="menu_card skeleton-card" aria-hidden="true">
      <div className="skeleton-block skeleton-image" />
      <div className="menu_card_details">
        <div className="skeleton-block skeleton-title" />
        <div className="skeleton-block skeleton-description" />
        <div className="skeleton-block skeleton-description skeleton-description-short" />
        <div className="skeleton-block skeleton-details" />
        <div className="skeleton-block skeleton-price" />
        <div className="skeleton-block skeleton-button" />
      </div>
    </article>
  );
}

export default SkeletonCard;