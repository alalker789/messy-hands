export default function Toast({ toast }) {
  return (
    <div className={`toast${toast ? ' s' : ''}`} role="status" aria-live="polite">
      {toast?.title}{toast?.sub && <small>{toast.sub}</small>}
    </div>
  );
}
