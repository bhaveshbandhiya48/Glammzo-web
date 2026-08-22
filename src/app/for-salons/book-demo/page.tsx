import { redirect } from "next/navigation"

/** Legacy path — QR / printed cards use /book-demo. */
export default function ForSalonsBookDemoRedirect() {
  redirect("/book-demo")
}
