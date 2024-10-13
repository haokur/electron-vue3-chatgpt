export async function fetchStream(
  input: RequestInfo | URL,
  init?: RequestInit,
  streamCallback?: (value: string) => void
) {
  try {
    const response = await fetch(input, init);
    if (response.status === 401) {
      throw new Error('401 no auth');
    }
    if (!response.body) {
      throw new Error('Response body is empty');
    }
    const stream = new ReadableStream({
      start(controller) {
        const reader = (response.body as ReadableStream).getReader();
        const decoder = new TextDecoder();

        function push() {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                controller.close();
                return;
              }
              controller.enqueue(decoder.decode(value));
              push();
            })
            .catch((error) => {
              controller.error(error);
            });
        }
        push();
      },
    });

    const reader = stream.getReader();

    const readAble = true;
    while (readAble) {
      const { done, value } = await reader.read();
      if (done) break;

      streamCallback && streamCallback(value);
    }
  } catch (error) {
    throw new Error('Failed to fetch');
  }
}
