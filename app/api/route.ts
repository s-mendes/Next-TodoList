export async function GET(request: Request) {
  return new Response("Olá mundo!", {
    status: 200,
  });
}
