export default function ProductGallery() {
  return (
    <div className="product-gallery">
      <div className="product-main-img">
        <div className="ring" />
      </div>
      <div className="thumbs">
        {[1, 2, 3, 4, 5].map((n) => (
          <div className="thumb" key={n}>
            <div className="ring" />
          </div>
        ))}
      </div>
    </div>
  );
}
