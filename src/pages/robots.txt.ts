export const prerender = true;

export function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Sitemap: https://perceptindex.com/sitemap-index.xml', 
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}