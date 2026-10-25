import Link from "next/link";
export default function NotFound() { return <main className="workspace"><div className="workspace-content"><h1>That page isn’t here.</h1><p>Your demo records haven’t changed. Return to the workspace or continue the guided demo.</p><Link className="primary-button" href="/demo/">Continue guided demo</Link> <Link href="/jobs/">Open job registry</Link></div></main>; }
