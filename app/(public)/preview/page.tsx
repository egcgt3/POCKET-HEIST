// preview page for newly created UI components
import Skeleton from "@/components/Skeleton"
import Avatar from "@/components/Avatar"

export default function PreviewPage() {
  return (
    <div className="page-content">
      <h2>Preview</h2>

      <section>
        <h3>Skeleton</h3>
        <Skeleton />
      </section>

      <section>
        <h3>Avatar</h3>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Avatar name="Alice" />
          <Avatar name="JohnDoe" />
          <Avatar name="PocketHeist" />
        </div>
      </section>
    </div>
  )
}
