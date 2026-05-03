import { useEffect, useId, useState } from "react";

const MIN_GRID = 1;
const MAX_GRID = 100;

export default function SetSizeDialog({ open, initialSize, onClose, onConfirm }) {
  const titleId = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }
    setValue(String(initialSize));
    setError("");
  }, [open, initialSize]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function handleBackdropPointerDown(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const n = Number.parseInt(String(value).trim(), 10);
    if (Number.isNaN(n) || n < MIN_GRID || n > MAX_GRID) {
      setError(`Enter a whole number from ${MIN_GRID} to ${MAX_GRID}.`);
      return;
    }
    onConfirm(n);
    onClose();
  }

  return (
    <div
      className="set-size-dialog-backdrop"
      onPointerDown={handleBackdropPointerDown}
      role="presentation"
    >
      <div
        className="set-size-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="set-size-dialog__title">
          Grid size
        </h2>
        <p className="set-size-dialog__hint">
          Square grid from {MIN_GRID}×{MIN_GRID} to {MAX_GRID}×{MAX_GRID} pixels.
        </p>
        <form className="set-size-dialog__form" onSubmit={handleSubmit}>
          <label className="set-size-dialog__label" htmlFor="set-size-input">
            Size
          </label>
          <input
            id="set-size-input"
            className="set-size-dialog__input"
            type="number"
            min={MIN_GRID}
            max={MAX_GRID}
            step={1}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            autoComplete="off"
            autoFocus
          />
          {error ? (
            <p className="set-size-dialog__error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="set-size-dialog__actions">
            <button type="button" className="set-size-dialog__btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="set-size-dialog__btn set-size-dialog__btn--primary">
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
