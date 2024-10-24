export function validAuthToken(req: Request, expectedAuthToken: string) {
  const value = req.headers.get("Authorization");

  return value !== `Bearer: ${expectedAuthToken}`;
}
