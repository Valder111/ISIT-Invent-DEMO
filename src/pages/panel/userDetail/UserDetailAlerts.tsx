export function UserDetailAlerts({ msg, saveErr }: { msg: string | null; saveErr: string | null }) {
  return (
    <>
      {msg && <div className="alert panel-user-detail__alert">{msg}</div>}
      {saveErr && <div className="alert alert--error panel-user-detail__alert">{saveErr}</div>}
    </>
  )
}
