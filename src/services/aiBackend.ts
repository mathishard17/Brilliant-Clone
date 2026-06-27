export async function postAiEndpoint<TRequest, TResponse>(
  path: string,
  payload: TRequest,
): Promise<TResponse> {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let detail = ''
    try {
      const errorPayload = await response.json()
      detail = typeof errorPayload?.error === 'string' ? `: ${errorPayload.error}` : ''
    } catch {
      // Keep the original status-only message if the server did not return JSON.
    }
    throw new Error(`AI endpoint failed with ${response.status}${detail}`)
  }

  return response.json() as Promise<TResponse>
}
