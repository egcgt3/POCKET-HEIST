import { render, screen } from "@testing-library/react"
import Avatar from "@/components/Avatar"

describe("Avatar", () => {
  it("renders the first letter of a plain name", () => {
    render(<Avatar name="Alice" />)
    expect(screen.getByText("A")).toBeInTheDocument()
  })

  it("renders the first two uppercase letters for a PascalCase name", () => {
    render(<Avatar name="JohnDoe" />)
    expect(screen.getByText("JD")).toBeInTheDocument()
  })

  it("renders only the first letter when name has a single uppercase", () => {
    render(<Avatar name="Charlie" />)
    expect(screen.getByText("C")).toBeInTheDocument()
  })
})
