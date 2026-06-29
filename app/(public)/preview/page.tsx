// preview page for newly created UI components
import Skeleton from "@/components/Skeleton";
import Avatar from "@/components/Avatar";
import Footer from "@/components/Footer";
import Badge from "@/components/Badge";

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

      <section>
        <h3>Badge</h3>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Badge variant="active" />
          <Badge variant="assigned" />
          <Badge variant="success" />
          <Badge variant="failure" />
        </div>
      </section>

      <section>
        <h3>Footer</h3>
        <Footer />
      </section>
    </div>
  );
}
