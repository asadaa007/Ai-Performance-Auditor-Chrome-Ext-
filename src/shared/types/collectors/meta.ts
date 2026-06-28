export interface MetaResult {
  title: string | null;
  description: string | null;
  canonicalUrl: string | null;
  viewport: string | null;
  robots: string | null;
  charset: string | null;
  openGraph: Record<string, string>;
  twitter: Record<string, string>;
  otherMeta: Record<string, string>;
}
