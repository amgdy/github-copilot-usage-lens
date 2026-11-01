import { CollectionReader } from './read';
import type { Collection } from './types';

/** The longest line the reader takes. A longer line is counted as skipped. */
export const MAX_LINE_CHARS = 8 * 1024 * 1024;

/** How long the reader works before it lets the page draw again, in milliseconds. */
const WORK_SLICE_MS = 50;

/** Waits for the next task, so the browser can draw and take clicks while a large file is read. */
const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** True when the file starts with the two gzip bytes. */
export async function isGzip(blob: Blob): Promise<boolean> {
  const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  return head.length === 2 && head[0] === 0x1f && head[1] === 0x8b;
}

/** The text of a file as a stream, unpacked first when the file is gzip. */
async function textStream(blob: Blob): Promise<ReadableStream<string>> {
  let bytes: ReadableStream<BufferSource> = blob.stream();
  if (await isGzip(blob)) bytes = bytes.pipeThrough(new DecompressionStream('gzip'));
  return bytes.pipeThrough(new TextDecoderStream());
}

/** The first characters of a file, unpacked when it is gzip. A damaged file gives what could be read. */
export async function readHeadText(blob: Blob, maxChars: number): Promise<string> {
  let head = '';
  try {
    const chunks = (await textStream(blob)).getReader();
    try {
      while (head.length < maxChars) {
        const { value, done } = await chunks.read();
        if (done) break;
        head += value;
      }
    } finally {
      await chunks.cancel().catch(() => undefined);
    }
  } catch {
    // Keep what was read before the error.
  }
  return head.slice(0, maxChars);
}

/**
 * Reads a file of the collector scripts (NDJSON, gzip or plain) line by line, so a large file never has to fit in
 * memory as one text. Throws a CollectionError when the file is not a collector file. When the file stops early
 * (cut off or damaged), the lines read so far are kept and the collection is marked as not complete.
 */
export async function readCollection(blob: Blob, fileName: string): Promise<Collection> {
  const reader = new CollectionReader();
  const chunks = (await textStream(blob)).getReader();
  let pieces: string[] = [];
  let pendingChars = 0;
  let tooLong = false;
  const endLine = (last: string): void => {
    if (tooLong || pendingChars + last.length > MAX_LINE_CHARS) reader.skipLine();
    else reader.push(pieces.length === 0 ? last : pieces.join('') + last);
    pieces = [];
    pendingChars = 0;
    tooLong = false;
  };
  let sliceStart = performance.now();
  try {
    for (;;) {
      if (performance.now() - sliceStart > WORK_SLICE_MS) {
        await nextTask();
        sliceStart = performance.now();
      }
      const { value, done } = await chunks.read();
      if (done) break;
      let start = 0;
      for (;;) {
        const newline = value.indexOf('\n', start);
        if (newline === -1) {
          const tail = value.slice(start);
          if (!tooLong && pendingChars + tail.length > MAX_LINE_CHARS) {
            tooLong = true;
            pieces = [];
            pendingChars = 0;
          } else if (!tooLong) {
            pieces.push(tail);
            pendingChars += tail.length;
          }
          break;
        }
        endLine(value.slice(start, newline));
        start = newline + 1;
      }
    }
    if (tooLong || pendingChars > 0) endLine('');
  } catch (error) {
    // A file that is cut off still gives the lines before the cut, as long as its header was read.
    if (!reader.started) throw error;
  } finally {
    await chunks.cancel().catch(() => undefined);
  }
  return reader.finish(fileName);
}
