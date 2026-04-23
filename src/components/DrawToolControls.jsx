export default function DrawToolControls({ isDrawActive, isErase, onDrawBrush, onErase }) {
  return (
    <>
      <button type="button" onClick={onDrawBrush}>
        {isDrawActive ? "Color ✓" : "Color"}
      </button>
      <button type="button" onClick={onErase}>
        {isErase ? "Erase ✓" : "Erase"}
      </button>
    </>
  );
}
