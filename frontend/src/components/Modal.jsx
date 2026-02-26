export default function Modal({ title, onClose, onSubmit, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          background: "#fff",
          padding: 20,
          width: 320,
          borderRadius: 6,
        }}
      >
        <h3 style={{ marginBottom: 10 }}>{title}</h3>

        {children}

        <div style={{ marginTop: 15, textAlign: "right" }}>
          <button type="submit">Save</button>
          <button
            type="button"
            onClick={onClose}
            style={{ marginLeft: 10 }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
